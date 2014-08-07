/*
*@author:duzhongbo
*@desc:
*	2�����select�ļ���
*	���ݺ��߼��ֱ��ŵ���js����������select��Ŀʱ���ظĶ������߼�js
*	����js���ֻ�������ԭʼԭʼexcel���ݽṹ������������ɸѡ
*/
(function (w) {
w.zt = {
//��������
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
//����
(function (w) {
function SelectN(){ this.prepareArguments.apply(this,arguments); }
SelectN.prototype={
	prepareArguments:function () {
		var js,config,len=arguments.length;
		var This = this;
		if(len==3){//�лص�����,��Ҫ��������data.js�����(һ��ҳ���ж�����������ҹ���һ��data.js)
			js=arguments[0];//��һ������������data.js��·��
			config=arguments[1];//�ڶ�������������ɢ�в���
			This.fn=arguments[2];//���������������ǻص�����
		    zt.loadScript(js,function () {
		    	This.init(config);
		    	This.fn();
		    });
		}else if(len==2){//û�лص���������Ҫ��������js�����(һ��ҳ��ֻ��һ������)
			js=arguments[0];//��һ������������data.js��·��
			config=arguments[1];//�ڶ�������������ɢ�в���
			zt.loadScript(js,function () {
				This.init(config);
			});
		}else if(len==1){//û�лص�������ʹ��ҳ�����Ѿ����ص�data.js�����(һ��ҳ���ж�����������ҹ���һ��data.js)
			config=arguments[0];//��һ������������ɢ�в���
			this.init(config);
		}		
	},
	init:function(config) {
		  this._config={//Ĭ�ϲ�������
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
		  zt.extend(arg,config);//�û��������ø���Ĭ������
		  this.length_data = window[arg.data].length;//�õ�����������
		  this.linkPage=document.getElementById(arg.id);//
		  this.selectArr=[];//��ż���select
		  this.length_select = this.selectAll();//����δѡ���select��ѡ�����ؼ���select�ĸ���
		  this.getSelect_n(0);//��ʼ����һ��select��option
		  this.init_option();//��ÿ��selectһ������ѡ��XXX��
		  this.listen_onchange();//��ÿ��select��onchange�¼�
		  if(arg.default_){//��select����Ĭ��ѡ��,�����Ƿ��ѡĬ��ѡ��
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
	//ѡ�˵�1������ѡ��2����ѡ�˵�2������ѡ��3��...
	for (var j = 0 , len2=selectArr.length; j < len2 ; j++) {
		if(j!=0){
			selectArr[j].disabled = true;
		}
	}
	return len2; 
  },
  getSelect_n:function(curIndex,prevSelect){//prevSelect�Ǵ���onchange��select��curIndex��������select�±�,
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
	if(curIndex==0){//��������select�ǵ�0�����
		for(var i=0;i<length_data;i++){
			var _data = data[i], 
				text=_data[textTag+0], 
				value = _data[valueTag+0];
			if(!check(text)){//�ж�option��text�Ƿ��ظ�
				value ? //�ж��Ƿ��и�option���õ�����value
				curOptions.add(new Option(text,value)) //�е���valueֵ�����
				: curOptions.add(new Option(text,text));//û�е���valueֵ�����
			}
		}
	}else{//��������select���ǵ�0�������
		var prevIndex = curIndex-1;//��ô���onchange��select���±�
		var prevSelectText = prevSelect.options[prevSelect.selectedIndex].text;//��ô���onchange��select��ѡ�е�option��text
		for(var j=0;j<length_data;j++){//������������,�ҳ���ѡ�е�����,��������select���
			//һ��data���ݣ��������ǰһ�����ݵ�Ԫ���Ǳ�ѡ�еģ���ô��ǰ���ݵ�Ԫ�ͻᱻ���뵱ǰselect
			var _data = data[j],
				curText=_data[textTag+curIndex],
				curValue=_data[valueTag+curIndex],
				prevText=_data[textTag+prevIndex];
			if(prevText==prevSelectText){//�����ǰ�����Ǵ���onchange��selectѡ�е�����
				if(!check(curText)) {//���ݲ����ظ�
				    curValue ? 
					curOptions.add(new Option(curText,curValue))
					:curOptions.add(new Option(curText,curText));
					//��������ý����һ���ֶ�ֵ����ָ������,���ұ�������select�����һ��select
					if(outsideTag!=''&&curIndex==length_select-1){
						outsideObj.innerHTML=curText;
						outsideStyle.display='inline-block';
					}
				}
			}
		}
		curSelect.disabled = false;//��������selectȡ����ѡ
	} 
  },
  init_option:function(){//��ÿ��select��һ������ѡ��XXX��
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
  listen_onchange:function(){//��ÿ������select��һ��onchange
  	var arr = this.selectArr;
	for (var i = 0,len=this.length_select-1; i<len; i++) {//
		var obj = arr[i];
		var n = i+1;//��i��select�����仯,���µ�i+1��select�����仯
		this._onchange(n,obj);//obj�Ǵ���onchange��select��n�Ǳ�����select�±�	
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
		//���õ�ǰselectĬ��ֵ�󣬺����selectҲ�����ı�
		//���n���������±ִ꣬�пգ���Ϊ���ִ�У�this.getSelect_n(n,select)��Ѱ��һ�������ڵ�select
		n>(this.length_select-1)?'':this.getSelect_n(n,select);
    }
}
w.zt.SelectN = SelectN;
})(window);