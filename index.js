var React=require("react");
var ReactDOM=require("react-dom");
if(window.location.origin.indexOf("//127.0.0.1")>-1) {
	require("ksana2015-webruntime/livereload")(); 
}
var ksanagap=require("ksana2015-webruntime/ksanagap");
ksanagap.boot("j13-proofreader",function(){
	var Main=React.createElement(require("./src/main"));
	ksana.mainComponent=ReactDOM.render(Main,document.getElementById("main"));
});