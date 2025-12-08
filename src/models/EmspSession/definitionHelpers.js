const { DataTypes } = require('sequelize');

/**
 * Define los campos básicos del modelo EmspSession
 * @returns {Object} Campos básicos del modelo
 */
function defineBasicFields() {
  return {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    external_operator_party_id: {
      type: DataTypes.STRING(10),
      allowNull: false,
      comment: 'ID del operador externo (CPO, EMSP o ambos) - hasta 10 caracteres'
    },
    external_operator_country_code: {
      type: DataTypes.STRING(2),
      allowNull: false,
      comment: 'Código de país del operador externo (CPO, EMSP o ambos) - 2 caracteres'
    },
    session_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'ID único de la sesión'
    }
  };
}

/**
 * Define los campos de tiempo del modelo
 * @returns {Object} Campos de tiempo
 */
function defineTimeFields() {
  return {
    start_datetime: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Fecha y hora de inicio de la sesión'
    },
    end_datetime: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha y hora de fin de la sesión'
    },
    last_updated: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Última actualización'
    }
  };
}

/**
 * Define los campos de energía y costo del modelo
 * @returns {Object} Campos de energía y costo
 */
function defineEnergyFields() {
  return {
    kwh: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: true,
      defaultValue: 0.0,
      comment: 'Energía consumida en kWh'
    },
    total_cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Costo total de la sesión'
    }
  };
}

/**
 * Define los campos de conexión del modelo
 * @returns {Object} Campos de conexión
 */
function defineConnectionFields() {
  return {
    id_token: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'ID del token utilizado'
    },
    evse_uid: {
      type: DataTypes.STRING(36),
      allowNull: false,
      comment: 'UID del EVSE'
    },
    connector_id: {
      type: DataTypes.STRING(36),
      allowNull: true,
      comment: 'ID del conector'
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'PENDING',
      comment: 'Estado de la sesión (PENDING, ACTIVE, COMPLETED, etc.)'
    }
  };
}

/**
 * Define los índices del modelo
 * @returns {Array} Array de índices
 */
function defineIndexes() {
  return [
    {
      unique: true,
      fields: ['external_operator_country_code', 'external_operator_party_id', 'session_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['created_at']
    }
  ];
}

/**
 * Construye todos los campos del modelo EmspSession
 * @returns {Object} Todos los campos del modelo
 */
function buildEmspSessionFields() {
  return {
    ...defineBasicFields(),
    ...defineTimeFields(),
    ...defineEnergyFields(),
    ...defineConnectionFields()
  };
}

module.exports = {
    buildEmspSessionFields,
    defineIndexes
};

