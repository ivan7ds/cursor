const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const EmspSession = sequelize.define('EmspSession', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        emsp_party_id: {
            type: DataTypes.STRING(10),
            allowNull: false,
            comment: 'ID del operador EMSP (hasta 10 caracteres)'
        },
        emsp_country_code: {
            type: DataTypes.STRING(2),
            allowNull: false,
            comment: 'Código de país del EMSP (2 caracteres)'
        },
        country_code: {
            type: DataTypes.STRING(2),
            allowNull: false,
            comment: 'Código de país (2 caracteres)'
        },
        party_id: {
            type: DataTypes.STRING(3),
            allowNull: false,
            comment: 'ID del operador (3 caracteres)'
        },
        session_id: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: 'ID único de la sesión'
        },
        start_date_time: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: 'Fecha y hora de inicio de la sesión'
        },
        end_date_time: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: 'Fecha y hora de fin de la sesión'
        },
        start_datetime: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: 'Fecha y hora de inicio de la sesión (formato legacy)'
        },
        end_datetime: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: 'Fecha y hora de fin de la sesión (formato legacy)'
        },
        kwh: {
            type: DataTypes.DECIMAL(10, 3),
            allowNull: true,
            defaultValue: 0.0,
            comment: 'Energía consumida en kWh'
        },
        cdr_token: {
            type: DataTypes.JSONB,
            allowNull: true,
            comment: 'Token utilizado para la sesión (JSON)'
        },
        id_token: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: 'ID del token utilizado'
        },
        auth_method: {
            type: DataTypes.STRING(50),
            allowNull: true,
            comment: 'Método de autenticación utilizado'
        },
        location_id: {
            type: DataTypes.UUID,
            allowNull: true,
            comment: 'ID de la ubicación'
        },
        evse_uid: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: 'UID del EVSE'
        },
        connector_id: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: 'ID del conector'
        },
        currency: {
            type: DataTypes.STRING(3),
            allowNull: true,
            defaultValue: 'EUR',
            comment: 'Moneda utilizada'
        },
        status: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: 'PENDING',
            comment: 'Estado de la sesión (PENDING, ACTIVE, COMPLETED, etc.)'
        },
        last_updated: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            comment: 'Última actualización'
        },
        total_cost: {
            type: DataTypes.JSONB,
            allowNull: true,
            comment: 'Costo total de la sesión (JSON)'
        },
        charging_periods: {
            type: DataTypes.JSONB,
            allowNull: true,
            comment: 'Períodos de carga (JSON)'
        }
    }, {
        tableName: 'emsp_sessions',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            {
                fields: ['country_code', 'party_id']
            },
            {
                fields: ['session_id']
            },
            {
                fields: ['status']
            },
            {
                fields: ['created_at']
            }
        ]
    });

    return EmspSession;
};
