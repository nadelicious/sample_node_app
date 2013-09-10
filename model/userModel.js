var mongoose = require('mongoose');
var utils= require('../lib/util.js');

var User = mongoose.model('cl_users', {
  username:String, 
  password: String, 
  email: String, 
  location:String,
  photo:String,
  date_registered: Date,
  _active: Boolean
});

exports.registerUser = function(newData, callback){
	User.findOne({ username: newData.username }, function (err, data) {
		if(err)  return callback(err);
		if(data){
			 callback(null,'username-exist');
		}else{
			User.findOne({email: newData.email }, function (err, data) {
				if(err)  return callback(err);
				if(data){
					 callback(null,'email-exists');
				}else{
					utils.saltAndHash(newData.password, function(hash){
						newData.password = hash;
						var member= new User(newData);
						member.save(function (err) {
							if (err) return callback(err);
							callback(null,'success');
						});
					});
				}	
			});
		}	
	});
}

exports.loginUser = function(uname,pword, callback){
	User.findOne({username:uname, _active:true}, function(err, data) {
		if(err) return callback(err);
		if (data== null){
			callback(null,null);
		}	else{
			utils.validatePassword(pword, data.password, function(err, res) {
				if(err) return callback(err);
				if (res){
					callback(null, data);
				}	else{
					callback(null,null);
				}
			});
		}
	});

}

exports.updateUser = function(obj,callback){
	User.update({_id: obj.user_id}, { $set: obj }, {}, function(err, data){
		if(err) return callback(err);
		callback(null,'user-updated');	
	});
}



