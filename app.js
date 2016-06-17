var express         = require('express');
var bodyParser      = require('body-parser');
var models          = require('./models');

var app = express();

app.locals.pretty = true;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

// get request
app.get('/', function(req,res){
    res.sendFile(__dirname + '/public/index.html');
});

app.post('/', function(req, res){
    models.sequelize.sync().then(function () {
        models.User.find({ where: {user_email: req.body.email},raw : true } ).then(function(result){
            if(result){
                res.send('success');
            }
            console.log(result);
        })
    });
});

app.listen(process.env.PORT || '3000', function(){
    console.log('start app on port %d!', this.address().port);
});