module.exports = {
  // Database Configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || 'cpo_ocpi',
    user: process.env.DB_USER || 'cpo_user',
    password: process.env.DB_PASSWORD || 'your_password',
    dialect: process.env.DB_DIALECT || 'postgres'
  },

  // Redis Configuration
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined
  },

  // Server Configuration
  server: {
    port: process.env.PORT || 3000,
    environment: process.env.NODE_ENV || 'development'
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret_key_here',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },

  // OCPI Configuration
  ocpi: {
    version: process.env.OCPI_VERSION || '2.2',
    baseUrl: process.env.OCPI_BASE_URL || 'https://api.cpo-example.com',
    partyId: process.env.OCPI_PARTY_ID || 'IPD',
    countryCode: process.env.OCPI_COUNTRY_CODE || 'ES'
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log'
  },

  // External APIs
  external: {
    maps: {
      apiKey: process.env.MAPS_API_KEY || 'your_google_maps_api_key'
    },
    weather: {
      apiKey: process.env.WEATHER_API_KEY || 'your_openweather_api_key'
    }
  }
};




