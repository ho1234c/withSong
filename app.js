var express         = require('express');
var bodyParser      = require('body-parser');
var MobileDetect = require('mobile-detect');
var models          = require('./models');

var app = express();
app.locals.pretty = true;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/node_modules'));
models.sequelize.sync()
    .then(function(){
        console.log('database sync success');
    })
    .catch(function(){
        console.log('database sync fail');
    });

app.route('/')
    // get request
    .get(function(req,res){
        var md = new MobileDetect(req.get('User-Agent'));

        if(md.mobile()){
            app.use(express.static(__dirname + '/public/mobile', {index: false}));
            res.sendFile(__dirname + '/public/mobile/index.html');
        }
        else{
            app.use(express.static(__dirname + '/public', {index: false}));
            res.sendFile(__dirname + '/public/index.html');
        }

        // test for mobile
        //app.use(express.static(__dirname + '/public/mobile', {index: false}));
        //res.sendFile(__dirname + '/public/mobile/index.html');
    })

    // email Auth request
    .post(function(req, res){
        // if query string is 'register'
        if(req.query.type === 'register'){
            models.User.find({ where: {user_email: req.body.email}, raw: true})
                .then(function(user){
                    //check duplicate email.
                    if(!user){
                        models.User.create({user_email: req.body.email})
                            .then(function(){
                                res.send('success');
                            })
                            .catch(function(err){
                                // user.create exception
                                console.log(err);
                                res.send('server error');
                            });
                    }else{
                        res.send('Duplicate email. please use another Email');
                    }
                })
                .catch(function(err){
                    // user.find exception
                    console.log(err);
                    res.send('server error');
                });
            console.log(req.body);
        }
        // if query string is 'login'
        else if(req.query.type === 'login'){
            models.User.find({ where: {user_email: req.body.email},raw: true })
                .then(function(user){
                    // do you have user?
                    if(user){
                        models.Song.findAll({ where: {user_id: user.user_id},raw : true})
                            .then(function(song){
                                res.json({song: song});
                            })
                            .catch(function(err){
                                // song.find exception
                                console.log(err);
                                res.send('server error');
                            });
                    }else{
                        res.send('Email does not exist.');
                    }
                })
                .catch(function(err){
                    // user.find exception
                    console.log(err);
                    res.send('server error');
                });
        }
    })

    // insert song request
    .put(function(req, res){
        var songObj = req.body;
        models.User.find({where: {user_email: songObj.userInfo}, raw: true})
            .then(function(user){
                models.Song.create({user_id: user.user_id, contents: JSON.stringify(songObj.data), list_name: 'test'})
                    .then(function(){
                        res.send('success');
                    })
                    .catch(function(err){
                        // song.create exception
                        console.log(err);
                        res.send('server error');
                    });
            })
            .catch(function(err){
                // user.find exception
                console.log(err);
                res.send('server error');
            });
    })

    // delete song request
    .delete(function(req, res){
        var songObj = req.body;
        models.User.find({where: {user_email: songObj.userInfo}, raw: true})
            .then(function(user){
                models.Song.destroy({where: {user_id: user.user_id, contents: JSON.stringify(songObj.data)}})
                    .then(function(){
                        res.send('success');
                    })
                    .catch(function(err){
                        console.log(err);
                        res.send('server error');
                    });
            })
            .catch(function(err){
                // user.find exception
                console.log(err);
                res.send('server error');
            });
    });

app.listen(process.env.PORT || '3000', function(){
    console.log('start app on port %d!', this.address().port);
});