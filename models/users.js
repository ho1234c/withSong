module.exports = function(sequelize, DataTypes) {
    return sequelize.define("User",
        {
            user_id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
            user_email: {type: DataTypes.STRING(32), allowNull: false}
        },
        {
            tableName: 'users',
            freezeTableName: true,
            underscored: true,
            timestamps: false
        })
};