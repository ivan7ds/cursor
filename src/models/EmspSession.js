const { buildEmspSessionFields, defineIndexes } = require('./EmspSession/definitionHelpers');

module.exports = (sequelize) => {
    const EmspSession = sequelize.define('EmspSession', buildEmspSessionFields(), {
        tableName: 'emsp_sessions',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: defineIndexes()
    });

    return EmspSession;
};
