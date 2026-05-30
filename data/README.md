# Data Directory

Dieser Ordner ist die Vorbereitung für die Trennung von App-Code und App-Daten.

## Dateien

- `categories.json` enthält die Standard-Kategorien.
- `settings.default.json` enthält die Standard-Einstellungen.
- `products.json` ist als externer Produktkatalog vorbereitet.

## Aktueller Stand Fix 5

Die App enthält weiterhin interne Fallback-Daten in `js/app.js`, damit GitHub Pages stabil bleibt. Die Daten-Dateien sind nun vorhanden und können in den nächsten Schritten durch echte Lade- und Admin-Logik angebunden werden.

## Ziel

Langfristig soll `products.json` beziehungsweise später MySQL die Produktdaten liefern. Damit werden Affiliate-Importe und Produktpflege sauber von der App-Logik getrennt.
