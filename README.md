# AIshopr Web-App

Dieses Repository enthält die AIshopr Web-App für GitHub Pages.

## Aktuelle Projektstruktur

```text
/index.html
/css/styles.css
/js/app.js
/data/categories.json
/data/settings.default.json
/data/products.json
```

## Live-Test

```text
https://xturn2u.github.io/new_sho_project_draft/
```

Bei Cache-Problemen mit Versionsparameter testen:

```text
https://xturn2u.github.io/new_sho_project_draft/?v=fix5
```

## Entwicklungsstand

- Die frühere Single-File-App wurde in HTML, CSS und JavaScript getrennt.
- Fix 4 mit Runtime-Diagnose und Fehlerbehandlung ist aktiv.
- Fix 5 hat den Ordner `/data` vorbereitet.
- Kategorien und Standard-Settings liegen zusätzlich als JSON-Dateien vor.
- `products.json` ist als externer Produktkatalog vorbereitet.

## Wichtig

Die App nutzt aktuell weiterhin interne Fallback-Daten in `js/app.js`, damit die Seite stabil bleibt. Die externen JSON-Dateien sind die vorbereitete Datenbasis für die nächsten Umbauten.

## Nächste Schritte

1. Produktdaten vollständig aus `js/app.js` in `/data/products.json` auslagern.
2. `js/app.js` weiter modularisieren.
3. Admin-Produktpflege an externe Datenstruktur anpassen.
4. Spätere Migration auf PHP/MySQL vorbereiten.
