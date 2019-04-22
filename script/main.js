var rootXML;
var elementDefinitions;
var elementBindings;
var elementOperations;
var elementTypes;

var dataOperations = {};
var dataMessages = {};
var dataTypes = {};

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
		dataOperations[tempOpName] = {
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
	
	elementTypes = filterTag(elementDefinitions.children,"wsdl:types");
	console.log(elementTypes);
	
	for(iElType in elementTypes[0].children){
		/*
		var tempMessName = elementMessages[iElMess].attributes.name.nodeValue;
		var tempMessPart = filterTag(elementMessages[iElMess].children,"wsdl:part")[0].attributes.element.nodeValue;
		dataTypes[tempMessName] = {
			name: tempMessName,
			part: tempMessPart
		};*/
		typeSearch(elementTypes[0].children[iElType]);
	}
	console.log(dataTypes);
}

function typeSearch(child){
	var tempName = child.nodeName;
	console.log(tempName);
	console.log(child);
		
	if (tempName == "xsd:sequence"){
		console.log(child.attributes.name)
		var tempChildren = child.children;
		var tempArray = [];
		for (ichildren in tempChildren){
			var ic = typeSearch(tempChildren[ichildren]);
			if (ic){
				tempArray.push(ic);
			}
		}
		return tempArray;
	}
	else if (tempName == "xsd:complexType"){
		console.log(child.attributes.name)
		dataTypes[child.attributes.name.nodeValue] = [];
	}
	else if (tempName == "xsd:simpleType"){
		console.log(child.attributes.name)
	}
	else if (tempName == "xsd:element"){
		return {name: child.attributes.name.nodeValue, 
				type: child.attributes.type.nodeValue,
				minOccurs: child.attributes.minOccurs ? child.attributes.minOccurs.nodeValue : null,
				maxOccurs: child.attributes.maxOccurs ? child.attributes.maxOccurs.nodeValue : null
			};
	}
	else if (tempName == "xsd:schema"){
		console.log("schema")
		var tempChildren = child.children;
		for (ichildren in tempChildren){
			typeSearch(tempChildren[ichildren]);
		}
	}
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