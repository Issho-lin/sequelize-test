const Sequelize = require('sequelize');
const conf = require('./conf');

module.exports = new Sequelize(conf.database, conf.username, conf.password, {
    dialect: 'mysql',
    host: conf.host
})