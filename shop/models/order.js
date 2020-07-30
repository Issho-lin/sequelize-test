const Sequelize = require('sequelize');
const sequelize = require('../util/database');

module.exports = sequelize.define('order', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    }
})