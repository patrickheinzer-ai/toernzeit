import { TOERNS, STATUS, lesen, schreiben, zusammenfassung, plaetzeVon, json, adminOk } from "../lib/store.mjs";

export default async (req) => {
  if (!adminOk(req)) return json({ fehler: "Nicht angemeldet" }, 401);

  if (req.method === "GET") {
    const out = {};
    for (const id of Object.keys(TOERNS)) {
      const liste = await lesen(id);
      out[id] = { ...zusammenfassung(id, liste), eintraege: liste };
    }
    return json(out);
  }

  if (req.method !== "POST") return json({ fehler: "Nur GET/POST" }, 405);
  let b;
  try { b = await req.json(); } catch { return json({ fehler: "Ungültige Anfrage" }, 400); }
  const toern = String(b.toern || "");
  const t = TOERNS[toern];
  if (!t) return json({ fehler: "Unbekannter Törn" }, 400);
  const liste = await lesen(toern);

  if (b.aktion === "status") {
    const e = liste.find(x => x.id === b.id);
    if (!e) return json({ fehler: "Eintrag nicht gefunden" }, 404);
    if (!STATUS.includes(b.status)) return json({ fehler: "Ungültiger Status" }, 400);
    e.status = b.status; e.geaendert = new Date().toISOString();
  } else if (b.aktion === "loeschen") {
    const i = liste.findIndex(x => x.id === b.id);
    if (i < 0) return json({ fehler: "Eintrag nicht gefunden" }, 404);
    liste.splice(i, 1);
  } else if (b.aktion === "neu") {
    const personen = Math.min(Math.max(parseInt(b.personen, 10) || 1, 1), t.plaetze);
    const eintrag = {
      id: crypto.randomUUID(), name: String(b.name || "").trim().slice(0, 120), email: String(b.email || "").trim().slice(0, 160),
      telefon: String(b.telefon || "").trim().slice(0, 60), personen, einzelkabine: !!b.einzelkabine && t.einzelkabine && personen === 1,
      bemerkung: String(b.bemerkung || "").trim().slice(0, 600), status: STATUS.includes(b.status) ? b.status : "reserviert",
      quelle: "admin", erstellt: new Date().toISOString(),
    };
    if (eintrag.name.length < 2) return json({ fehler: "Bitte Namen angeben" }, 400);
    liste.push(eintrag);
  } else if (b.aktion === "bearbeiten") {
    const e = liste.find(x => x.id === b.id);
    if (!e) return json({ fehler: "Eintrag nicht gefunden" }, 404);
    for (const k of ["name", "email", "telefon", "bemerkung"]) if (k in b) e[k] = String(b[k] || "").trim().slice(0, 600);
    if ("personen" in b) e.personen = Math.min(Math.max(parseInt(b.personen, 10) || 1, 1), t.plaetze);
    if ("einzelkabine" in b) e.einzelkabine = !!b.einzelkabine && t.einzelkabine && e.personen === 1;
    e.geaendert = new Date().toISOString();
  } else {
    return json({ fehler: "Unbekannte Aktion" }, 400);
  }

  await schreiben(toern, liste);
  return json({ ...zusammenfassung(toern, liste), eintraege: liste });
};

export const config = { path: "/api/admin" };
