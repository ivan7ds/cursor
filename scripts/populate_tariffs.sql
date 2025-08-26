-- Populate basic tariffs for the CPO
-- This script creates standard pricing structures

-- Clear existing tariffs
DELETE FROM tariffs;

-- Insert basic tariffs
INSERT INTO tariffs (id, country_code, party_id, currency, type, elements, last_updated, created_at, updated_at) VALUES
('tariff-001', 'ES', 'ES-CPO', 'EUR', 'REGULAR', '[
    {
        "price_components": [
            {
                "type": "ENERGY",
                "price": 0.25,
                "step_size": 1
            }
        ]
    }
]', NOW(), NOW(), NOW()),

('tariff-002', 'ES', 'ES-CPO', 'EUR', 'FAST', '[
    {
        "price_components": [
            {
                "type": "ENERGY",
                "price": 0.35,
                "step_size": 1
            }
        ]
    }
]', NOW(), NOW(), NOW()),

('tariff-003', 'ES', 'ES-CPO', 'EUR', 'ULTRA_FAST', '[
    {
        "price_components": [
            {
                "type": "ENERGY",
                "price": 0.45,
                "step_size": 1
            }
        ]
    }
]', NOW(), NOW(), NOW()),

('tariff-004', 'PT', 'ES-CPO', 'EUR', 'REGULAR', '[
    {
        "price_components": [
            {
                "type": "ENERGY",
                "price": 0.23,
                "step_size": 1
            }
        ]
    }
]', NOW(), NOW(), NOW()),

('tariff-005', 'PT', 'ES-CPO', 'EUR', 'FAST', '[
    {
        "price_components": [
            {
                "type": "ENERGY",
                "price": 0.33,
                "step_size": 1
            }
        ]
    }
]', NOW(), NOW(), NOW()),

('tariff-006', 'PT', 'ES-CPO', 'EUR', 'ULTRA_FAST', '[
    {
        "price_components": [
            {
                "type": "ENERGY",
                "price": 0.43,
                "step_size": 1
            }
        ]
    }
]', NOW(), NOW(), NOW());

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Inserted % tariffs', (SELECT COUNT(*) FROM tariffs);
END $$;
