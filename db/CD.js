const { Sequelize, sequelize } = require('./db');

const CD = sequelize.define('cd', {
    album: Sequelize.STRING,
    artist: Sequelize.STRING,
    genre: Sequelize.STRING,
    price: Sequelize.INTEGER
});

module.exports = { CD };