const { CD } = require('./CD');
const { User } = require('./User');
const { sequelize, Sequelize } = require('./db');

User.hasMany(CD, { foreignKey: 'ownerId' });
CD.belongsTo(User, { foreignKey: 'ownerId' }); // CD table, there will be an ownerId <- FK

module.exports = {
    CD,
    User,
    sequelize,
    Sequelize,
};