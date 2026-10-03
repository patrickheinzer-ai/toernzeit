import { getStore } from "@netlify/blobs";

// Törns und ihre Kapazität. Neue Törns hier eintragen.
export const TOERNS = {
  "woche-1": { name: "Segeln ab Sardinien, KW 36", datum: "4.–11. September 2027", plaetze: 8, einzelkabine: false },
  "woche-2": { name: "Segeln ab Sardinien, KW 37", datum: "11.–18. September 2027", plaetze: 8, einzelkabine: true },
};

export const STATUS = ["reserviert", "gebucht"];

const store = () => getStore({ name: "reservationen", consistency: "strong" });

export async function lesen(toern) {
  return (await store().get(toern, { type: "json" })) || [];
}

export async function schreiben(toern, liste) {
  await store().setJSON(toern, liste);
}

// Ein Eintrag belegt so viele Plätze wie Personen; Einzelkabine belegt 2.
export function plaetzeVon(e) {
  return e.einzelkabine ? 2 : Number(e.personen) || 1;
}

export function zusammenfassung(toern, liste) {
  const t = TOERNS[toern];
  const gebucht = liste.filter(e => e.status === "gebucht").reduce((s, e) => s + plaetzeVon(e), 0);
  const reserviert = liste.filter(e => e.status === "reserviert").reduce((s, e) => s + plaetzeVon(e), 0);
  return { name: t.name, datum: t.datum, plaetze: t.plaetze, gebucht, reserviert, frei: Math.max(0, t.plaetze - gebucht - reserviert), einzelkabine: t.einzelkabine };
}

export const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });

export function adminOk(req) {
  const soll = Netlify.env.get("ADMIN_PASSWORD");
  if (!soll) return false;
  const auth = req.headers.get("authorization") || "";
  return auth === `Bearer ${soll}`;
}
