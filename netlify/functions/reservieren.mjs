import { TOERNS, lesen, schreiben, zusammenfassung, plaetzeVon, json } from "../lib/store.mjs";

const putzen = (s, max = 200) => String(s ?? "").trim().slice(0, max);

export default async (req) => {
  if (req.method !== "POST") return json({ fehler: "Nur POST" }, 405);
  let b;
  try { b = await req.json(); } catch { return json({ fehler: "Ungültige Anfrage" }, 400); }

  const toern = putzen(b.toern, 40);
  const t = TOERNS[toern];
  if (!t) return json({ fehler: "Unbekannter Törn" }, 400);

  const name = putzen(b.name, 120), email = putzen(b.email, 160), telefon = putzen(b.telefon, 60);
  const personen = Math.min(Math.max(parseInt(b.personen, 10) || 1, 1), t.plaetze);
  const einzelkabine = !!b.einzelkabine && t.einzelkabine && personen === 1;
  const bemerkung = putzen(b.bemerkung, 600);
  if (name.length < 2) return json({ fehler: "Bitte Namen angeben" }, 400);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ fehler: "Bitte gültige E-Mail angeben" }, 400);
  if (b.website) return json({ ok: true }); // Honeypot gegen Bots

  const eintrag = { id: crypto.randomUUID(), name, email, telefon, personen, einzelkabine, bemerkung, status: "reserviert", quelle: "web", erstellt: new Date().toISOString() };
  const liste = await lesen(toern);
  const z = zusammenfassung(toern, liste);
  if (plaetzeVon(eintrag) > z.frei) return json({ fehler: `Nur noch ${z.frei} ${z.frei === 1 ? "Platz" : "Plätze"} frei. Schreib mir, ich führe gern eine Warteliste.` }, 409);
  liste.push(eintrag);
  await schreiben(toern, liste);

  // Benachrichtigung über Netlify Forms (Formular "reservation" in index.html)
  try {
    const url = new URL(req.url).origin + "/";
    const form = new URLSearchParams({
      "form-name": "reservation", toern: `${t.name} (${t.datum})`, name, email, telefon,
      personen: einzelkabine ? "1 (Doppelkabine allein)" : String(personen), bemerkung,
    });
    await fetch(url, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: form });
  } catch {}

  return json({ ok: true, ...zusammenfassung(toern, liste) });
};

export const config = { path: "/api/reservieren" };
