-- Insert test tariffs for Spain
INSERT INTO tariffs (
  id,
  country_code,
  party_id,
  currency,
  type,
  elements,
  start_date_time,
  end_date_time,
  last_updated
) VALUES (
  'tariff-001',
  'ES',
  'ES-CPO',
  'EUR',
  'REGULAR',
  '[{"price_components": [{"type": "ENERGY", "price": 0.25, "step_size": 1}], "restrictions": {"day_of_week": [1, 2, 3, 4, 5, 6, 7]}}]',
  NULL,
  NULL,
  NOW()
);

INSERT INTO tariffs (
  id,
  country_code,
  party_id,
  currency,
  type,
  elements,
  start_date_time,
  end_date_time,
  last_updated
) VALUES (
  'tariff-002',
  'ES',
  'ES-CPO',
  'EUR',
  'PROFILE_FAST',
  '[{"price_components": [{"type": "ENERGY", "price": 0.35, "step_size": 1}], "restrictions": {"day_of_week": [1, 2, 3, 4, 5, 6, 7]}}]',
  NULL,
  NULL,
  NOW()
);

INSERT INTO tariffs (
  id,
  country_code,
  party_id,
  currency,
  type,
  elements,
  start_date_time,
  end_date_time,
  last_updated
) VALUES (
  'tariff-003',
  'ES',
  'ES-CPO',
  'EUR',
  'PROFILE_GREEN',
  '[{"price_components": [{"type": "ENERGY", "price": 0.20, "step_size": 1}], "restrictions": {"day_of_week": [1, 2, 3, 4, 5, 6, 7]}}]',
  NULL,
  NULL,
  NOW()
);

-- Insert test tariffs for Portugal
INSERT INTO tariffs (
  id,
  country_code,
  party_id,
  currency,
  type,
  elements,
  start_date_time,
  end_date_time,
  last_updated
) VALUES (
  'tariff-004',
  'PT',
  'ES-CPO',
  'EUR',
  'REGULAR',
  '[{"price_components": [{"type": "ENERGY", "price": 0.28, "step_size": 1}], "restrictions": {"day_of_week": [1, 2, 3, 4, 5, 6, 7]}}]',
  NULL,
  NULL,
  NOW()
);

INSERT INTO tariffs (
  id,
  country_code,
  party_id,
  currency,
  type,
  elements,
  start_date_time,
  end_date_time,
  last_updated
) VALUES (
  'tariff-005',
  'PT',
  'ES-CPO',
  'EUR',
  'PROFILE_FAST',
  '[{"price_components": [{"type": "ENERGY", "price": 0.38, "step_size": 1}], "restrictions": {"day_of_week": [1, 2, 3, 4, 5, 6, 7]}}]',
  NULL,
  NULL,
  NOW()
);
