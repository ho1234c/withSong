if (!global.hasOwnProperty('db')) {
    var config = require('./config');
    var Sequelize = require('sequelize');
    var sequelize = new Sequelize('postgres://postgres:1234@localhost/withSong');
    var db = {};

    global.db = {
        Sequelize: Sequelize,
        sequelize: sequelize,
        User:     sequelize.import(__dirname + '/users'),
        Song:     sequelize.import(__dirname + '/songs')
    }
}

config.defineAssociation(global.db);
module.exports = global.db;
