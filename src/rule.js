/*
usable prefix
@
$
%
*
+
# foot note
~ page break
^ paragraph
*/
/* convert simple markup to tag */
/* give warning for */
var PBLINE=[];
var initpage="1.1";
const fs=require("ksana2015-proofreader").socketfs;
var doc=null;
var footnote=null;
const {action}=require("ksana2015-proofreader").model;

var getPDFPage=function(pageid) {
	if (!pageid)return;
	var m=pageid.match(/(\d+)\.(\d+)/);
	if (!m)return ;

	const page=parseInt(m[2],10)+2;
	const fn=parseInt(m[1],10);

	var pdffn="pdf/"+fn+".pdf";
	return {pdffn,page};
}
var init=function(){
	fs.setDataroot("j13-corpus/")	;
}
var onTagClick=function(e) {
		var marker=e.target.marker;
		var pos=marker.find();
		doc.setCursor(pos.to);
		doc.cm.focus();
		marker.clear();
}
var createMarker=function(classname,tag) {
		var element=document.createElement("SPAN");
		element.className=classname;
		element.innerHTML=tag;
		element.onclick=onTagClick;
		return element;
}

var markLine=function(i,rebuild) {
		if (i>doc.lineCount())return;
		var M=doc.findMarks({line:i,ch:0},{line:i,ch:65536});
		M.forEach(function(m){m.clear()});
		var line=doc.getLine(i);
		var dirty=false;
		line.replace(/~(\d+\.\d+)/g,function(m,pg,idx){
			var element=createMarker("pbmarker",pg);
			var marker=doc.markText({line:i,ch:idx},{line:i,ch:idx+m.length},
				{clearOnEnter:true,replacedWith:element});
			element.marker=marker;
		});

		line.replace(/\^([0-9.]+)/g,function(m,m1,idx){
			var element=createMarker("paragraph",m1);
			var marker=doc.markText({line:i,ch:idx},{line:i,ch:idx+m.length},
				{clearOnEnter:true,replacedWith:element});
			element.marker=marker;
		});

		line.replace(/#(\d+)\.(\d+)/g,function(m,m1,m2,idx){
			var element=createMarker("footnote",m1+"."+m2);
			var marker=doc.markText({line:i,ch:idx},{line:i,ch:idx+m.length},
				{clearOnEnter:true,replacedWith:element});
			element.marker=marker;
		});



		setTimeout(function(){
			if (rebuild && dirty) buildPBLINE();
		},100);//<pb id="1.2b"/>
	}

var markAllLine=function() {
	var M=doc.getAllMarks();
	M.forEach(function(m){m.clear()});
	for (var i=0;i<doc.lineCount();i++){
		markLine(i);
	}
	buildPBLINE();
}
var prevpageid=function(pageid){
	var m=pageid.match(/(\d+)\.(\d+)/);
	if (!m) return pageid;
	return (parseInt(m[2])-1);
}
var buildPBLINE=function() {
		//var t=new Date();
		var marks=doc.getAllMarks();
		if (!marks.length)return;
		PBLINE=[];
		for (var i=0;i<marks.length;i++) {
			var m=marks[i];
			if (m.replacedWith.className=="pbmarker") {
				var pos=m.find();
				PBLINE.push([pos.from.line,m.replacedWith.innerHTML]);
			}
		}
		PBLINE.sort(function(a,b){
			return a[0]-b[0];
		});

		if (PBLINE[0][0]>0) { //append previous PB
			PBLINE.unshift([1,prevpageid(PBLINE[0][1])]);
		}
		//console.log("rebuild pbline",new Date()-t);
	}
var setDoc=function(_doc){
	doc=_doc;
}
var getPageByLine=function(line) {
	if (!PBLINE.length)return;
		for (var i=1;i<PBLINE.length;i++) {
			var pbline=PBLINE[i];
			if (pbline[0]>line) {
				return PBLINE[i-1][1];
			}
		}
		return PBLINE[PBLINE.length-1][1];//default
}


var setHotkeys=function(cm){
		cm.setOption("extraKeys", {
	  	"Ctrl-S": function(cm) {
	  		action("savefile");
	  	}
	  });
}
const onBeforeChange=function(){

}
const validateMark=function(){

}
const getFootnote=function(){

}
var helpmessage="#footnote, ^paragraph";
module.exports={markAllLine,markLine,initpage,setDoc,onBeforeChange,validateMark
,getPageByLine,init,setHotkeys,helpmessage,getPDFPage,getFootnote};