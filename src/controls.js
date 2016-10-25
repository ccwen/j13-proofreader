const React=require("react");

const E=React.createElement;
const PT=React.PropTypes;
const markupButtons=React.createClass({
	contextTypes:{
    action:PT.func,
    getter:PT.func,
    listen:PT.func
	}	
	,render:function(){
		return E("div",{},
			E("button",{onClick:this.props.togglePreview},"preview")
		)	
	}
});
var loadSaveButtons=React.createClass({
	contextTypes:{
    	action:PT.func,
    	getter:PT.func,
    	listen:PT.func,
    	unlistenAll:PT.func
	}
	,getInitialState:function(){
		var fn=localStorage.getItem("j13_workingfn")||"j13.txt";
		var starttime=new Date();
		return {fn,starttime};
	}
	,componentDidMount:function(){
		setTimeout(this.loadfile,1000);
		this.context.listen("savefile",this.savefile,this);		
		this.timer=setInterval(this.updatetimer,10000);
	}
	,componentWillUnmount:function(){
		this.context.unlistenAll(this);
		clearInterval(this.timer);
	}
	,loadfile:function(){
		var action=this.context.action;
		var fn=this.state.fn;
		this.setState({starttime:new Date(),elapse:0});
		this.context.getter("file",this.state.fn,function(data){
			action("loaded",data);
			localStorage.setItem("j13_workingfn",fn);
		});
	}
	,loadnextfile:function(){
		var fn=this.state.fn.replace(/\d+/,function(m){
			return parseInt(m)+1;
		});
		this.setState({fn},function(){
			this.loadfile();
		}.bind(this));
	}
	,savefile:function(){
		if (!this.props.dirty)return;
		
		var action=this.context.action;
		var content=this.context.getter("getcontent");
		this.context.getter("save",{fn:this.state.fn,content},function(err){
			action("saved");
		});
	}
	,onInput:function(e){
		this.setState({fn:e.target.value});
	}
	,onKeyPress:function(e){
		if (e.key=="Enter"){
			this.loadfile();
		}
	}
	,updatetimer:function(){
		this.setState({elapse: Math.floor((new Date()-this.state.starttime)/1000) });
	}
	,render:function(){
		if (this.props.preview)return E("span");
		return E("div",{},
			E("button",{onClick:this.loadfile,disabled:this.props.dirty},"load"),
			E("input",{size:8,onKeyPress:this.onKeyPress,
					value:this.state.fn,onChange:this.onInput,disabled:this.props.dirty}),
			E("button",{onClick:this.savefile,disabled:!this.props.dirty},"save"),
			E("span",{style:styles.elapse},this.state.elapse,"secs")
		)	
	}
});

var Controls=React.createClass({
	contextTypes:{
		getter:PT.func,
    listen:PT.func,
    unlistenAll:PT.func
	}
	,getInitialState:function(){
		return {note:""};
	}
	,componentDidMount:function(){
		this.context.listen("footnote",this.footnote,this);		
	}
	,componentWillUnmount:function(){
		this.context.unlistenAll(this);
	}
	,footnote:function(note){
		this.setState({note});
	}
	,render:function(){
		return E("div",{style:{right:20,width:200,zIndex:100,
			background:"silver",position:"absolute"}},
			E("div",{},E("span",{style:styles.note},this.props.helpmessage)),	
			E(loadSaveButtons,this.props),E(markupButtons,{togglePreview:this.props.togglePreview}),
			E("div",{},E("span",{style:styles.note},this.state.note))
		);
	}
})
var styles={
	note:{fontSize:"50%"},
	warnings:{fontSize:"50%"},
	elapse:{fontSize:"50%"}
}
/*
  HOT KEY for next error

*/
module.exports=Controls;
