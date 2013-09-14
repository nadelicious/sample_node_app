var crypto = require('crypto');
var fs =require('fs');

generateSalt = function(){
	var set = 'wallyBayola69';
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

exports.rand= function(filename){
	var file =filename.split('.');
	return file[0]+'_'+Math.floor(Math.random()*999)+md5(filename)+'.'+file[1];
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



