# AIshopr API Blueprint

Dieser Ordner beschreibt die spätere PHP/API-Schicht. Auf GitHub Pages wird PHP nicht ausgeführt. Die Dateien in diesem Ordner sind zunächst Verträge, Beispiele und Migrationshilfe.

## Ziel

Die Frontend-App soll später nicht mehr direkt aus `data/products.json` und LocalStorage arbeiten, sondern über API-Endpunkte:

```text
/api/products/list.php
/api/products/save.php
/api/products/import.php
/api/settings/load.php
/api/settings/save.php
/api/auth/login.php
/api/tracking/click.php
```

## Betriebsarten

### Aktuell: JSON-Modus

- Produkte aus `/data/products.json`
- Kategorien aus `/data/categories.json`
- Settings aus `/data/settings.default.json` plus LocalStorage
- Admin ist nur Demo/Admin-UI, keine echte Sicherheit

### Später: API/MySQL-Modus

- Produkte aus MySQL
- Admin-Login serverseitig
- Passwörter serverseitig gehasht
- OpenAI-Key nur serverseitig
- Affiliate-Klicks serverseitig gespeichert

## Wichtig

Keine echten Secrets in Frontend-Dateien speichern. GitHub Pages ist rein statisch und bietet keine serverseitige Sicherheit.
