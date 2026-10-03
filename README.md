# toernzeit.ch

Statische Seite ohne Build-Schritt (wie timber-frame). Deploy über Netlify direkt aus `main`.

- `index.html` – Startseite
- `bilder/` – optimierte JPGs der Startseite
- `schrift/` – Archivo, selbst gehostet
- `sardinien-korsika-2027/` – Törnseite, unverändert von timber-frame.ch übernommen

Neuen Törn im Countdown eintragen: in `index.html` die Liste `toerns` im Script am Seitenende ergänzen.

## Reservationssystem

- `netlify/functions/` – drei Funktionen: `plaetze` (öffentlich, freie Plätze), `reservieren` (öffentlich, neue Reservation), `admin` (passwortgeschützt)
- `netlify/lib/store.mjs` – Törn-Liste mit Kapazität (hier neue Törns eintragen) und Zugriff auf Netlify Blobs
- `admin/` – Verwaltungsseite unter toernzeit.ch/admin/
- Daten liegen in Netlify Blobs (Store «reservationen»), nicht im Repo

Einmalig in Netlify einrichten:
1. Project configuration → Environment variables → `ADMIN_PASSWORD` setzen
2. Forms → Form detection aktivieren; nach dem nächsten Deploy unter Forms → reservation → Notifications eine E-Mail-Benachrichtigung anlegen
