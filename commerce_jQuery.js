//This function is an analog of function "capitalize()" in the Prototype framework
String.prototype.capitalize = function () {
	return this.charAt(0).toUpperCase() + this.substring(1).toLowerCase();
};

var Commerce = {
	version : 'C1.500',
	codeVersion: 'C8EE'
};
var cnt_location =""; //"Set 'lp_cnt_location' Store Property to define static content location. Then initialize variable 'cnt_location' in the template by this store property's value.";
var lp_host = "";//"Set 'lp_host' Store Property to define liquid Pixel host and application name question sign included. Then initialize variable 'lp_host' in the template by this store property's value";

Commerce.Element = jQuery.klass({
	initialize: function() {
		//this.element;
	},

	addCss: function(e, css) {
		if (css){
			for(var k = 0; k < css.length; k++){
				e.addClass(css[k].toString());
			}
		}
		return e;
	},

	setStyle: function(e, styles) {
		if (styles)
			e.css(styles);

		return e;
	},

	bindEvents: function(e, events) {
		if (events) {
			for(var k = 0; k < events.length; k++){
				if (events[k].length<3) {
					e.bind(events[k], events[k][1]);
				} else {
					var obj = events[k][2];
					var func = events[k][1];
					if (events[k].length==3){
						e.bind(events[k][0], function(e){
							obj[func](e);
						});
					}
					else {
						var name = events[k][3]
						e.bind(events[k][0], function(e){
							obj[func](e, name);
						});
					}
				}
			}
		}
		return e;
	},

	insert: function(e, position) {
		if(!position)
			position = 'after';
		if (!jQuery.inArray(position.toLowerCase(), ['before', 'after', 'top', 'bottom'])) {
			position = 'after';
		}
		var el = this.toElement();
		e = jQuery(e);
		switch(position){
			case "after":
				e.after(el);
				break;
			case 'before':
				e.before(el);
				break;
			case 'top':
				e.predend(el);
				break;
			case 'bottom':
				e.append(el);
				break;
			case 'buttom':
				e.append(el);
				break;
		}
		return el;
	},

	insertsku: function(e, position) {
		if(!position)
			position = 'after';
		if (!jQuery.inArray(position.toLowerCase(), ['before', 'after', 'top', 'bottom'])) {
			position = 'after';
		}
		var el = this.toElement();
		e.innerHTML = "";
		e = jQuery(e);
		switch(position){
			case "after":
				e.after(el);
				break;
			case 'before':
				e.before(el);
				break;
			case 'top':
				e.predend(el);
				break;
			case 'bottom':
				e.append(el);
				break;
			case 'buttom':
				e.append(el);
				break;
		}
		return el;
	},

	toElement: function() {
		alert("please implement this method in your class!");
		return undefined;
	},

	getValue: function() {
		return this.element.val();
	}
});

Commerce.Table = jQuery.klass(Commerce.Element, {
	initialize: function(data) {
		this.data = data;
	},

	isElement: function(o)
	{
		if (!jQuery.browser.msie) return o instanceof Element;
		else return o && o.nodeType == 1 && o.tagName != undefined;
	},

	createLine: function(data , row) {
		var tr = jQuery.create("tr");
		for(var idx=0; idx<row; idx++) {
			var td = jQuery.create("td");
			var d = data[idx];
			if(typeof d != "string" && typeof d != "number" && typeof d != 'function') d = d[0];
			if (!d)
				td.append(document.createTextNode(""));
			else {
				if (typeof(d) == "string" || typeof(d) == "number")
					td.append(document.createTextNode(d));
				if (typeof(d) == 'function') {
					var r = d.apply(this);
					if (this.isElement(r))
						td.append(r);
					else
						td.append(document.createTextNode(r));
				}
				if (this.isElement(d))
					td.append(d);
			}

			tr.append(td);
		}

		return tr;
	},

	toElement: function() {
		var table = jQuery.create("table");
		table = (table);
		var tb = jQuery.create("tbody");

		table.append(tb);

		if (this.data.tTitle.length>0) {
			var line = this.createLine(this.data.tTitle, this.data.tRow)
			this.setStyle(line, this.data.titleStyles);
			this.addCss(line, this.data.titleCss);
			tb.append(line);
		}

		for (var idx=0, len=this.data.tData.length; idx<len; idx++) {

			tb.append(this.createLine(this.data.tData[idx], this.data.tRow));
		}

		this.setStyle(table, this.data.styles);
		this.addCss(table, this.data.css);
		this.bindEvents(table, this.data.events);

		this.element = table;

		return table;
	}
});

Commerce.TextArea = jQuery.klass(Commerce.Element, {
	initialize: function(controlData) {
		this.data = controlData;
	},

	toElement: function() {
		var p = jQuery.create("textarea");
		p.attr('cols', this.data.cols);
		p.attr('rows', this.data.rows);
		p.val(this.data.value);

		this.setStyle(p, this.data.styles);
		this.addCss(p, this.data.css);
		this.bindEvents(p, this.data.events);

		this.element = p;
		return p;
	}
});

Commerce.SelectBox = jQuery.klass(Commerce.Element, {
	initialize: function(controlData) {
		this.data = controlData;
	},

	toElement: function() {

		var p = jQuery.create("select");
		p.attr("id", this.data.id);
		p.attr("name", this.data.name);
		var idx = 0;
		var hasDefaultOption = false;
		for(var key = 0; key < this.data.options.length; key++){
			if (!this.data.options[key])
				return '';
			p.append(jQuery.create('option', {
				attributes:{value: this.data.options[key].value},
				children: this.data.options[key].content.toString()
			}));
			if (this.data.options[key].isDefault == 'yes') {

				p.children()[key].selected = true;
				if (p.children()[key].value!=0)
					hasDefaultOption=true;
			}
			idx++;
		}

		this.setStyle(p, this.data.styles);
		this.addCss(p, this.data.css);
		this.bindEvents(p, this.data.events);

		this.element = p;

		if (hasDefaultOption)
			this.removeNullOption();

		return p;
	},

	updateOptions: function(newOptions, selected) {

		if(this.compareOptions(this.data.options, newOptions)) {
			if (this.element.value == selected)
				return;
			else {
				for(var idx=0, len=this.element.options; idx<len; idx++) {
					var opt = this.element.options[idx];
					if (opt.value == selected) opt.selected = true;
				}
				return;
			}
		}
		this.data.options = newOptions;
		this.removeOptions(this.element);
		this.injectOptions(this.element, newOptions, selected);
	},
	injectOptions: function(element, options, selected) {
		var idx = 0;
		var p = jQuery(element);
		for(var k = 0; k < options.length; k++){
			p.append(jQuery.create('option', {
				attributes:{value: options[k].value},
				children: options[k].content.toString()
			}));
			if (options[k].value == selected) {
				p.children('option')[idx].selected = true;
			}
			idx++;
		}
	},

	removeOptions: function(selectObj) {
		jQuery(selectObj).children('option').each(function(){jQuery(this).remove();});
	},

	removeNullOption: function() {
		if (!this.element) return;
		var length = this.element.children().length;
		for(var i=0; i<length; i++) {
			if (this.element.children()[i].value==0) {
				jQuery(this.element.children()[i]).remove();
				return;
			}
		}

	},

	compareOptions: function(o, n) {
		if (o.length != n.length) return false;

		for(var idx=0; idx<o.length; idx++) {
			if(o[idx].value!=n[idx].value)
				return false;
		}

		return true;
	},
	isSelected: function() {
		return this.element.val()>0;
	},

	setSelected: function(optionId) {
	},

	getSelectedOption: function() {
		for(var idx=0; idx<this.data.options.length; idx++) {
			var option = this.data.options[idx];

			if(option.value ==  this.element.value) {
				return option;
			}
		}
		return '';
	}
});

Commerce.RadioButton = jQuery.klass(Commerce.Element, {
	initialize: function(controlData, quickInfo) {
		this.data = controlData;
		this.element = new Array();
		this.selected = 0;
		if (!quickInfo)
			this.isQuickInfo = false;
		else
			this.isQuickInfo = quickInfo;
	},

	getValue: function() {
		if (this.selected>0) return this.selected;
		var found = jQuery(this.elements).filter(function() {
			return jQuery(this).attr('checked') == 'checked';
		});
		return !found || found.length==0 ?undefined:found[0].val();
	},

	setSelected: function(optionId) {
		this.selected = optionId;
	},


	toElement: function(p) {
		if(!p){
			p = jQuery.create("div");
		} else {
			p = jQuery(p);
		}
		//var p = jQuery.create("div");
		p.attr("id", this.data.id);
		p.attr("name", this.data.name);
		var id = this.data.id;
		p = jQuery(p);
		var radioName = this.data.name;
		var elements = new Array();
		var data = this.data;
		for(var k = 0; k < this.data.options.length; k++){
			if (!this.data.options[k])
				return undefined;
			var div = jQuery.create("div");
			p.append(div);
			var radioData = {};
			radioData.name = radioName+"_"+id;
			//radioData.id = id;
			radioData.value = this.data.options[k].value;
			radioData.type = 'radio';
			radioData.styles = data.styles;
			//radioData.css = data.css;
			radioData.events = data.events;
			var radioButton = new Commerce.InputBox(radioData, this.data.options[k].isDefault=='yes').toElement();
			elements.push(radioButton);
			div.append(radioButton);
			var labeldiv = jQuery.create("div");
			labeldiv.addClass('f-field');
			var label = jQuery.create("label");
			label.append(document.createTextNode(this.data.options[k].content));
			div.append(labeldiv);
			labeldiv.append(label);
			div.attr("class", data.css);

			if (this.data.options[k].isDefault == 'yes') {
				radioButton.attr('checked', true);
				this.data.options[k].selected = this.data.options[k].value;
			}
		}
		this.elements = elements;

		this.setStyle(p, this.data.styles);
		this.addCss(p, this.data.css);
		//this.bindEvents(p, this.data.events);

		return p;
	},


	updateOptions: function(newOptions, selected) {

	},
	injectOptions: function(element, options, selected) {

	},

	removeOptions: function(selectObj) {
	},

	removeNullOption: function() {
	},

	compareOptions: function(o, n) {
		return false;
	},

	toRadioButtonGroup2: function(p) {
		p = lQuery(p);
		var e_div3 = jQuery.create("div");
		var e_div4 = jQuery.create("div");
		e_div3.addClass('radioColumn');
		e_div4.addClass('radioColumn last');

		p.remove(p.children()[0]); //removing first option
		var total_radios = p.children().length;
		var max_radios = p.children().length/2;
		if((max_radios - Math.floor(max_radios)) > 0){
			max_radios = Math.floor(max_radios) + 1;
		}

		var temp_element;
		for(var r_idx = 0; r_idx < total_radios; r_idx++){
			temp_element = jQuery(p.children()[r_idx]).clone();
			if(max_radios > r_idx){
				e_div3.append(temp_element);
			}
			else{
				e_div4.append(temp_element);
			}
		}
		total_radios--;
		while(total_radios >= 0){
			p.remove(p.children()[total_radios]);
			total_radios--;
		}
		p.append(e_div3);
		p.append(e_div4);

		return p;
	},

	toRadioButtonGroup: function(p) {
		p = jQuery(p);
		var e_div3 = jQuery.create("div");
		var e_div4 = jQuery.create("div");
		var e_div5 = jQuery.create("div");
		e_div3.addClass('radioColumn');
		e_div4.addClass('radioColumn');
		e_div5.addClass('radioColumn last');

		p.remove(p.children()[0]); //removing first option
		var total_radios = p.children().length;
		var max_radios = p.children().length/3;
		if((max_radios - Math.floor(max_radios)) > 0){
			max_radios = Math.floor(max_radios) + 1;
		}

		var temp_element;
		for(var r_idx = 0; r_idx < total_radios; r_idx++){
			temp_element = jQuery(p.children()[r_idx]).clone();
			if(max_radios > r_idx){
				e_div3.append(temp_element);
			}
			else if((2*max_radios) > r_idx){
				e_div4.append(temp_element);
			}
			else{
				e_div5.append(temp_element);
			}
		}
		total_radios--;
		while(total_radios >= 0){
			p.remove(p.children()[total_radios]);
			total_radios--;
		}
		p.append(e_div3);
		p.append(e_div4);
		p.append(e_div5);

		return p;
	},

	isSelected: function() {
		return this.getValue()!=undefined;
	},
	getSelectedOption: function() {
		for(var idx=0; idx<this.data.options.length; idx++) {
			var option = this.data.options[idx];

			if(option.value ==  this.getValue()) {
				return option;
			}
		}
		return '';
	}

});

Commerce.InputBox = jQuery.klass(Commerce.Element, {
	initialize: function(controlData, checked) {
		this.data = controlData;
		this.checked = checked;
	},

	toElement: function() {

		var p;
		if (this.data.type=='radio' && jQuery.browser.msie) {
			if (this.checked==true) {
				p = jQuery('<input type="radio" name="'+this.data.name+'" checked/>');
			}else {
				p = jQuery('<input type="radio" name="'+this.data.name+'"/>');
			}
		}else {
			p = jQuery.create("input");
			p = jQuery(p);
			p.attr("type", this.data.type);
		}

		p = jQuery(p);
		if (this.data.id)
			p.attr("id", this.data.id);
		p.attr("name", this.data.name);
		p.attr("value", this.data.value);
		this.setStyle(p, this.data.styles);
		this.addCss(p, this.data.css);
		this.bindEvents(p, this.data.events);

		this.element = p;

		return p;
	}
});

Commerce.Link = jQuery.klass(Commerce.Element, {
	initialize: function(controlData) {
		this.data = controlData;
	},

	toElement: function() {

		var p = jQuery.create("a");
		p = jQuery(p);
		p.attr("id", this.data.id);
		p.attr("name", this.data.name);
		p.attr("href", this.data.href);
		p.append(document.createTextNode(this.data.content));

		this.setStyle(p, this.data.styles);
		this.addCss(p, this.data.css);
		this.bindEvents(p, this.data.events);

		this.element = p;

		return p;
	}
});

Commerce.FieldSet = jQuery.klass(Commerce.Element, {
	initialize: function(controlData) {
		this.data = controlData;
	},

	toElement: function() {

		var p = jQuery.create("fieldset");

		this.setStyle(p, this.data.styles);
		this.addCss(p, this.data.css);
		this.bindEvents(p, this.data.events);

		this.element = p;

		return p;
	}
});

Commerce.Popup = jQuery.klass({
	initialize: function(header, body, footer, buttons){
		this.popup = jQuery('#js-popup-message');
		if (!this.popup || this.popup.length <=0) {
			this.popup = jQuery.create("div");
			this.popup.attr('id', 'js-popup-message');
			this.popup.addClass('popup');
			jQuery('body').append(this.popup);
		}
		this.reset();
		if (header != undefined)
			this.header.html(header);
		if (body != undefined)
			this.body.html(body);
		if (footer != undefined)
			this.footer.html(footer);
		if (buttons != undefined)
			this.button.html(buttons);
		else
			this.createDefaultButton();
	},

	createDefaultButton: function() {
		var data = {};
		data.href = 'javascript:void(0);';
		data.content = 'CANCEL';
		data.css = ['popup_menuItem'];
		data.events = [['click', 'hide', this]];
		var button = new Commerce.Link(data);

		jQuery(this.button).html(button.toElement());
	},

	show: function() {

		this.popup.show();
		var center_x=(jQuery(window).width() - this.popup.outerWidth())/2 +document.body.parentNode.scrollLeft;
		var center_y=(jQuery(window).height() - this.popup.outerHeight())/2 + document.body.parentNode.scrollTop;

		this.popup.css({
			'left': center_x + "px",
			'top': center_y + "px",
			'visibility': 'visible',
			'z-index': '2000'
		});
	},
	hide: function() {
		this.popup.hide();
	},
	reset: function() {
		this.popup.children().each(function() {
			jQuery(this).remove();
		});

		this.header = jQuery.create("div");
		this.header.attr('id', 'js-popup-header');
		this.body = jQuery.create("div");
		this.body.attr('id', 'js-popup-body');
		this.footer = jQuery.create("div");
		this.footer.attr('id', 'js-popup-footer');
		this.button = jQuery.create("div");
		this.button.attr('id', 'js-popup-button');

		this.popup.append(this.header);
		this.popup.append(this.body);
		this.popup.append(this.footer);
		this.popup.append(this.button);
	},
	destroy: function() {
		Element.remove(this.popup);
	}
});

Commerce.Cache = {
	cleanAll: function() {
		Commerce.Cache['item'] = new Hashtable();
		Commerce.Cache['currency'] = new Hashtable();
		Commerce.Cache['attribute'] = new Hashtable();
		Commerce.Cache['basket'] = new Hashtable();
		Commerce.Cache['product'] = new Hashtable();
		Commerce.Cache['message'] = new Hashtable();
		Commerce.Cache['addInfo'] = new Hashtable();
	}
};

Commerce.Cache['item'] = new Hashtable();
Commerce.Cache['currency'] = new Hashtable();
Commerce.Cache['attribute'] = new Hashtable();
Commerce.Cache['basket'] = new Hashtable();
Commerce.Cache['product'] = new Hashtable();
Commerce.Cache['message'] = new Hashtable();
Commerce.Cache['addInfo'] = new Hashtable();

function processAdditionalInfo(result) {}

Commerce.Domain = jQuery.klass({
	initialize: function() {
		this.id=0;
		//this.domainName;
	},

	getDomain: function(domainName, vid, id, URL) {
		var idx = (isNaN(id) ? id : id-0);
		var domain = Commerce.Cache[domainName].get(idx);
		if (!domain) {
			this.ajaxGetRequest(this.assembleGetRequestParams(), URL);
			domain = Commerce.Cache[domainName].get(idx);
		} else {
			this.processAddInfo(id, this.assembleGetRequestParams());
		}
		return domain;
	},

	ajaxGetRequest: function(params, URL) {
		var obj = this;
		jQuery.ajax({
			url: URL,
			type: 'get',
			data: params,
			async: false,
			dataType: 'json',
			success: function(r){obj.onGetSuccess(r)},
			error: function(r){obj.onGetFailure(r)},
			complete: function(r){obj.onGetComplete(r)}
		});
	},

	assembleGetRequestParams: function() {
		alert("please implement FUNC assembleGetRequestParams in your class!");
		return undefined;
	},
	onGetFailure: function() {
		alert("please implement FUNC onGetFailure in your class!");
		return undefined;
	},
	onGetSuccess: function(response) {

		var addInfo = (response.__AddInfo ? response.__AddInfo : '') ;
		if(response.__Success == "false") return;
		var result = (response.__Result ? response.__Result : '');
		if (jQuery.isArray(result)) {
			for (var i=0; i<result.length; i++) {
				this.cacheDomain(result[i]);
				this.cacheAddInfo(result[i], addInfo);
			}
		}
		else {
			this.cacheDomain(result);
			this.cacheAddInfo(result, addInfo);
		}
		processAdditionalInfo(addInfo);
	},

	onGetComplete: function() {
	},

	clearCache: function(){
		Commerce.Cache[this.domainName].remove(this.id);
	},

	cacheDomain: function(domain) {
		alert("please implement FUNC cache in your class!");
		return undefined;
	},

	cacheAddInfo: function(domain, addInfo) {
		return undefined;
	},

	processAddInfo: function(id) {
		return undefined;
	},

	initAdditionalParams: function () { //override it on page
		return undefined;
	}

});

function FormParam(name, value) {
	this.name = name;
	this.value = value;
	return this;
}

FormParam.prototype = {
	name : null,
	value: null
}

function FormParams() {
	this.params = new Array();
	return this;
}

FormParams.prototype = {
	params : new Array(),

	addParam: function(param) {
		this.params[this.params.length] = param;
	},

	getParams: function() {
		return this.params;
	}
}
function initAdditionalParams() {
	return undefined;
}

Commerce.Domain.Basket = jQuery.klass(Commerce.Domain, {
	initialize: function(vid) {
		this.url = 'getbasket.ajx';
		this.domainName = 'basket';
		this.id = 0;
		this.vid = vid;
		this.domain = this.getDomain(this.domainName, vid, 0, this.url);
	},

	findProduct: function(basketItemId) {
		return new Commerce.Domain.Product(jQuery(this.domain.products).filter(function() {
			return basketItemId==this.id;
		}));
	},

	assembleGetRequestParams: function() {
		var params = {};
		params.vid = this.vid;
		params.basketid = this.id;
		return params;
	},

	cacheDomain: function(domain) {
		Commerce.Cache[this.domainName].put(0, domain);
	}
});
Commerce.Domain.Item = jQuery.klass(Commerce.Domain, {
	initialize: function(vid, itemid, itemcode, refreshMode) {
		this.url = 'getitems.ajx';
		this.domainName = 'item';
		this.id = itemid;
		this.vid = vid;
		this.addParams = initAdditionalParams(itemcode);
		this.refreshMode = refreshMode;
		if (refreshMode)
			this.addParams[this.addParams.length]=new FormParam(refreshMode.name, refreshMode.value);
		this.domain = this.getDomain(this.domainName, vid, itemid, this.url);
	},

	assembleGetRequestParams: function() {
		var params = {};
		params.vid = this.vid;
		if (jQuery.isArray(this.id))
			params.itemid = this.id.toString();
		else
			params.itemid = this.id;
		if (this.addParams) {
			for (var i=0;i<this.addParams.length;i++) {
				params[this.addParams[i].name]=this.addParams[i].value;
			}
		}
		return params;
	},

	cacheDomain: function(domain) {
		if(!domain || !domain.itemid){
			console.error("Can't cache Domain. Domain not contains itemid.");
		} else {
			Commerce.Cache[this.domainName].put(domain.itemid, domain);
		}
	},

	cacheAddInfo: function(domain, addInfo) {
		if(!domain || !domain.itemid){
			console.error("Can't cache AddInfo. Domain not contains itemid.");
		} else {
			Commerce.Cache['addInfo'].put(domain.itemid, addInfo);
		}
	},

	processAddInfo: function(id, params) {
		if (this.refreshMode) {
			params["newItemSku"] = Commerce.Cache[this.domainName].get(id).code;
			jQuery.ajax({
				url: "updateaddinfo.ajx",
				type: 'post',
				data: params,
				async: false,
				dataTyoe: "json",
				success: function(response) {
					var addInfo = (response.__AddInfo ? response.__AddInfo : '');
					processAdditionalInfo(addInfo);
				},
				error: function() {},
				complete: function() {}
			})
		}
	},

    initPricesOpt: function(){
        if(this.domain && this.domain.skuids && this.domain.skuids.length >0){
            var skuIds = this.domain.skuids;
            for(var i=0, l=skuIds.length; i<l; i++){
                var sku = Commerce.Cache[this.domainName].get(skuIds[i]-0);
                if(!sku) new Commerce.Domain.Item(page_handler.get_vendorId(), skuIds);
                var ex = false;
                for(var t=0,c=this.domain.prices.length; t<c;t++){
                    if(this.domain.prices[t].id === sku.prices[0].id) ex = true;
                }
                if(!ex){
                    this.domain.prices.push(sku.prices[0]);
                }
            }
        }
    },

	getPrice: function(code) {
		if (this.domain.prices.length == 0)
			return undefined;

		var price;

		if (code=='' || !code) {
			price = this.findPrice(this.domain.code)[0];
			if (!price)
				price = this.domain.prices[0];
		}
		else {
			price = this.findPrice(code)[0];
			if (!price)
				price=this.findPrice(this.domain.code)[0];
		}
		if (price != undefined)
			price.customerDiscount = 1-this.domain.discount;
		return price;
	},

    getLowPrice: function(){
        if (this.domain.prices.length === 0) return undefined;
        var price;
        var prices = this.domain.prices;
        for(var i=0, l=prices.length; i<l; i++){
            var tmp = prices[i];
            if((tmp.price_1+tmp.setup) > 0
                    && (!price || (tmp.price_1+tmp.setup) < (price.price_1+price.setup))){
                price = tmp;
            }
        }
        if (price !== undefined) price.customerDiscount = 1-this.domain.discount;
		return price;
    },

    getHighPrice: function(){
        if (this.domain.prices.length === 0) return undefined;
        var price;
        var prices = this.domain.prices;
        for(var i=0, l=prices.length; i<l; i++){
            var tmp = prices[i];
            if((tmp.price_1+tmp.setup) > 0 
                    && (!price || (tmp.price_1+tmp.setup) > (price.price_1+price.setup))){
                price = tmp;
            }
        }
        if (price !== undefined) price.customerDiscount = 1-this.domain.discount;
		return price;
    },

	getInventory: function(code) {
		if (this.domain.invs.length == 0)
			return undefined;
		if (code=='') {
			var inv = {};
			inv.instock = this.sumInStock();
			inv.minorderqty = this.domain.invs[0].minorderqty;
            inv.hide=inv.instock>0?false:true;
			return [inv];
		}
		else {
			inv = this.findInventory(code);
			if(inv.length==0){
				var idx=code.indexOf(".");
				if(idx>-1){
					var basecode=code.substring(0,idx);
					inv = this.findInventory(basecode);
				}
			}
			return inv;
		}
	},

	findPrice: function(code) {
		return jQuery(this.domain.prices).filter(function() {
			return jQuery.trim(this.itemcode)==jQuery.trim(code) ;
		});
	},

	findInventory: function(code) {
		return jQuery(this.domain.invs).filter(function() {
			return jQuery.trim(this.code)==jQuery.trim(code) ;
		});
	},

	sumInStock: function() {
		var sum = 0;
		for(var k = 0; k<this.domain.invs.length; k++){
			sum+=this.domain.invs[k].instock;
		}
		return sum;
	}
});

Commerce.Domain.Currency = jQuery.klass(Commerce.Domain, {
	initialize: function(vid, currencyid) {
		this.url = 'getcurrency.ajx';
		this.domainName = 'currency';
		this.id = currencyid;
		this.vid = vid;
		this.domain = this.getDomain(this.domainName, vid, currencyid, this.url);
	},

	assembleGetRequestParams: function() {
		var params = {};
		params.vid = this.vid;
		params.currencyid = this.id;
		return params;
	},

	cacheDomain: function(domain) {
		Commerce.Cache[this.domainName].put(domain.currencyId, domain);
	}

});

Commerce.Domain.Message = jQuery.klass(Commerce.Domain, {
	initialize: function(vid, messageid) {
		this.url = 'getmessage.ajx';
		this.domainName = 'message';
		this.id = messageid;
		this.vid = vid;
		this.domain = this.getDomain(this.domainName, vid, messageid, this.url);
	},

	assembleGetRequestParams: function() {
		var params = {};
		params.vid = this.vid;
		params.messageid = this.id;
		return params;
	},

	cacheDomain: function(domain) {
		Commerce.Cache[this.domainName].put(domain.messageid, domain);
	}

});

Commerce.Domain.Product = jQuery.klass({
	initialize: function(product) {
		this.domain=product[0];
	},

	findOption: function(attributeId) {
		var attributes = this.findAttribute(attributeId);
		if (!attributes)
			return undefined;
                var attribute = attributes[0];

		if (attribute.attype==2)
			return attribute.optionId;

		if (attribute.attype==3)
			return attribute.value;
		return undefined;
	},

	findAttribute: function(attributeId) {
		return jQuery(this.domain.attributes).filter(function() {
			return this.attributeId==attributeId;
		});
	}

});

Commerce.Domain.Attribute = jQuery.klass(Commerce.Domain, {
	initialize: function(vid, attributeid) {
		this.url = 'getattributes.ajx';
		this.domainName = 'attribute';
		this.id = attributeid;
		this.vid = vid;
		this.domain = this.getDomain(this.domainName, vid, attributeid, this.url);
		this.domain.options = this.domain.options.sort(function(a,b) {
			return a.choice-b.choise;
		});
		this.optionFilter = new Array();
		this.css = [];
		this.name = '';
		this.events = [];
	},

	assembleGetRequestParams: function() {
		var params = {};
		params.vid = this.vid;
		params.attributeid = this.id;
		return params;
	},

	cacheDomain: function(domain) {
		Commerce.Cache[this.domainName].put(domain.attributeid, domain);
	},

	filterOption: function(skus, option) {
		if (skus.length==0)
			return true;

		for(var idx=0; idx<skus.length; idx++) {
			if (skus[idx].indexOf(':'+option.optionid+'_')>0 || skus[idx].substring(skus[idx].length - (':'+option.optionid).length)==(':'+option.optionid))
				return true;
		}

		return false;

	},
	initializeSelectBox: function(name, css, events, container) {
		this.css = css;
		this.name = name;
		this.events = events;
		this.container = container;
	},
	toSelectBox: function(enableDefault, optionid) {
		var filter = this.optionFilter;
		if (!enableDefault)
			enableDefault = false;

		if (!optionid)
			optionid = 0;

		if (!filter)
			filter = [];

		var data = {};
		data.css = this.css;
		data.name = 'attribute_'+this.id;
		data.events = this.events;
		data.id = 'attribute_'+this.id;
		var options = new Array();
		var dropOpt = {};
		dropOpt.value=0;
		dropOpt.content = this.domain.dropname;
		dropOpt.isDefault = 'no';
		options[0] = dropOpt;
		for(var idx=0; idx<this.domain.options.length; idx++) {

			if (this.domain.enablesku==false || this.filterOption(filter, this.domain.options[idx])) {

				var option = this.domain.options[idx];
				var opt = {};
				opt.value = option.optionid;
				opt.content = option.ddtext;
				if (optionid==0 && enableDefault && this.domain.enablesku==false)
					opt.isDefault = ((option.def==2)?'yes':'no');
				if (optionid>0) {
					opt.isDefault = ((option.optionid==optionid)?'yes':'no');
				}
				opt.textValue = option.text_value;
				options.push(opt);
			}
		}
		data.options = options;
		this.selectBox = new Commerce.SelectBox(data);
		return this.selectBox.toElement();
	},

	toRadioButton: function(enableDefault, optionid, quickinfo) {
		var filter = this.optionFilter;
		if (!enableDefault)
			enableDefault = false;

		if (!optionid)
			optionid = 0;

		if (!filter)
			filter = [];

		var data = {};
		data.css = this.css;
		data.name = this.name;
		data.events = this.events;
		data.id = this.id;
		var options = new Array();
		var dropOpt = {};
		dropOpt.value=0;
		dropOpt.content = this.domain.dropname;
		dropOpt.isDefault = 'no';
		//options[0] = dropOpt;
		for(var idx=0; idx<this.domain.options.length; idx++) {

			if (this.domain.enablesku==false || this.filterOption(filter, this.domain.options[idx])) {

				var option = this.domain.options[idx];
				var opt = {};
				opt.value = option.optionid;
				opt.content = option.ddtext;
				if (optionid==0 && enableDefault && this.domain.enablesku==false)
					opt.isDefault = ((option.def==2)?'yes':'no');
				if (optionid>0) {
					opt.isDefault = ((option.optionid==optionid)?'yes':'no');
				}
				opt.textValue = option.text_value;
				options[idx] = opt;
			}
		}
		data.options = options;
		this.selectBox = new Commerce.RadioButton(data, quickinfo);
		return this.selectBox.toElement(this.container);
	},

	toTextArea: function(value) {
		var data = {};
		if (!value)
			data.value = this.domain.defvalue;
		else
			data.value = value;
		data.cols = this.domain.cols;
		data.rows = this.domain.rows;
		data.events = this.events;


		this.textArea = new Commerce.TextArea(data);
		return this.textArea.toElement();
	},

	updateFilter: function() {
		if (this.selectBox.isSelected()==false) return this.optionFilter;
		var pattern=this.domain.attributeid+':'+this.selectBox.getValue();

		var findedSkus = [];
		for(var k in this.optionFilter){
			if(this.optionFilter[k].indexOf(pattern)>=0) findedSkus.push(this.optionFilter[k]);
		}
		return findedSkus;
	},

	updateSelectBox: function() {

		if (this.domain.enablesku==false) return;
		var filter = this.optionFilter;
		var optionid = this.selectBox.getValue();
		var options = this.getOptions(filter, optionid);
		this.selectBox.updateOptions(options, this.optionid);
	},

	removeNullOption: function() {
		this.selectBox.removeNullOption();
	},

	getOptions: function(filter, optionid) {
		var options = new Array();
		var opts = this.domain.options;

		var dropOpt = {};
		dropOpt.value=0;
		dropOpt.content = this.domain.dropname;

		var hit = false;
		var oneSku = (filter.length==1);
		if (optionid == 0 && oneSku==false) {
			dropOpt.isDefault = 'yes';
			hit = true;
		}
		else
			dropOpt.isDefault = 'no';

		options.push(dropOpt);

		for(var idx=0; idx<opts.length; idx++) {
			var option = opts[idx];
			if (this.filterOption(filter, opts[idx])) {
				var opt = {};
				opt.value = option.optionid;
				opt.content = option.ddtext;
				if (option.optionid == optionid || oneSku) {
					opt.isDefault = 'yes';
					hit = true;
					optionid = option.optionid;
				}
				else
					opt.isDefault = 'no';

				options.push(opt);
			}
		}
		if (hit==false) {
			dropOpt.isDefault = 'yes';
			this.optionid = 0;
		}
		else
			this.optionid = optionid;

		return options;
	},

	isSelected: function() {
		if (this.domain.attype=='3')
			return true;
		else
			return this.selectBox.isSelected();
	},

	getValue: function() {
		if (this.domain.attype=='3')
			return this.textArea.element.val();
		else
			return this.selectBox.getValue();
	},

	enableSku: function() {
		return this.domain.enablesku;
	},

	getSelectedCode: function() {
		var optionid = this.selectBox.getValue()
		if (this.domain.attype=='3')
			return '';
		else
			return jQuery(this.domain.options).filter(function() {
				return this.optionid==optionid;
			})[0].code;
	},

	setSelected: function(optionId) {
		this.selectBox.setSelected(optionId);
	}
});

function refreshAdditionalParams(item) {}
Commerce.BO = {};

Commerce.BO.Sku = jQuery.klass({

	initialize: function(vid, item, itemcode, refreshMode) {
		if (typeof(item) == "number" || typeof(item) == "string")
			this.item = new Commerce.Domain.Item(vid, item, itemcode, refreshMode);
		else
			this.item = item;
		//this.mainItemBO;

		this.attribs = new Array();
		this.skuAttribs = new Array();
		this.mainItemSkus = new Hashtable();

		var attributes = this.item.domain['attributes'];
		attributes.sort(function(a,b) {
			return a.position-b.position;
		});

		for(var idx=0, len=attributes.length; idx<len; idx++) {
			var attribute = attributes[idx];
			var attrib = new Commerce.Domain.Attribute(vid, attribute.attributeid);
			this.attribs.push(attrib);
			if (attrib.domain.enablesku==true) {
				this.skuAttribs.push(attrib);
			}
		}
		//this.skuAttribs= this.skuAttribs.sort(function(attribute) {return attribute.domain.position;});
		//this.attribs =this.attribs.sort(function(attribute) {return attribute.domain.position;});
		this.skus = this.item.skus;
		this.vid = vid;
		this.initAllSkus();
		this.initAvailableSkus();
		this.initMainItemSkus();

		this.lp_itemimage = "";
		this.lp_largeimage="";
	},

	refreshLpImages: function() {
		if(this.item.domain.lp_itemimage && this.item.domain.lp_largeimage) {

			this.lp_itemimage = lp_host+this.item.domain.lp_itemimage.replace(new RegExp("\\$\{cnt_location\}",'g'),cnt_location);
			this.lp_largeimage = lp_host+this.item.domain.lp_largeimage.replace(new RegExp("\\$\{cnt_location\}",'g'),cnt_location);
			for(var idx=0; idx<this.attribs.length; idx++) {
				var attribute = this.attribs[idx];

				var tegName = attribute.domain.dataname.replace(new RegExp("\\s+",'g'),"_");

				if(attribute.selectBox) {
					var textValue = attribute.selectBox.getSelectedOption().textValue;
				} else if(attribute.textArea) {
					textValue = attribute.textArea.getValue();
				}

				this.lp_itemimage = this.lp_itemimage.replace(new RegExp("\\$\{lp_"+tegName+"\}",'gi'),escape(textValue))
				this.lp_largeimage = this.lp_largeimage.replace(new RegExp("\\$\{lp_"+tegName+"\}",'gi'),escape(textValue))

			}
		}
	},

	hasSkuEnabledAttribute: function() {
		return this.skuAttribs.length>0;
	},

	isMainItem: function() {
		return this.item.domain.mainitemid==0;
	},

	getMainItemBO: function() {
		if (!this.mainItemBO)
			return this;
		else
			return this.mainItemBO;
	},

	initMainItemSkus: function() {
		if (this.isMainItem()) {
			this.mainItemSkus = this.avaiSkus;
			return;
		}

		this.mainItemBO = new Commerce.BO.Sku(this.vid, this.item.domain.mainitemid, this.item.domain.code);
		this.mainItemSkus = this.mainItemBO.avaiSkus;
		refreshAdditionalParams(this.item.domain)
	},
	initAllSkus: function() {


		var compCodes = new Array();


		compCodes.push(this.item.domain.code+"-");
		var skus = new Array();
		skus.push('sku');
		for(var idx=0, len=this.skuAttribs.length; idx<len; idx++) {
			var attrib = this.skuAttribs[idx];
			for(var idx2=0, len2=skus.length; idx2<len2; idx2++) {
				var sku = skus.shift();
				var compCode = compCodes.shift();
				for(var idx3=0, len3=attrib.domain.options.length; idx3<len3; idx3++) {
					var option = attrib.domain.options[idx3];
					skus.push(sku+"_"+option.attributeid+':'+option.optionid);
					if (compCode.substring(compCode.length - '-'.length) == '-')
						compCodes.push(compCode+option.code);
					else
						compCodes.push(compCode+"."+option.code);
				}
			}
		}

		this.allSkus = (skus.length>1)?skus:[];
		this.compCodes = (compCodes.length>1)?compCodes:[];
	},

	getDefaultSkuId: function() {
		var skus =  this.item.domain.skus;
		if (this.skuAttribs.length>0)
			for (var idx=0; idx<this.skuAttribs[0].domain.options.length; idx++) {
				for( var idx2=0; idx2<skus.length; idx2++) {
					if (this.skuAttribs[0].domain.options[idx].optionid==skus[idx2].optionid){
						return skus[idx2].skuid;
					}
				}
			}
		return undefined;
	},

	needSwitchImage: function() {
		for(var idx=0, len=this.skuAttribs.length; idx<len; idx++) {
			var attrib = this.skuAttribs[idx];
			if (attrib.domain.switchimage=='Y')
				return true;
		}
		return false;
	},

	initAvailableSkus: function() {
		var skus = this.item.domain.skus;
		this.avaiSkus = new Hashtable();
		if (skus.length<=0)
			return this.avaiSkus;

		var skus2 = new Array();
		var items = [];
		for(var k in skus){
			if(jQuery.inArray(skus[k].skuid, items)) items.push(skus[k].skuid);
		}

		for(var idx=0; idx<items.length; idx++) {
			var itemskus = [];
			for(k in skus){
				if(skus[k].skuid==items[idx]) itemskus.push(skus[k]);
			}
			skus2.push(itemskus);
		}

		for(idx=0; idx<skus2.length; idx++) {
			var sku = skus2[idx];
			if (sku !='') {
				var obj = this;
				var newSku = sku.sort(function(){return obj.sortAttributeById(sku)});
				var sku_value = 'sku';
				for(var idx2=0; idx2<newSku.length; idx2++) {
					sku_value += '_'+newSku[idx2].attributeid+':'+newSku[idx2].optionid;
				}
				this.avaiSkus.put(sku[0].skuid, sku_value);
			}
		}
		return undefined;
	},

	sortAttributeById: function(sku) {

		var attribute = jQuery(this.item.domain.attributes).filter(function() {
			if (sku.attributeid==this.attributeid)
				return true;
			else
				return false;
		});
		if (attribute != undefined && attribute.length>0)
			return attribute.position;
		else {
			return 1;
		}

	}

});

Commerce.BO.ChoosenSku = jQuery.klass({


	initialize: function(vid, item, attributesIds) {
		if (typeof(item) == "number" || typeof(item) == "string")
			this.item = new Commerce.Domain.Item(vid, item);
		else
			this.item = item;
		//this.mainItemBO;

		this.attribs = new Array();
		this.skuAttribs = new Array();
		this.mainItemSkus = new Hashtable();

		var attributes = this.item.domain['attributes'];
		attributes.sort(function(a,b) {
			return a-b;
		});

		for(var idx=0, len=attributes.length; idx<len; idx++) {
			var attribute = attributes[idx];
			if(typeof attributesIds !="undefined"){
				for(var aidx=0,alen=attributesIds.length;aidx<alen;aidx++){
					var tempattr = attributesIds[aidx];
					if(attribute.attributeid == tempattr){
						var attrib = new Commerce.Domain.Attribute(vid, attribute.attributeid);
						this.attribs.push(attrib);
						if (attrib.domain.enablesku==true) {
							this.skuAttribs.push(attrib);
						}
					}
				}
			}
		}
		//this.skuAttribs= this.skuAttribs.sort(function(attribute) {return attribute.domain.position;});
		//this.attribs =this.attribs.sort(function(attribute) {return attribute.domain.position;});
		this.skus = this.item.skus;
		this.vid = vid;
		this.initAllSkus();
		this.initAvailableSkus();
		this.initMainItemSkus();
	},

	hasSkuEnabledAttribute: function() {
		return this.skuAttribs.length>0;
	},

	isMainItem: function() {
		return this.item.domain.mainitemid==0;
	},

	getMainItemBO: function() {
		if (!this.mainItemBO)
			return this;
		else
			return this.mainItemBO;
	},

	initMainItemSkus: function() {
		if (this.isMainItem()) {
			this.mainItemSkus = this.avaiSkus;
			return;
		}

		this.mainItemBO = new Commerce.BO.Sku(this.vid, this.item.domain.mainitemid);
		this.mainItemSkus = this.mainItemBO.avaiSkus;

	},
	initAllSkus: function() {

		var skus = new Array();
		var compCodes = new Array();

		skus.push('sku');
		compCodes.push(this.item.domain.code+"-");

		for(var idx=0, len=this.skuAttribs.length; idx<len; idx++) {
			var attrib = this.skuAttribs[idx];
			for(var idx2=0, len2=skus.length; idx2<len2; idx2++) {
				var sku = skus.shift();
				var compCode = compCodes.shift();

				for(var idx3=0, len3=attrib.domain.options.length; idx3<len3; idx3++) {
					var option = attrib.domain.options[idx3];
					skus.push(sku+"_"+option.attributeid+':'+option.optionid);
					if (compCode.substring(compCode.length - '-'.length) == '-')
						compCodes.push(compCode+option.code);
					else
						compCodes.push(compCode+"."+option.code);
				}
			}
		}

		this.allSkus = (skus.length>1)?skus:[];
		this.compCodes = (compCodes.length>1)?compCodes:[];
	},

	initAvailableSkus: function() {
		var skus = this.item.domain.skus;
		this.avaiSkus = new Hashtable();
		if (skus.length<=0)
			return this.avaiSkus;

		var skus2 = new Array();
		var items = [];
		for(var k in skus){
			if(jQuery.inArray(skus[k].skuid, items)) items.push(skus[k].skuid);
		}

		for(var idx=0; idx<items.length; idx++) {
			var itemskus = [];
			for(k in skus){
				if(skus[k].skuid==items[idx]) itemskus.push(skus[k]);
			}
			skus2.push(itemskus);
		}

		for(idx=0; idx<skus2.length; idx++) {
			var sku = skus2[idx];
			if (sku !='') {
				var obj = this;
				var newSku = sku.sort(function(){return obj.sortAttributeById(sku)});
				var sku_value = 'sku';
				for(var idx2=0; idx2<newSku.length; idx2++) {
					sku_value += '_'+newSku[idx2].attributeid+':'+newSku[idx2].optionid;
				}
				this.avaiSkus.put(sku[0].skuid, sku_value);
			}
		}
		return undefined;
	},

	sortAttributeById: function(sku) {

		var attribute = jQuery(this.item.domain.attributes).filter(function() {
			if (sku.attributeid==this.attributeid)
				return true;
			else
				return false;
		});
		if (attribute != undefined && attribute.length>0)
			return attribute.position;
		else {
			return 1;
		}
	}
});
