var crypto = require('crypto');
var fs =require('fs');

generateSalt = function(){
	var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';
	var salt = '';
	for (var i = 0; i < 10; i++) {
		var p = Math.floor(Math.random() * set.length);
		salt += set[p];
	}
	return salt;
}

md5 = function(str) {
	return crypto.createHash('md5').update(str).digest('hex');
}

exports.saltify= function(){
	return generateSalt();
}

exports.saltAndHash = function(pass, callback){
	var salt = generateSalt();
	callback(salt + md5(pass + salt));
}

exports.validatePassword = function(plainPass, hashedPass, callback){
	var salt = hashedPass.substr(0, 10);
	var validHash = salt + md5(plainPass + salt);
	callback(null, hashedPass === validHash);
}

exports.moveFile= function(source,destination,callback){
	var source = fs.createReadStream(source);
	var dest = fs.createWriteStream(destination);
	source.pipe(dest);
	source.on('end', function(){ 
		callback(null);
	});
	source.on('error', function(err){ 
		return  callback(err);
	});
}



