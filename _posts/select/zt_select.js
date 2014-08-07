/*
*@author:duzhongbo
*@desc:
*	2到多个select的级联
*	数据和逻辑分别存放单独js，增减级联select数目时不必改动主体逻辑js
*	数据js部分基本呈现原始原始excel数据结构，不必做二次筛选
*/
(function (w) {
w.zt = {
//公共方法
    extend:function(destination, source) {
        for ( var property in source) {
            destination[property] = source[property];
        }
        return destination;
    },
    byClass: function(sClass, oParent) {
        var aClass = [];
        var reClass = new RegExp("(^| )" + sClass + "( |$)");
        var aElem = this.byTagName("*", oParent);
        for (var i = 0; i < aElem.length; i++) reClass.test(aElem[i].className) && aClass.push(aElem[i]);
        return aClass
    },
    byTagName: function(elem, obj) {
        return (obj || document).getElementsByTagName(elem)
    },
    hasClass:function (obj, sClass)
    {
        var reg = new RegExp("(^|\\s)" + sClass + "(\\s|$)");
        return reg.test(obj.className)
    },
    addClass:function (obj,cls) {
        if (!this.hasClass(obj, cls)) obj.className += " " + cls;
    },
    removeClass:function (obj,cls) {
        if (this.hasClass(obj, cls)) {
        var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
        obj.className = obj.className.replace(reg, '');
        }
    },
    loadScript: function(sScriptSrc,callbackfunction){  
        var oHead = document.getElementsByTagName('head')[0];  
        if(oHead){  
            var oScript = document.createElement('script');  
            oScript.setAttribute('src',sScriptSrc);  
            oScript.setAttribute('type','text/javascript');  
            var loadFunction = function(){  
                if (this.readyState == 'complete' || this.readyState == 'loaded'){  
                   callbackfunction();   
                }  
             };  
            oScript.onreadystatechange = loadFunction;  
            oScript.onload = callbackfunction;  
            oHead.appendChild(oScript);  
        }  
    },
    addEvent : function (ele, type, fnHandler) {
        return ele.addEventListener ? ele.addEventListener(type, fnHandler, false) : ele.attachEvent('on' + type, fnHandler);
    }
};
})(window);
//级联
(function (w) {
function SelectN(){ this.prepareArguments.apply(this,arguments); }
SelectN.prototype={
	prepareArguments:function () {
		var js,config,len=arguments.length;
		var This = this;
		if(len==3){//有回调函数,需要单独加载data.js的情况(一个页面有多个联动，并且共用一个data.js)
			js=arguments[0];//第一个参数必须是data.js的路径
			config=arguments[1];//第二个参数必须是散列参数
			This.fn=arguments[2];//第三个参数必须是回调函数
		    zt.loadScript(js,function () {
		    	This.init(config);
		    	This.fn();
		    });
		}else if(len==2){//没有回调函数，需要单独加载js的情况(一个页面只有一个联动)
			js=arguments[0];//第一个参数必须是data.js的路径
			config=arguments[1];//第二个参数必须是散列参数
			zt.loadScript(js,function () {
				This.init(config);
			});
		}else if(len==1){//没有回调函数，使用页面上已经加载的data.js的情况(一个页面有多个联动，并且共用一个data.js)
			config=arguments[0];//第一个参数必须是散列参数
			this.init(config);
		}		
	},
	init:function(config) {
		  this._config={//默认参数设置
		  	data:'data',
		  	lastAuto:false,
		  	id:'selectN',
		  	disabled:false,
		  	outside:'',
		  	J_class:'sn',
		  	valueTag:'id_',
		  	textTag:'key_'
		  };
		  var arg = this._config;
		  zt.extend(arg,config);//用户参数设置覆盖默认设置
		  this.length_data = window[arg.data].length;//得到数据总条数
		  this.linkPage=document.getElementById(arg.id);//
		  this.selectArr=[];//存放级联select
		  this.length_select = this.selectAll();//设置未选择的select灰选，返回级联select的个数
		  this.getSelect_n(0);//初始化第一个select的option
		  this.init_option();//给每个select一个“请选择XXX”
		  this.listen_onchange();//给每个select绑定onchange事件
		  if(arg.default_){//给select设置默认选项,设置是否灰选默认选项
			  for(var i=0;i<arg.default_.length;i++){
				this.setDefault(i,arg.default_[i]);
			  }
		  }
	},
  selectAll:function () {//
	var arr = this.linkPage.getElementsByTagName('select');
	var selectArr = this.selectArr;
	var cls=this._config.J_class;
	for (var i = 0 , len=arr.length; i < len ; i++) {
		var _arr = arr[i];
		if (zt.hasClass(_arr,cls)) {
			selectArr.push(_arr);
		}
	}
	//选了第1个才能选第2个，选了第2个才能选第3个...
	for (var j = 0 , len2=selectArr.length; j < len2 ; j++) {
		if(j!=0){
			selectArr[j].disabled = true;
		}
	}
	return len2; 
  },
  getSelect_n:function(curIndex,prevSelect){//prevSelect是触发onchange的select，curIndex被联动的select下标,
	tempArr = [];
	var check = this.checkRepeat;
 	var curSelect = this.selectArr[curIndex];
	curSelect.innerHTML='';
	var curOptions = curSelect.options;
	var title = curSelect.getAttribute('tit');
	if (title==null) {
		title=curSelect.getAttribute('title');
	}
	var arg = this._config;
	var textTag = arg.textTag;
	var valueTag = arg.valueTag;
	var data = window[arg.data];
	var length_data = this.length_data;
	var length_select = this.length_select;	
	var outsideTag = arg.outside;
	if(outsideTag!=''){
		var outsideObj = document.getElementById(outsideTag);
		var outsideStyle = outsideObj.style;
	}
	if(arg.lastAuto){
		if (curIndex!=length_select-1) {//
			curOptions.add(new Option(title,''));
		}
	}else{
		curOptions.add(new Option(title,''));
	}
	if(curIndex==0){//被联动的select是第0个情况
		for(var i=0;i<length_data;i++){
			var _data = data[i], 
				text=_data[textTag+0], 
				value = _data[valueTag+0];
			if(!check(text)){//判断option的text是否重复
				value ? //判断是否有给option设置单独的value
				curOptions.add(new Option(text,value)) //有单独value值的情况
				: curOptions.add(new Option(text,text));//没有单独value值的情况
			}
		}
	}else{//被联动的select不是第0个的情况
		var prevIndex = curIndex-1;//获得触发onchange的select的下标
		var prevSelectText = prevSelect.options[prevSelect.selectedIndex].text;//获得触发onchange的select被选中的option的text
		for(var j=0;j<length_data;j++){//遍历所有数据,找出被选中的数据,给被联动select填充
			//一条data数据，如果它的前一个数据单元，是被选中的，那么当前数据单元就会被放入当前select
			var _data = data[j],
				curText=_data[textTag+curIndex],
				curValue=_data[valueTag+curIndex],
				prevText=_data[textTag+prevIndex];
			if(prevText==prevSelectText){//如果当前数据是触发onchange的select选中的数据
				if(!check(curText)) {//数据不可重复
				    curValue ? 
					curOptions.add(new Option(curText,curValue))
					:curOptions.add(new Option(curText,curText));
					//如果有设置将最后一个字段值放入指定容器,并且被联动的select是最后一个select
					if(outsideTag!=''&&curIndex==length_select-1){
						outsideObj.innerHTML=curText;
						outsideStyle.display='inline-block';
					}
				}
			}
		}
		curSelect.disabled = false;//被联动的select取消灰选
	} 
  },
  init_option:function(){//给每个select加一个“请选择XXX”
  	var arr = this.selectArr;
	for (var i = 1,len=this.length_select; i<len; i++) {//
		var obj = arr[i];
		var title = obj.getAttribute('tit');
		if (title==null) {
			title=obj.getAttribute('title');
		}
		obj.innerHTML='';
		obj.options.add(new Option(title,''));//
	}
  },
  listen_onchange:function(){//给每个级联select绑定一个onchange
  	var arr = this.selectArr;
	for (var i = 0,len=this.length_select-1; i<len; i++) {//
		var obj = arr[i];
		var n = i+1;//第i个select发生变化,导致第i+1个select发生变化
		this._onchange(n,obj);//obj是触发onchange的select，n是被联动select下标	
	}    
  },
  _onchange:function(n,obj){
    var This = this;
    zt.addEvent(obj,'change',function () {
    	This.getSelect_n(n,obj);
    })
  },
  checkRepeat:function(str){
	if (tempArr.length == 0) {
		tempArr.push(str);
		return false;
	}else{
		for (var i = 0,len2=tempArr.length; i < len2 ; i++) {
			if (tempArr[i] == str) {return true;}
		}
		tempArr.push(str);
		return false;
	}
  },
  setDefault:function(selectNum,str){
		var select = this.selectArr[selectNum];
		var options = select.options;
		var disabled = this._config.disabled;
		for(var i=0,len=this.length_data;i<len;i++){
			var _options=options[i];
			if(_options.text==str){
				_options.selected = true;
				select.disabled=disabled;
				break;
			}
		}
		var n = selectNum+1;
		//设置当前select默认值后，后面的select也发生改变
		//如果n大于最大的下标，执行空；因为如果执行，this.getSelect_n(n,select)会寻找一个不存在的select
		n>(this.length_select-1)?'':this.getSelect_n(n,select);
    }
}
w.zt.SelectN = SelectN;
})(window);