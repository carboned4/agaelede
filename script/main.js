var rootXML;
var elementDefinitions;
var elementBindings;
var elementOperations;

function startup(){
	console.log("lol");
	
	rootXML = d3.xml("data/ordersync.wsdl").then(function(data) {
		rootXML = data;
		process(rootXML);
	});
	
	
}

function process(xmltree){
	elementDefinitions = d3.select(xmltree);
	elementBindings = elementDefinitions.select("binding");
	console.log(elementBindings);
	elementOperations = elementBindings.selectAll("operation").each(function(d){console.log(d.nodeName);});
	//elementOperations = elementBindings.selectAll("operation").filter(function(op){console.log(d3.select(this).nodeName); return d3.select(this).attr("name");});
	console.log(elementOperations);
	
	
}