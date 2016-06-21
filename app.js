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
        // if query string is 'register'
        if(req.query.type == 'register'){
            models.User.find({ where: {user_email: req.body.email}, raw: true}).then(function(user){
                //check duplicate email.
                if(!user){
                    models.User.create({user_email: req.body.email}).then(function(){
                        res.send('success');
                    }).catch(function(err){
                        // user.create exception
                        console.log(err);
                        res.send('server error');
                    });
                }else{
                    res.send('Duplicate email. please use another Email')
                }
            }).catch(function(err){
                // user.find exception
                res.send('server error');
            });
            console.log(req.body);
        }
        // if query string is 'login'
        else if(req.query.type == 'login'){
            models.sequelize.sync().then(function () {
                models.User.find({ where: {user_email: req.body.email},raw: true }).then(function(user){
                    // do you have user?
                    if(user){
                        models.Song.findAll({ where: {user_id: user.user_id},raw : true}).then(function(song){
                            res.json({song: song});
                        })
                    }else{
                        res.send('Email does not exist.');
                    }
                }).catch(function(err){
                    // user.find exception
                    console.log(err);
                    res.send('server error');
                })
            }).catch(function(err){
                // sync() exception
                console.log(err);
                res.send('server error');
            });
        }
    })

    // insert song request
    .put(function(req, res){
        var songObj = req.body;
        models.User.find({where: {user_email: songObj.userInfo}, raw: true}).then(function(user){
            models.Song.create({user_id: user.user_id, contents: JSON.stringify(songObj.data), list_name: 'test'});
        }).catch(function(err){
            // user.find exception
            console.log(err);
            res.send('server error');
        })
    })

    // delete song request
    .delete(function(req, res){
        var songObj = req.body;
        models.User.find({where: {user_email: songObj.userInfo}, raw: true}).then(function(user){
            models.Song.destroy({where: {user_id: user.user_id, contents: JSON.stringify(songObj.data)}});
        }).catch(function(err){
            // user.find exception
            console.log(err);
            res.send('server error');
        })
    });

app.listen(process.env.PORT || '3000', function(){
    console.log('start app on port %d!', this.address().port);
});