# AIshopr PHP/MySQL Blueprint

Dieser Ordner bereitet die spätere IONOS-/PHP-Version vor. Er ist noch nicht aktiv in der GitHub-Pages-Version.

## Zielarchitektur

```text
/backend-php/config.example.php
/backend-php/schema.sql
/backend-php/endpoints/products/list.php
/backend-php/endpoints/products/save.php
/backend-php/endpoints/settings/load.php
/backend-php/endpoints/settings/save.php
/backend-php/endpoints/auth/login.php
/backend-php/endpoints/tracking/click.php
```

## Produktionsregeln

1. Keine API-Keys im Frontend.
2. Admin-Passwörter nur gehasht speichern.
3. Sessions serverseitig oder mit signierten Tokens absichern.
4. Produktdaten in MySQL speichern.
5. JSON-Dateien nur noch als Seed/Fallback nutzen.
6. Affiliate-Klicks serverseitig speichern.

## IONOS-Hinweis

Für einfachen IONOS-Webspace sollte die PHP-Version ohne Node/Build-Prozess laufen. Ziel ist klassisches PHP 8.x + MySQL/MariaDB + statische Assets.
