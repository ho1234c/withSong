var express         = require('express');
var bodyParser      = require('body-parser');
var models          = require('./models');

var app = express();

app.locals.pretty = true;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));


app.route('/')
    // get request
    .get(function(req,res){
        res.sendFile(__dirname + '/public/index.html');
    })
    // email Auth request
    .post(function(req, res){
        models.sequelize.sync().then(function () {
            models.User.find({ where: {user_email: req.body.email},raw: true }).then(function(user){
                if(user){
                    models.Song.findAll({ where: {user_id: user.user_id},raw : true}).then(function(song){
                        res.send(song);
                    })
                }
            })
        });
    })

    // delete song
    .put(function(req, res){
        var songObj = req.body;
        models.User.find({where: {user_email: songObj.userInfo}, raw: true}).then(function(user){
            models.Song.create({user_id: user.user_id, contents: JSON.stringify(songObj.data), list_name: 'test'});
        })
    });


app.listen(process.env.PORT || '3000', function(){
    console.log('start app on port %d!', this.address().port);
});