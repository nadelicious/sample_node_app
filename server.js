var express = require('express');
var mongoose = require('mongoose');
var _= require('underscore');
var moment = require('moment');
var utils =require('./lib/util.js');
var app =express();

mongoose.connect('localhost', 'db_project');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
  console.log('Connected to DB');
});

var  user  = require('./model/userModel.js');
var  item  = require('./model/itemModel.js');

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


app.get('/', function(req, res) {
	 item.displayAll({},12,function(err,item){
	   if(err){
		res.statusCode=404;
		console.log(err);
	   }
	   res.render('index.ejs',{
			data:  { teaser: item }
		});
	});
}); 

app.post('/login', function(req, res) {
	user.loginUser(
	req.param('username'),
	req.param('password'), function(err, data){
		if(err) console.log(err);
		if (!data){
			res.redirect('/');
		}else{
			req.session.user = data;
			res.redirect('/result/home');
		}
	});	
}); 

app.get('/logout', function(req, res) {
	req.session.destroy(function(err){ 
		if(err) console.log(err);
		res.redirect('/');
	});
}); 

app.post('/register', function(req, res) { 
	user.registerUser({ 
		username: req.param('username'),
		password:  req.param('password'),
		email:req.param('email'),
		location:req.param('location'),
		photo: 'no-image.jpg',
		date_registered: moment().format('YYYY-MM-DD HH:mm:ss'),
		_active: true
	}, function(err,rep){
		if(err){
			res.statusCode=404;
			console.log(err);
		}	
		if(rep) res.send(rep);
	}); 
}); 

app.get('/result/:name', function(req, res) {
    var route_name =req.route.params['name'] || 'home' ; 
	var contents=null;
	if(_.isEmpty(req.session.user) || !req.session.user){
		res.redirect('/');
	}else{
		var query ={};
		item.displayAll(query,500 ,function(err,item){
			if(err){
				res.statusCode=404;
				console.log(err);
			}
			if(route_name=='mypost'){
				var posts = _.filter(item,function(data){
					return data.user_id == req.session.user._id;
				});
				contents = posts || [];
			}
			
			if(route_name=='item'){
				var perItem = _.filter(item,function(data){
					return data._id == req.param('item_id');
				});
				contents= perItem[0] || {};
			}
	
			if(route_name=='home'){
				contents= item[0] || {};
			}
			res.render('result.ejs',{
				user_sess: req.session.user,
				content:route_name,
				data:  {left_content:  item, main_content:contents }
			});

		});
	}
});

app.post('/result/:action', function(req, res) {
	var action_name =req.route.params['action']; 
	switch(action_name){
		case 'post-item':		
			item.saveItem({ 
			  user_id: req.param('user_id'),
			  username: req.param('username'),
			  itemname: req.param('itemname'),
			  sale_type: req.param('sale_type'),
			  price_range: req.param('price_range'),
			  guitar_type: req.param('guitar_type'),
			  brand: req.param('brand'),
			  description: req.param('description'),
			  tags: req.param('tags'),
			  image1:req.files.image1.name || 'no-image.jpg',
			  image2: req.files.image2.name || 'no-image.jpg',
			  location:req.param('location'),
			  contact_no:req.param('contact_no'),
			  date_posted: moment().format('YYYY-MM-DD HH:mm:ss'),
			  _active: true
			}, function(err,rep){
				if(err){
					res.statusCode=404;
					console.log(err);
				}
				if(req.files.image1.name!=''){
					utils.moveFile(req.files.image1.path
						,__dirname+'/public/images/img/'+req.files.image1.name,function(err){
						if(err){
							res.statusCode=404;
							console.log('error');
						}
					});
				}
				if(req.files.image2.name!=''){
					utils.moveFile(req.files.image2.path
						,__dirname+'/public/images/img/'+req.files.image2.name,function(err){
						if(err){
							res.statusCode=404;
							console.log('error');
						}
					})
				}				
				if(rep)	res.redirect('/result/home');
			}); 
		break;
		case 'edit-user': 
			var obj =req.body;
			if(obj.password=='')
				delete obj.password;
			if(req.files.photo.name!='')
				obj.photo = req.files.photo.name;
			else obj.photo = 'no-image.jpg';	
				
			user.updateUser(req.body,function(err,data){
				if(err){
					res.statusCode=404;
					console.log(err);
				}
				if(req.files.photo.name!=''){
					utils.moveFile(req.files.photo.path
						,__dirname+'/public/images/photo/'+req.files.photo.name,function(err){
						if(err){
							res.statusCode=404;
							console.log('error');
						}
					});
				}
				if(data) res.redirect('/result/settings')
			});
		break;
		case 'edit-item':{
			var todo =req.body.todo;
			var new_item =req.body;
			delete new_item.todo;
			if(req.files.image1.name!='')
				new_item.image1= req.files.image1.name;
			if(req.files.image2.name!='')
				new_item.image2= req.files.image2.name;	
			new_item.date_posted =moment().format('YYYY-MM-DD HH:mm:ss');
         
			if(todo=='Update'){
				item.updateItem(new_item,function(err,data){
					if(err){
						res.statusCode=404;
						console.log(err);
					}
					if(req.files.image1.name!=''){
						utils.moveFile(req.files.image1.path
							,__dirname+'/public/images/img/'+req.files.image1.name,function(err){
							if(err){
								res.statusCode=404;
								console.log('error');
							}
						});
					}
					if(req.files.image2.name!=''){
						utils.moveFile(req.files.image2.path
							,__dirname+'/public/images/img/'+req.files.image2.name,function(err){
							if(err){
								res.statusCode=404;
								console.log('error');
							}
						})
					}		
					if(data) res.redirect('/result/mypost');
				});
			}
			if(todo=='Delete'){
				item.removeItem(new_item.item_id,function(err,data){
					if(err){
						res.statusCode=404;
						console.log(err);
					}
					if(data) res.redirect('/result/mypost');
				});
			}
			
		}
		break;
		case 'search-item': 
			var query = req.body.query;
			item.searchItem(query,function(err,data){
				if(err){
					res.statusCode=404;
					console.log(err);
				}
				if(data) res.send(data);
			});
		break;	
	}	
}); 


app.listen(process.env.PORT || 3000);

console.log('Application is running at localhost:3000');