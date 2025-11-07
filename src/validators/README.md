# OCPI 2.2 Validators

Sistema de validación de payloads para endpoints OCPI 2.2 según la especificación oficial.

## Estructura

```
src/validators/
├── tokenValidators.js          # Validadores para Token module
├── __tests__/
│   └── tokenValidators.test.js # Tests unitarios
└── README.md                   # Esta documentación
```

## Utilidades Base OCPI

El archivo `src/utils/ocpiValidators.js` contiene los validadores base según OCPI 2.2:

### Tipos Base

#### `ciString(maxLength)`
**CiString** - Case Insensitive String. Solo ASCII imprimible.
- No permite caracteres de control (carriage returns, tabs, line breaks)
- Patrón: `/^[\x20-\x7E]*$/`

```javascript
const { ciString } = require('../utils/ocpiValidators');
const schema = Joi.object({
  country_code: ciString(2).required()
});
```

#### `dateTime()`
**DateTime** - RFC 3339 en UTC, string(25).
- Formatos válidos:
  - `2015-06-29T20:39:09Z`
  - `2015-06-29T20:39:09`
  - `2016-12-29T17:45:09.2Z`
  - `2018-01-01T01:08:01.123Z`
- **NO permite** timezone offset como `+00:00`
- Debe ser UTC (con Z o sin timezone designator)

```javascript
const { dateTime } = require('../utils/ocpiValidators');
const schema = Joi.object({
  last_updated: dateTime().required()
});
```

#### `ocpiString(maxLength)`
**String** - Case Sensitive String. Solo UTF-8 imprimible.
- No permite caracteres de control
- Patrón: `/^[^\x00-\x1F\x7F]*$/`

```javascript
const { ocpiString } = require('../utils/ocpiValidators');
const schema = Joi.object({
  issuer: ocpiString(64).required()
});
```

#### `ocpiNumber()`
**Number** - Número JSON con 4 decimales por defecto.

```javascript
const { ocpiNumber } = require('../utils/ocpiValidators');
const schema = Joi.object({
  price: ocpiNumber().required()
});
```

#### `languageCode()`
**Language Code** - Código ISO 639-1 (2 caracteres).
- Valida contra lista completa de códigos ISO 639-1
- Ejemplos: 'es', 'en', 'fr', 'de', 'pt'

```javascript
const { languageCode } = require('../utils/ocpiValidators');
const schema = Joi.object({
  language: languageCode().optional()
});
```

## Token Validators

### Endpoint: `PUT /ocpi/cpo/2.2/tokens/{country_code}/{party_id}/{uid}`

#### Uso

```javascript
const { validateTokenPutMiddleware } = require('../validators/tokenValidators');

router.put('/:country_code/:party_id/:uid',
  validateTokenPutMiddleware,
  async (req, res) => {
    // req.validatedToken contiene los datos validados
    const tokenData = req.validatedToken;
    // ... lógica del endpoint
  }
);
```

#### Campos Validados

| Campo | Tipo | Card. | Validación |
|-------|------|-------|------------|
| `country_code` | CiString(2) | 1 | ISO-3166 alpha-2 |
| `party_id` | CiString(3) | 1 | ISO-15118 standard |
| `uid` | CiString(36) | 1 | Unique ID |
| `type` | TokenType | 1 | AD_HOC_USER, APP_USER, OTHER, RFID |
| `contract_id` | CiString(36) | 1 | Contract identifier |
| `visual_number` | string(64) | ? | Visual readable number |
| `issuer` | string(64) | 1 | Issuing company |
| `group_id` | CiString(36) | ? | Token group ID |
| `valid` | boolean | 1 | Is token valid |
| `whitelist` | WhitelistType | 1 | ALWAYS, ALLOWED, ALLOWED_OFFLINE, NEVER |
| `language` | string(2) | ? | ISO 639-1 code |
| `default_profile_type` | ProfileType | ? | CHEAP, FAST, GREEN, REGULAR |
| `energy_contract` | EnergyContract | ? | Energy supplier info |
| `last_updated` | DateTime | 1 | RFC 3339 UTC |

#### EnergyContract Object

| Campo | Tipo | Card. | Validación |
|-------|------|-------|------------|
| `supplier_name` | string(64) | 1 | Energy supplier name |
| `contract_id` | string(64) | ? | Contract ID |

#### Validaciones Especiales

1. **Path/Body Match**: Los valores de `country_code`, `party_id` y `uid` en el path deben coincidir con los del body (case-insensitive)
2. **Timestamp Format**: Solo formatos RFC 3339 UTC, sin timezone offset
3. **Language Code**: Validación contra lista completa ISO 639-1
4. **Unknown Fields**: Campos desconocidos son eliminados automáticamente (stripUnknown: true)

#### Respuestas de Error

```json
{
  "status_code": 2001,
  "status_message": "Invalid Token data: type: type is required",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "errors": [
    {
      "field": "type",
      "message": "type is required",
      "type": "any.required"
    }
  ]
}
```

## Testing

### Tests Unitarios

```bash
npm test -- src/validators/__tests__/tokenValidators.test.js
```

### Tests Manuales

```bash
# Asegúrate de que la aplicación esté corriendo
npm run dev

# En otra terminal, ejecuta el script de pruebas
./scripts/test-token-validation.sh
```

## Ejemplos

### Token Válido Completo

```json
{
  "country_code": "ES",
  "party_id": "IPD",
  "uid": "token-123",
  "type": "RFID",
  "contract_id": "contract-12345",
  "visual_number": "VISUAL-001",
  "issuer": "Test Company Inc",
  "group_id": "group-001",
  "valid": true,
  "whitelist": "ALLOWED",
  "language": "es",
  "default_profile_type": "REGULAR",
  "energy_contract": {
    "supplier_name": "Energy Supplier SA",
    "contract_id": "energy-contract-789"
  },
  "last_updated": "2025-01-15T10:30:00Z"
}
```

### Token Válido Mínimo (solo campos requeridos)

```json
{
  "country_code": "PT",
  "party_id": "XYZ",
  "uid": "minimal-token",
  "type": "APP_USER",
  "contract_id": "contract-456",
  "issuer": "Minimal Issuer",
  "valid": false,
  "whitelist": "NEVER",
  "last_updated": "2025-01-15T10:30:00Z"
}
```

## Próximos Pasos

Los siguientes endpoints requieren validación:

1. **Credentials Module**
   - `POST /ocpi/2.2/credentials`
   - `PUT /ocpi/2.2/credentials`

2. **Commands Module**
   - `POST /ocpi/cpo/2.2/commands/START_SESSION`
   - `POST /ocpi/cpo/2.2/commands/STOP_SESSION`
   - `POST /ocpi/cpo/2.2/commands/RESERVE_NOW`
   - `POST /ocpi/cpo/2.2/commands/CANCEL_RESERVATION`
   - `POST /ocpi/cpo/2.2/commands/UNLOCK_CONNECTOR`

3. **Sessions Module**
   - `PUT /ocpi/emsp/2.2/sessions/{country_code}/{party_id}/{session_id}`
   - `PATCH /ocpi/emsp/2.2/sessions/{country_code}/{party_id}/{session_id}`

4. **CDRs Module**
   - `POST /ocpi/emsp/2.2/cdrs`

5. **Locations Module**
   - `PUT /ocpi/emsp/2.2/locations/{country_code}/{party_id}/{location_id}`
   - `PATCH /ocpi/emsp/2.2/locations/{country_code}/{party_id}/{location_id}`

6. **Tariffs Module**
   - `PUT /ocpi/emsp/2.2/tariffs/{country_code}/{party_id}/{tariff_id}`
   - `PATCH /ocpi/emsp/2.2/tariffs/{country_code}/{party_id}/{tariff_id}`

## Referencias

- **OCPI 2.2 Specification**: `docs/OCPI-2.2-d2_12_06_2020.pdf`
- **Joi Documentation**: https://joi.dev/api/
- **RFC 3339**: https://www.rfc-editor.org/rfc/rfc3339
- **ISO 639-1**: https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
