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
        session_id: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: 'ID único de la sesión'
        },
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
        kwh: {
            type: DataTypes.DECIMAL(10, 3),
            allowNull: true,
            defaultValue: 0.0,
            comment: 'Energía consumida en kWh'
        },
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
        },
        last_updated: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            comment: 'Última actualización'
        },
        total_cost: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            comment: 'Costo total de la sesión'
        }
    }, {
        tableName: 'emsp_sessions',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            {
                unique: true,
                fields: ['emsp_country_code', 'emsp_party_id', 'session_id']
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
