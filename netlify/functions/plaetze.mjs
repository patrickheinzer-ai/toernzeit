import { TOERNS, lesen, zusammenfassung, json } from "../lib/store.mjs";

export default async () => {
  const out = {};
  for (const id of Object.keys(TOERNS)) out[id] = zusammenfassung(id, await lesen(id));
  return json(out);
};

export const config = { path: "/api/plaetze" };
