INSERT INTO api_config (
         id,
         name,
         endpoint,
         api_key,
         active,
         delay,
         config,
         last_update,
         created_at,
         updated_at
) VALUES (
        gen_random_uuid(),
        'CoinGecko',
        'https://api.coingecko.com/api/v3/',
        null,
        true,
        1800,
        '{
                  "base_currencies": [
                    {
                      "name": "USDT",
                      "id": "tether"
                    },
                    {
                      "name": "TON",
                      "id": "the-open-network"
                    }
                  ],
                  "vs_currencies": [
                    "usd",
                    "eth"
                  ]
                }',
        null,
        now(),
        now());
