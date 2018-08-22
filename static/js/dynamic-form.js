// 动态表单组件
var formComponent = {
	template:'#form-template',
	props:['formconfig'],
	data:function(){
		return {
			"upload":{
				status:'+'
			}
		}
	},
	computed:{
		form:function(){
			if(this.formconfig.name=='imageUrl' && this.formconfig.checked !=''){
				this.upload.status = '';
			}
			return this.formconfig;
		}
	},
	directives:{
		daterangepicker:{
			inserted: function (el, binding, vnode) {
			    var context = vnode.context;
			    var key = vnode.data.directives[0].expression;
			    var opts = MixinsDateOpts(context.form);
			    $(el).daterangepicker(opts, function (star, end, label) {
			        console.log(context[key])
			        var starDate = star.format(opts.format);
			        var endDate = end.format(opts.format);
			        var dateText = opts.singleDatePicker ? starDate : starDate+' 至 '+ endDate;
			        Vue.set(context.form, 'value', dateText);
			        context.validate();
			    });
			}
		}
	},
	methods:{
		uploadImg:function(el,e){
			var _this = this;
			var event = e || window.event;
			var file = event.target.files[0];
			var formconfig = _this.formconfig;
			var success = function(url) {
				_this.upload.status = "";
				_this.formconfig.value = url;
			};
			// 对上传的图片做验证
			if(!file) return;
			if (!uploadValidate(file, formconfig.rules, _this)) {
				return;
			} else {
				_this.formconfig.tip = '';
			}
			_this.formconfig.file = file;
			_this.upload.status = "上传中...";
			
			// 用户自定义上传
			if (formconfig.customUpload) {
				return formconfig.customUpload(file, function(url) {
					success(url);
				});
			}
			// 七牛上传
			if (formconfig.getToken && formconfig.getFileUrl) {
				formconfig.getToken(function(token) {
					var opt = {
						url: formconfig.uploadUrl || 'http://upload.qiniu.com',
						file: file,
						token: token
					};
					uploadFile(opt, function(error, res) {
						res && formconfig.getFileUrl(res, function(url) {
							success(url);
						});
					});
				});
			} else {
				console.error('请填写 getToken 和 getFileUrl');
			}
		},
		validate:function(){
			var _this = this;
            Vue.nextTick(function() {
                validate(_this);
            });
		},
		isRequired:function (formItem) {
			var require = false;
			if(isEmpty(formItem.rules)) return;
            for (var i = 0, max = formItem.rules.length; i < max; i++) {
                var rule = formItem.rules[i];
                if (rule.require) {
                    return require = true;
                }
            }
            return require;
		}
	}
};
Vue.component('formElement',formComponent);
//动态组件的日期配置处理
function MixinsDateOpts(dateOpts) {
	var datepickerLocale = {
	    format: 'YYYY-MM-DD',
	    applyLabel: '确定',
	    cancelLabel: '取消',
	    daysOfWeek: ['日', '一', '二', '三', '四', '五', '六'],
	    monthNames: ['1 月', '2 月', '3 月', '4 月', '5 月', '6 月', '7 月', '8 月', '9 月', '10 月', '11 月', '12 月']
	};
	var defaultOpt = {
		autoUpdateInput: false,
        format:'YYYY-MM-DD',
        maxDate: moment().subtract(0, 'days'),
        startDate: moment().subtract(30, 'days').format(datepickerLocale.format),
        endDate: moment().format(datepickerLocale.format),
        locale: datepickerLocale
	};
	var result = {
		singleDatePicker:dateOpts.el.type && dateOpts.el.type=='single' ? true : false,
		format:dateOpts.el.format,
		maxDate:dateOpts.el.maxDate,
        startDate:dateOpts.el.startDate,
        endDate: dateOpts.el.endDate
	};
	result = $.extend(true, {}, defaultOpt, result);
	return result;
}

function validate(context) {
	var form = context.form;
	var	rules = form.rules || [];
	var value = form.value;
	//checkcbox的 value 是 array
	if (isArray(value)) {
        value = value.length ? value : null;
    }
    value = value ? value : null;
	for (var i = 0, max = rules.length; i < max; i++) {
		var rule = rules[i];
		var	tip = rule.tip;
		if (checkValueWithRule(value, rule)) {
			context.form.tip = '';
		} else {
			return context.form.tip = tip;
		}
	}
}

// 以 [-0-], [-1-] 为参数填入
var ruleRegs = {
	require: "/\\S/g",
	max: "/(^.{0,[-0-]})|^$/",
	min: "/(^.{[-0-],})|^$/",
	phone: /(^0\d{2,3}-?\d{7,8}$)|^$/,
	email: /(^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$)|^$/,
	mobile: /(^1[358][0-9]{9}$)|^$/,
	reg: "[-0-]"
};

function checkValueWithRule(value, rule) {
	value = value || '';
	rule = rule || {};
	for (var key in rule) {
		var isValidRule = rule.hasOwnProperty(key) && 
			!!ruleRegs[key],
			ruleConditions = rule[key];
		if (isValidRule) {
			ruleReg = getRuleReg(key, ruleConditions);
			if (ruleReg.test(value)) {
				// do nothing
			} else {
				return false;
			}
		}
	}
	return true;
}

function getRuleReg(ruleName, conditions) {
	//查找默认已有的验证列表
	var reg = ruleRegs[ruleName];
	var	isRegConditions = isReg(reg);
	var	render = function(reg, arr) {
		return reg.replace(/\[-([^}]+)-\]/g, function(val) {
			var index = val.substring(2, 3);
			return arr[index];
		});
	};
	if (isRegConditions) {
		// do nothing
	} else if (reg) {
		conditions = isArray(conditions) ? conditions : [conditions];
		reg = render(reg, conditions);
		reg = eval(reg);
	}
	return reg;
}

function isArray(arr) {
	return Object.prototype.toString.call(arr) === '[object Array]';
}

function isReg(reg) {
	return Object.prototype.toString.call(reg) === '[object RegExp]';
}

function uploadValidate(file, rules, context) {
    var fileSize = file.size / 1024;
    var fileName = file.name;
    var index = fileName.lastIndexOf(".");
    var fileType = fileName.substr(index+1);
    var checkSize = function(ruleSize) {
        if (ruleSize) {
            return ruleSize >= fileSize;
        }
        return true;
    };
    var checkSuffix = function(ruleSuffix) {
        if (ruleSuffix) {
            var isMatch = false;
            ruleSuffix.forEach(function(suf) {
                suf = suf.toLowerCase();
                fileType = fileType.toLowerCase();
                if (suf === fileType) {
                    isMatch = true;
                }
            });
            return isMatch;
        }
        return true;
    };
    rules = rules || [];
    for (var i = 0; i < rules.length; i++) {
        var rule = rules[i];
        var isInValidSize = !checkSize(rule.size);
        var isInValidSuffix = !checkSuffix(rule.suffix);
        if (isInValidSuffix || isInValidSize) {
            context.form.tip = rule.tip;
            return false;
        }
    }
    return true;
}

/**
 * 七牛上传文件
 * @param  option.url   上传文件 url, 必填
 * @param  option.file  必填
 * @param  option.token 
 */
function uploadFile(option, callback) {
	var file = option.file;
	var	url = option.url;
	var	fileName = file.name;
	var	xhr = new XMLHttpRequest();
	var	form = new FormData();
	var	opt = {
		key: fileName,
		file: file,
		token: option.token
	};
	for (var key in opt) {
		if (opt.hasOwnProperty(key)) {
			form.append(key, opt[key]);
		}
	}
	xhr.open('post', url, true);
	xhr.onload = function(res) {
		res = JSON.parse(res.target.responseText);
		callback && callback(null, res);
	};
	xhr.onerror = function(error) {
		callback && callback(error);
	};
	xhr.send(form);
}

// 判断是否为空
function isEmpty(value) {
    var undef;
    var list = [null, undef, ''];
    return list.indexOf(value) >= 0;
}

//表单增加字段value 最终输出的值
function increaseFormField(formlist) {
    var result =[];
    formlist.forEach(function(el, index) {
        var defaultValue = el.type!='checkbox'?{"value":el.defalut,"tip":''}:{"value":el.defalut,"tip":''}
        result.push($.extend(true,{},defaultValue,el));
    });
    return result;
}

//判断是否必填字段
function isRequired(formItem) {
    var require = false;
    if(isEmpty(formItem.rules)) return;
    var rules = formItem.rules;
    for (var i = 0, max = rules.length; i < max; i++) {    
        var rule = rules[i]    ;
        require = rule.required ? true : false;
        return;
    }
    return require;
}     			




