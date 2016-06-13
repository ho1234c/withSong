var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.locals.pretty = true;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));

// get request
app.get('/', function(req,res){
    res.sendFile(__dirname + '/public/index.html');
});

app.listen(process.env.PORT || '3000', function(){
    console.log('start app on port %d!', this.address().port);
});