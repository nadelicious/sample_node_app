//
var global = {
	email_format: /^([\w!.%+\-])+@([\w\-])+(?:\.[\w\-]+)+$/ , 
	
	ajax:null,
	
	validateInputs: function(form){
		var _this=this;
		var inputs = form.find('input[required]', 'select' ,'textarea[required]');
		var valid =true;
		inputs.each(function(){
			if($.trim($(this).val())==''){
				valid=false;
			}
			if($(this).attr('type')=='email' && 
				!$.trim($(this).val()).match(_this.email_format)){
				valid=false;
			}
		});
		return valid;
	},
	
	registerUser: function(form){
		var _this= this;
		var isSubmit =true;
		form.on('submit',function(ev){
			ev.preventDefault();
			isSubmit = _this.validateInputs($(this));
			if(!isSubmit){
				alert('Something is missing!');
			}else{
				if(_this.ajax) _this.ajax.abort();
				 _this.ajax = $.ajax({
					url:'/register',
					type: 'post',
					data: form.serialize()
				});
				_this.ajax.done(function(data){
					if(data) {
						if(data=='invalid-username'){
							alert('Username already exists! Try another one.');
						}else if(data=='invalid-email'){
							alert('Email already exists! Try another one.');
						}else{
							alert('Registration done!');
							form[0].reset();
						}	
					}	
				});
			}
		});
	},
	
	loginUser: function(form){
		var _this= this;
		var isSubmit =true;
		form.on('submit',function(ev){
			ev.preventDefault();
			isSubmit = _this.validateInputs($(this));
			if(!isSubmit){
				alert('Something is missing!');
			}else{
				form[0].submit();
			}
		});
	},
	
	editUser: function(form){
		var _this= this;
		form.on('submit',function(ev){ 
			ev.preventDefault();
			if($.trim($('input[name=username]').val())==$('input[hname=username]').val() &&
			   $.trim($('input[name=email]').val())==$('input[hname=email]').val() &&
			   $.trim($('input[name=location]').val())==$('input[hname=location]').val() &&
			   $.trim($('input[name=password]').val())=='' &&
			   $.trim($('input[name=photo]').val())=='' &&
			   $('input[name=_active]')[0].checked  
			){
				alert('no changes are made')
			}else{
				form[0].submit();
			}
		});
	},
	
	searchItem:function(input,container){
		var search_container =container;
		input.autocomplete({
            minLength: 0,
            source: function( request, response ) {
				$.ajax({
					url: '/result/search-item',
					type: 'post',
					data: {query: request.term},
					dataType:'json',
					success: function(data){
						if(data){
							search_container.html();
							var list='';
							$.each(data,function(k,v){
								list+='<a href="/result/item?item_id='+v._id+'"><ul class="clearfix"><li><img src="/images/img/'+v.image1+'" width="80" height="30"><div class="list-username"><b>-'+v.username+'-</b></div></li>';
								list+='<li class="search-items"><div class="list-item-name">'+v.itemname+'</div><div class="list-sale-type"><span class="sale-type-small">For Sale </span></div><div class="list-location">'+v.location+'</div><div class="list-price"><span class="price-range-small">'+v.price_range+'</span></div></li></ul></a>';
							});
							search_container.html(list);
						}
                        else search_container.html('<p>No Results </p>');					
					}
				});
			}	
        });
	},
	
	deleteComment: function(elem){
		var _this =this;
		var el=null;
		if(elem){
			elem.each(function(){
				$(this).on('click',function(ev){
					if(_this.ajax) _this.ajax.abort();	
					_this.ajax = $.ajax({
						url:'/result/remove-comment',
						type: 'post',
						data: {
							user_id: $(this).attr('user_id'),
							_id: $(this).attr('cid'),
						}
					});
					_this.ajax.done(function(data){
						if(data){
							$(ev.target).parents('ul').fadeOut();
						}
					});
				});
			});
		} else return;
	},
	
	toggleContainer: function(elem){
		if(elem){
			elem.each(function(){
				$(this).on('click',function(){
					$(this).next().slideToggle();
				});	
			});
		}else return;	
	}
	
	
	
	
};