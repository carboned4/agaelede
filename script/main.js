var rootXML;
var elementDefinitions;
var elementBindings;
var elementOperations;
var elementTypes;

var dataOperations = {};
var dataMessages = {};
var dataTypes = {};
var dataElements = {};
var dataNamespacesTop;

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
	
	dataNamespacesTop = fetchNamespaces(elementDefinitions);
	
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
	//console.log(elementMessages);
	
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
	//console.log(elementTypes);
	
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
	
	traverse();
	draw();
}

function typeSearch(child,namespaces){
	var tempName = child.nodeName;
	//console.log(tempName);
	//console.log(child);
		
	if (tempName == "xsd:sequence"){
		//console.log(child.attributes.name)
		var tempChildren = child.children;
		var tempArray = [];
		for (ichildren in tempChildren){
			var ic = typeSearch(tempChildren[ichildren],namespaces);
			if (ic){
				tempArray.push(ic);
			}
		}
		return tempArray;
	}
	else if (tempName == "xsd:complexType"){
		//console.log(child.attributes.name)
		var tempChildren = child.children;
		var tempArray = [];
		for (ichildren in tempChildren){
			var ic = typeSearch(tempChildren[ichildren],namespaces);
			if (ic){
				tempArray.push(ic);
			}
		}
		if (child.attributes.name){
			dataTypes[namespaces.current][child.attributes.name.nodeValue] = tempArray[0];
		} else {
			return {structure: tempArray[0], ns: namespaces.current};
		}
	}
	else if (tempName == "xsd:simpleType"){
		//console.log(child.attributes.name);
		var tempRestriction = filterTag(child.children,"xsd:restriction")[0];
		//console.log(tempRestriction.attributes.base.nodeValue);
		return {//name: child.attributes.name.nodeValue, 
				type: tempRestriction.attributes.base.nodeValue,
				ns: namespaces.current
			};
	}
	else if (tempName == "xsd:element"){
		if (child.attributes.type){
			return {name: child.attributes.name.nodeValue, 
				type: child.attributes.type.nodeValue,
				minOccurs: child.attributes.minOccurs ? child.attributes.minOccurs.nodeValue : null,
				maxOccurs: child.attributes.maxOccurs ? child.attributes.maxOccurs.nodeValue : null,
				ns: namespaces.current
			};
		} else {
			var tempChildren = child.children;
			var tempChildType = filter(tempChildren,function(d){return d.nodeName == "xsd:simpleType" || d.nodeName == "xsd:complexType"})[0];
			/* var tempArray = [];
			for (ichildren in tempChildren){
				var ic = typeSearch(tempChildren[ichildren]);
				if (ic){
					tempArray.push(ic);
				}
			} */
			//if (tempChildType[0].nodeName == "xsd:simpleType")
			var tempChildSearchResult = typeSearch(tempChildType,namespaces);
			tempChildSearchResult.name = child.attributes.name.nodeValue;
			
			return tempChildSearchResult;
		}
	}
	else if (tempName == "xsd:schema"){
		//console.log("schema")
		var fns = fetchNamespaces(child);
		dataElements[(fns.current)] = {};
		var tempChildren = child.children;
		for (ichildren in tempChildren){
			var ts = typeSearch(tempChildren[ichildren],fns);
			if (tempChildren[ichildren].nodeName == "xsd:element"){
				//console.log(ts);
				dataElements[(fns.current)][(ts.name)] = {type: ts.type, ns: fns.current};
			}
		}
		//console.log(fns);
	}
}

function traverse(){
	for (opi in dataOperations){
		var op = dataOperations[opi];
		
		if (op.input){
			var elPair = splitType(op.input);
			console.log(elPair);
		}
		if (op.output){
			var elPair = splitType(op.input);
		}
	}
}

function draw(){
	for (opi in dataOperations){
		var op = dataOperations[opi];
		var tempOpDiv = d3.select("#tables").append("div").attr("id","op_"+op.name);
		tempOpDiv.append("p").text(op.name);
		console.log(dataOperations[opi]);
		if (op.input){
			var tempOpInDiv = tempOpDiv.append("div").attr("id","input_"+op.name);
			tempOpInDiv.append("p").text("Request "+op.input);
			tempOpInDiv.append("table").attr("id","table_input_"+op.name);
		}
		if (op.output){
			var tempOpOutDiv = tempOpDiv.append("div").attr("id","output_"+op.name);
			tempOpOutDiv.append("p").text("Response "+op.output);
			tempOpOutDiv.append("table").attr("id","table_output_"+op.name);
		}
		
	}
	
}

function splitType(typename,names){
	var io = typename.indexOf(":");
	if (typename.substring(0,4) == "xsd:"){
		return ["xsd",typename];
	}else if(io >= 0){
		return typename.split(":");
	}else{
		return [names,typename];
	}
}

function fetchNamespaces(el){
	var NSExternal = {};
	var NSCurrent = "";
	
	for(at in el.attributes){
		var tempAt = el.attributes[at];
		var tempAtName = tempAt.name;
		var tempAtValue = tempAt.nodeValue;
		//console.log(tempAtName);
		if (tempAtName && tempAtName.substring(0,6) == "xmlns:"){
			NSExternal[tempAtName.substring(6)] = tempAtValue;
		} else if (tempAtName == "xmlns"){
			NSCurrent = tempAtValue;
			dataTypes[NSCurrent] = {};
		}
	}
	return {current: NSCurrent, external: NSExternal};
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