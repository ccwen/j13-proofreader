/* kangxi preview*/
const React=require("react");
const ReactDOM=require("react-dom");
const E=React.createElement;
const PT=React.PropTypes;

const Preview=React.createClass({
	getInitialState:function(){
		const parts=this.parseText(this.props.data);
		return {parts};
/*
		return {parts:[
				["z","林傳韓生推詩之意而爲內外傳數萬言其語頗與齊魯閒殊然其歸一也"+
"　又少也顏延之庭誥文選書務一不尚煩密何承天答顏永嘉書竊願吾子舍兼而遵一也"+
"　又增韻純也易繫辭天下之動貞夫一老子道德經天得一以淸地得一以寧"],
				
				["br"],
				["wh","一"],
				["an"],
				["wh","弌"],
				["z","唐韻韻會於悉切集韻正韻益悉切𡘋漪入聲"
				+"說文惟初大始道立於一造分天地化成萬物廣韻數之始也"
				+"物之極也易繫辭天一地二老子道德經道生一一生二　"
				+"又廣韻同也禮樂記禮樂𠛬政其極一也史記儒"],
				
				["br"],
				["wh","　　一部"],
				
				["br"],
				["wh","　子集上" ],
				
				["br"],
				["wh","康熙字典"]

			]}
*/
	}
	,contextTypes:{
		action:PT.func
	}
	,isNonChar:function(code){
		if (code>=0x3000&&code<=0x303f) return true;//cjk puncuation
		if (code<0x7f) return true;
		if (code>=0xff00&&code<=0xff9f) return true;//full width
		return false;
	}
	,getTextFirstCh:function(str,count){
		var i=0;
		while (i<str.length && count){
			const code=str.charCodeAt(i);
			if (code>=0xd800&&code<=0xd900) i++;
			else if (str[i]=="&") {
				while (i<str.length) {
					if (str[i]==";") break;
					i++;
				}
			} else if (this.isNonChar(code)){
				count++;
			}

			i++;count--;
		}
		return str.substr(0,i);
	}
	,chcount:function(str){
		var i=0,c=0;
		while (i<str.length){
			const code=str.charCodeAt(i);
			if (code>=0xd800&&code<=0xd900) i++;
			else if (str[i]=="&") {
				while (i<str.length) {
					if (str[i]==";") break;
					i++;
				}
			} else if (this.isNonChar(code)){
				c--;
			}
			i++;c++;
		}
		return c;
	}

	,parseText:function(str){
		var lines=str.split("\n");
		var parts=[],part,offset=0,i,linestart=[],linecount=0;
		const getZ=function(z){
			z=z.replace(/[─「」，、．；《》：。〈〉\n]/g,"");
			z=z.replace(/\^\d+.+/g,"");
			return z;
		}
		var start;
		for (i=lines.length-1;i>=0;i--) {
			const z=getZ(lines[i]);
			if (!z) continue;
			parts.push(["text",z,start]);
			start+=lines[i].length;
			parts.push(["br"]);
		}
	

		return parts;
	}
	,renderPart:function(part){
		var out=[];
		const type=part[0],text=part[1],start=part[2];
		var cls={"data-start":start};
		if (type==="br") {
			out.push(E("br"));
		} else {
			out.push(E("span",{className:"vertical"},text));
		}
		return out;
	}
	,onmousemove:function(e){
		const ruler=ReactDOM.findDOMNode(this.refs.ruler);
	
		ruler.style.top=e.clientY+3;//make sure the underlay is clickable
	}
	,guestCharPos:function(cheight,x,y,w,h,side){
		const ccount=h/cheight;
		var c=Math.floor((y/h) * ccount);
		if (side) c+=ccount;
		return c;
	}
	,guestCharHeight:function(str,h){
		var count=this.chcount(str);
		if (count%2==1)count++;//z always has even number
		return (h/count);
	}
	,onclick:function(e){
		var nod=e.target;
		const side=nod.className.indexOf("left")>-1?1:0;
		const cheight=this.guestCharHeight(nod.innerText,nod.offsetHeight);

		if (!nod.dataset.start) nod=nod.parentElement;

		const ch=this.guestCharPos(cheight,e.clientX-nod.offsetLeft,
			e.clientY-nod.offsetTop,nod.offsetWidth,nod.offsetHeight,side);

		const start=parseInt(nod.dataset.start,10);
		const text=this.props.data.substr(start);
		const chpos=this.getTextFirstCh(text,ch+2).length;
		this.context.action("pinpoint",start+chpos);
	}
	,render:function(){
		return E("div",{className:"v"},
			E("div",{className:"ruler",ref:"ruler"}),
			E("div",{onMouseMove:this.onmousemove,onClick:this.onclick}
				,this.state.parts.map(this.renderPart)) 
		);
	}
});
module.exports=Preview;