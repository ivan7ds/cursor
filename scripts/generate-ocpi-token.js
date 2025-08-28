#!/usr/bin/env node

/**
 * Script CLI para generar tokens OCPI
 * Uso: node scripts/generate-ocpi-token.js --party-id PARTY_ID --country-code COUNTRY_CODE [--expires EXPIRES_DATE] [--description DESCRIPTION]
 */

const { program } = require('commander');
const path = require('path');

// Configurar el path para que funcione desde cualquier directorio
process.env.NODE_PATH = path.join(__dirname, '..');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Importar después de configurar NODE_PATH
const OCPITokenService = require('../src/services/ocpiTokenService');
const logger = require('../src/utils/logger');

program
  .name('generate-ocpi-token')
  .description('Generate OCPI authentication tokens for specific party IDs')
  .version('1.0.0');

program
  .command('generate')
  .description('Generate a new OCPI token')
  .requiredOption('--party-id <party_id>', 'Party ID (max 10 characters)')
  .requiredOption('--country-code <country_code>', 'Country code (2 characters, ISO 3166-1 alpha-2)')
  .option('--expires <expires>', 'Expiration date (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)')
  .option('--description <description>', 'Description for the token')
  .action(async (options) => {
    try {
      console.log('🔐 Generating OCPI token...\n');
      
      // Validar party_id
      if (options.partyId.length > 10) {
        console.error('❌ Error: Party ID must not exceed 10 characters');
        process.exit(1);
      }
      
      // Validar country_code
      if (options.countryCode.length !== 2) {
        console.error('❌ Error: Country code must be exactly 2 characters');
        process.exit(1);
      }
      
      // Parsear fecha de expiración si se proporciona
      let expiresAt = null;
      if (options.expires) {
        expiresAt = new Date(options.expires);
        if (isNaN(expiresAt.getTime())) {
          console.error('❌ Error: Invalid expiration date format. Use YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss');
          process.exit(1);
        }
      }
      
      // Generar token
      const tokenData = await OCPITokenService.generateToken(
        options.partyId,
        options.countryCode,
        {
          expiresAt,
          metadata: {
            description: options.description || `Token generated manually for ${options.partyId}`,
            generated_by: 'CLI_COMMAND',
            command_line: process.argv.join(' ')
          }
        }
      );
      
      // Mostrar resultado
      console.log('✅ Token generated successfully!\n');
      console.log('📋 Token Details:');
      console.log(`   ID: ${tokenData.id}`);
      console.log(`   Token: ${tokenData.token}`);
      console.log(`   Party ID: ${tokenData.party_id}`);
      console.log(`   Country Code: ${tokenData.country_code}`);
      console.log(`   Created: ${tokenData.created_at}`);
      console.log(`   Expires: ${tokenData.expires_at || 'Never'}`);
      
      console.log('\n🔑 Use this token in your OCPI requests:');
      console.log(`   Authorization: Token ${tokenData.token}`);
      console.log(`   or`);
      console.log(`   ocpi-token: ${tokenData.token}`);
      
      console.log('\n⚠️  Note: Previous tokens for this party_id have been deactivated.');
      
    } catch (error) {
      console.error('❌ Error generating token:', error.message);
      process.exit(1);
    }
  });

program
  .command('list')
  .description('List all active OCPI tokens')
  .option('--party-id <party_id>', 'Filter by party ID')
  .option('--country-code <country_code>', 'Filter by country code')
  .action(async (options) => {
    try {
      console.log('📋 Listing OCPI tokens...\n');
      
      // Importar el modelo directamente para listar tokens
      const { OCPIToken } = require('../src/models');
      
      const whereClause = {};
      if (options.partyId) whereClause.party_id = options.partyId;
      if (options.countryCode) whereClause.country_code = options.countryCode;
      
      const tokens = await OCPIToken.findAll({
        where: whereClause,
        order: [['created_at', 'DESC']]
      });
      
      if (tokens.length === 0) {
        console.log('No tokens found.');
        return;
      }
      
      console.log(`Found ${tokens.length} token(s):\n`);
      
      tokens.forEach((token, index) => {
        console.log(`${index + 1}. Token: ${token.token}`);
        console.log(`   Party ID: ${token.party_id}`);
        console.log(`   Country: ${token.country_code}`);
        console.log(`   Status: ${token.is_active ? '🟢 Active' : '🔴 Inactive'}`);
        console.log(`   Created: ${token.created_at}`);
        console.log(`   Expires: ${token.expires_at || 'Never'}`);
        console.log(`   Last Used: ${token.last_used_at || 'Never'}`);
        console.log('');
      });
      
    } catch (error) {
      console.error('❌ Error listing tokens:', error.message);
      process.exit(1);
    }
  });

program
  .command('deactivate')
  .description('Deactivate an OCPI token')
  .requiredOption('--token <token>', 'Token to deactivate')
  .action(async (options) => {
    try {
      console.log('🔒 Deactivating OCPI token...\n');
      
      // Importar el modelo directamente
      const { OCPIToken } = require('../src/models');
      
      const token = await OCPIToken.findOne({
        where: { token: options.token }
      });
      
      if (!token) {
        console.error('❌ Error: Token not found');
        process.exit(1);
      }
      
      await OCPITokenService.deactivateToken(token.id);
      
      console.log('✅ Token deactivated successfully!');
      console.log(`   Token: ${token.token}`);
      console.log(`   Party ID: ${token.party_id}`);
      console.log(`   Country Code: ${token.country_code}`);
      
    } catch (error) {
      console.error('❌ Error deactivating token:', error.message);
      process.exit(1);
    }
  });

program
  .command('cleanup')
  .description('Clean up expired tokens')
  .action(async () => {
    try {
      console.log('🧹 Cleaning up expired tokens...\n');
      
      await OCPITokenService.cleanupExpiredTokens();
      
      console.log('✅ Cleanup completed!');
      
    } catch (error) {
      console.error('❌ Error during cleanup:', error.message);
      process.exit(1);
    }
  });

// Manejar errores de comandos no encontrados
program.on('command:*', () => {
  console.error('❌ Error: Invalid command. Use --help for available commands.');
  process.exit(1);
});

// Ejecutar el programa
program.parse();
