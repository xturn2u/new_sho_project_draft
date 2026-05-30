<?php
// AIshopr config example — copy to config.php on your server and fill values.
// Never commit real secrets.

return [
    'db' => [
        'host' => 'localhost',
        'name' => 'aishopr',
        'user' => 'db_user',
        'pass' => 'db_password',
        'charset' => 'utf8mb4',
    ],
    'security' => [
        'session_lifetime_minutes' => 120,
        'allowed_origins' => ['https://example.com'],
    ],
    'openai' => [
        'api_key' => '',
        'model' => 'gpt-4o-mini',
    ],
    'affiliate' => [
        'amazon_tag' => '',
        'awin_id' => '',
        'ebay_campaign_id' => '',
    ],
];
