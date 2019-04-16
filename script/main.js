var rootXML;
var elementBindings;
var elementOperations;

function startup(){
	console.log("lol");
	
	rootXML = d3.xml("data/ordersync.wsdl").then(function(data) {
		rootXML = data;
	});
	
	process(rootXML);
}

function process(xmltree){
	elementBindings = xmltree.querySelector("binding");
	
	
}