var express = require('express');
var mongoose = require('mongoose');
var route =require('./routes/routes.js');
var app =express();

mongoose.connect('localhost', 'db_project');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
  console.log('Connected to DB');
});

app.configure(function(){
	app.set('view engine', 'ejs');
	app.set('views', __dirname + '/public/views');
	app.locals.pretty = true;
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.cookieParser());
	app.use(express.session({ secret: 'janeth napoles' }));
	app.use(express.methodOverride());
	app.use(express.static(__dirname + '/public'));
	app.use(app.router);
});

app.get('/',route.getIndexPage); 
app.get('/logout',route.getLogout); 
app.get('/result/:name',route.getResultPage);

app.post('/login',route.postLogin); 
app.post('/register',route.postRegister); 
app.post('/result/:action',route.postResult); 

app.listen(process.env.PORT || 3000);
console.log('Application is running at localhost:3000');