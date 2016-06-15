var models = require('./index');

module.exports = function(sequelize, DataTypes) {
    return sequelize.define("Song",
        {
            song_id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
            user_id: {type: DataTypes.INTEGER, allowNull: false, references: {model: models.User, key: 'user_id'}},
            contents: {type: DataTypes.TEXT, allowNull: false},
            list_name: {type: DataTypes.STRING, allowNull: false}
        },
        {
            tableName: 'songs',
            freezeTableName: true,
            underscored: true,
            timestamps: false
        })
};