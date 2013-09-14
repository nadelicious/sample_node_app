var mongoose = require('mongoose');
var _= require('underscore');

var Comment=mongoose.model('cl_comments',{
	item_id:String,
	user_id:String,
	username:String, 
	photo:String,
	comment:String,
	date_posted: Date,
	_active: Boolean
}); 

exports.displayComments= function(data,limit,callback){
	var data = (!_.isEmpty(data)) ? data : {};
	Comment.find(data,function(err,item){
		if(err) return callback(err);
	}).limit(limit).sort({'date_posted': -1}).exec(function(err,docs){
		if(err) return callback(err);
		callback(null,docs);
	});
}

exports.addComment=function(newData,callback){
	var comment= new Comment(newData);
	comment.save(function (err) {
		if (err) return callback(err);
		callback(null,'success');
	});
};

exports.removeComment= function(query,callback){
  	Comment.remove(query, function(err, data){
		if(err) return callback(err);
		callback(null,'comment-deleted');	
	});
}
