if (!global.hasOwnProperty('db')) {
    var config = require('./config');
    var Sequelize = require('sequelize');
    var sequelize = new Sequelize('postgres://postgres:1234@localhost/withSong');
    //var sequelize = new Sequelize('postgres://buozapqidmkhrg:_FjPWaYfB9IYaOVLj3TuHpMw41@ec2-54-225-79-158.compute-1.amazonaws.com:5432/d2mro4ihpmjdsa');
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
