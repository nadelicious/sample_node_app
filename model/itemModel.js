var mongoose = require('mongoose');
var _= require('underscore');

var Item = mongoose.model('cl_items', {
  user_id: String,
  username: String,
  itemname: String,
  sale_type: String,
  price_range: String,
  description: String,
  image1:String,
  image2: String,
  location: String,
  contact_no:String,
  date_posted: Date,
  _active: Boolean
});

exports.saveItem = function(newData,callback){
var item= new Item(newData);
	item.save(function (err) {
		if (err) return callback(err);
		callback(null,'success');
	});
}

exports.displayAll= function(data,limit,callback){
	var data = (!_.isEmpty(data)) ? data : {};
	Item.find(data,function(err,item){
		if(err) return callback(err);
	}).limit(limit).sort({'date_registered': 1}).exec(function(err,docs){
		if(err) return callback(err);
		callback(null,docs);
	});
}

exports.updateItem = function(obj,callback){
	Item.update({_id: obj.item_id}, { $set: obj }, {}, function(err, data){
		if(err) return callback(err);
		callback(null,'item-updated');	
	});
}

exports.removeItem = function(id,callback){
	Item.remove({_id: id}, function(err, data){
		if(err) return callback(err);
		callback(null,'item-deleted');	
	});
}

exports.searchItem = function(query, callback){
	Item.find({itemname: new RegExp('\\b(' + query + ')', 'gi')},function(err,data){
		if(err) return  callback(err);
	}).limit(10).sort({itemname:1}).exec(function(err,docs){
		if(err) return callback(err);
		callback(null,docs);
	});
}

