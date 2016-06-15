var config = {
    defineAssociation: function(db) {
        db.User.hasMany(db.Song, {foreignKey: 'user_id'});
        db.Song.belongsTo(db.User, {foreignKey: 'user_id', targetKey: 'user_id'});
    }
};

module.exports = config;