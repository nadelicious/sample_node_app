var _= require('underscore');
var moment = require('moment');
var utils =require('../lib/util.js');

var  user  = require('../model/userModel.js');
var  item  = require('../model/itemModel.js');
var  comment  = require('../model/commentModel.js');

var _temp =  __dirname.split('\\').pop();
var dirname =  __dirname.replace(_temp,'');

exports.getIndexPage =function(req, res) {
	item.displayAll({_active: true},12,function(err,item){
	   if(err){
		res.statusCode=404;
		console.log(err);
	   }
	   res.render('index.ejs',{
			data:  { teaser: item }
		});
	});
}

exports.getLogout =function(req, res) {
	req.session.destroy(function(err){ 
		if(err) console.log(err);
		res.redirect('/');
	});
}

exports.getResultPage =function(req, res) {
    var route_name =req.route.params['name'] || 'home' ; 
	var contents=null;
	if(_.isEmpty(req.session.user) || !req.session.user){
		res.redirect('/');
	}else{
		var query ={_active:true};
		item.displayAll(query,500 ,function(err,item){
			comment.displayComments(query,100,function(err,coms){
				if(err){
					res.statusCode=404;
					console.log(err);
				}
				_coms=[];
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
					var _coms = _.filter(coms,function(data){
						return data.item_id == perItem[0]._id;
					});
					contents= perItem[0] || {};
				}	
				if(route_name=='home'){
					contents= item[0] || {};
					var _coms = _.filter(coms,function(data){
						return data.item_id == item[0]._id;
					});
				}
				res.render('result.ejs',{
					user_sess: req.session.user,
					content:route_name,
					data:  {
						left_content:  item, 
						main_content:contents ,
						moment: moment,
						comments: { content: _coms , count:   _coms.length }
					}
				});
			});	
		});
	}
}


/**POST**/

exports.postLogin = function(req, res) {
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
}

exports.postRegister =function(req, res) { 
	user.registerUser({ 
		username: req.param('username'),
		password:  req.param('password'),
		email:req.param('email'),
		location:req.param('location'),
		photo: 'no-image.jpg',
		date_registered: new Date,
		_active: true
	}, function(err,rep){
		if(err){
			res.statusCode=404;
			console.log(err);
		}	
		if(rep) res.send(rep);
	}); 
}

exports.postResult =  function(req, res) {
	var action_name =req.route.params['action']; 
	switch(action_name){
		case 'post-item':	
			if(req.files.image1.name!=''){
				var image1_name = utils.rand(req.files.image1.name);
				utils.moveFile(req.files.image1.path
					,dirname+'/public/images/img/'+image1_name,function(err){
					if(err){
						res.statusCode=404;
						console.log('error');
					}
				});
			}else var image1_name='';
			if(req.files.image2.name!=''){
				var image2_name = utils.rand(req.files.image2.name);
				utils.moveFile(req.files.image2.path
					,dirname+'/public/images/img/'+image2_name,function(err){
					if(err){
						res.statusCode=404;
						console.log('error');
					}
				});
			}else var image2_name='';
			item.saveItem({ 
			  user_id: req.param('user_id'),
			  username: req.param('username'),
			  itemname: req.param('itemname'),
			  sale_type: req.param('sale_type'),
			  price_range: req.param('price_range'),
			  description: req.param('description'),
			  image1:image1_name || 'no-image.jpg',
			  image2: image2_name || 'no-image.jpg',
			  location:req.param('location'),
			  contact_no:req.param('contact_no'),
			  date_posted: new Date,
			  _active: true
			}, function(err,rep){
				if(err){
					res.statusCode=404;
					console.log(err);
				}				
				if(rep)	res.redirect('/result/home');
			}); 
		break;
		case 'edit-user': 
			var obj =req.body;
			if(obj.password=='') delete obj.password;
			if(req.files.photo.name!=''){
				obj.photo = utils.rand(req.files.photo.name);
				utils.moveFile(req.files.photo.path
					,dirname+'/public/images/photo/'+obj.photo,function(err){
					if(err){
						res.statusCode=404;
						console.log('error');
					}
				});
			}	
			else obj.photo = 'no-image.jpg';	
			
			user.updateUser(obj,function(err,data){
				if(err){
					res.statusCode=404;
					console.log(err);
				}
				if(data) res.redirect('/result/settings')
			});
		break;
		case 'edit-item':{
			var todo =req.body.todo;
			var new_item =req.body;
			delete new_item.todo;
			if(req.files.image1.name!=''){
				new_item.image1= req.files.image1.name;
				utils.moveFile(req.files.image1.path
					,dirname+'/public/images/img/'+new_item.image1,function(err){
					if(err){
						res.statusCode=404;
						console.log('error');
					}
				});
			}	
			if(req.files.image2.name!=''){
				new_item.image2= req.files.image2.name;	
				utils.moveFile(req.files.image2.path
					,dirname+'/public/images/img/'+req.files.image2.name,function(err){
					if(err){
						res.statusCode=404;
						console.log('error');
					}
				});
			}	
			new_item.date_posted = new Date;
         
			if(todo=='Update'){
				item.updateItem(new_item,function(err,data){
					if(err){
						res.statusCode=404;
						console.log(err);
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
		case 'add-comment':
			var obj =req.body;
			obj.date_posted = new Date;
			obj._active =true;
			comment.addComment(obj,function(err,data){
				if(err){
					res.statusCode=404;
					console.log(err);
				}
				if(data) res.redirect('/result/home');
			});
		break;
		case 'remove-comment': 
			comment.removeComment(req.body,function(err,data){
				if(err){
					res.statusCode=404;
					console.log(err);
				}
				if(data) res.send(data);
			});
		break;
	}	
}