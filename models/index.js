if (!global.hasOwnProperty('db')) {
    var config = require('./config');
    var Sequelize = require('sequelize');
    var sequelize;

    if(process.env.USERNAME == 'JongHo'){
        sequelize = new Sequelize('postgres://postgres:1234@localhost/withSong');
    }else{
        sequelize = new Sequelize('postgres://lmbpfdhygybwai:7L6dabZtR5z3nyB6snGAaedjhD@ec2-54-243-236-70.compute-1.amazonaws.com:5432/dnnq4jlamkcrg');
    }

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
