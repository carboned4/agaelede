var rootXML;
var elementDefinitions;
var elementBindings;
var elementOperations;

var dataOperations = [];
var dataMessages = [];

function startup(){
	console.log("lol");
	
	rootXML = d3.xml("data/ordersync.wsdl").then(function(data) {
		rootXML = data;
		process(rootXML);
	});
	
	
}

function process(xmltree){
	//elementDefinitions = d3.select(xmltree);
	elementDefinitions = xmltree.childNodes[0];
	//elementBindings = elementDefinitions.select("binding");
	elementPorts = filter(elementDefinitions.children,function(d){return d.nodeName == "wsdl:portType";});
	//console.log(elementBindings);
	//elementOperations = elementBindings.selectAll("operation").filter(function(d){console.log(d3.select(this)); return true;});
	//elementOperations = elementBindings.selectAll("operation").filter(function(op){console.log(d3.select(this).nodeName); return d3.select(this).attr("name");});
	elementOperations = filter(elementPorts[0].children, function(d){return d.nodeName == "wsdl:operation";});
	//elementOperations._groups[0].forEach(function(d){console.log(d.nodeName)})
	//console.log(elementOperations);
	
	for(iElOp in elementOperations){
		var tempOpName = elementOperations[iElOp].attributes.name.nodeValue;
		var tempOpInput = filterTag(elementOperations[iElOp].children,"wsdl:input")[0].attributes.message.nodeValue;
		var tempOpOutput = filterTag(elementOperations[iElOp].children,"wsdl:output")[0].attributes.message.nodeValue;
		dataOperations[iElOp] = {
			name: tempOpName,
			input: tempOpInput,
			output: tempOpOutput
		};
	}
	console.log(dataOperations);
	
	elementMessages = filterTag(elementDefinitions.children,"wsdl:message");
	console.log(elementMessages);
	
	for(iElMess in elementMessages){
		var tempMessName = elementMessages[iElMess].attributes.name.nodeValue;
		var tempMessPart = filterTag(elementMessages[iElMess].children,"wsdl:part")[0].attributes.element.nodeValue;
		dataMessages[tempMessName] = {
			name: tempMessName,
			part: tempMessPart
		};
	}
	console.log(dataMessages);
}

function filterTag(array,tag){
	return filter(array,function(d){return d.nodeName == tag});
}

function filter(array,criteria){
	var resultarray = [];
	for (arrayentry in array){
		if (criteria(array[arrayentry]))
			resultarray.push(array[arrayentry]);
	}
	return resultarray;
}