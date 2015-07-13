$(function() {
	var propertyStore = [];
	var selectedProperties = [];
	var counter = 1;
	
	var loadSources = function(sources){
		$("#sources h2").html("Sources");
		$("#sources #editor").html('');
		localStorage.setItem("sources", JSON.stringify(sources));
		if(localStorage.sources){
			sources = localStorage.sources;
			// Recreate saved source list
			var i = 0;
			$("#sources ul").html('');
			$.each($.parseJSON(localStorage.sources), function(key, source){
				var sourceStatus = "";
				var treeText = 'Load facets';
				var treeStatus = ' inactive';
				if(!source.active){
					sourceStatus = ' class="inactive"';
					treeStatus += " disabled";
				}
				if(source.facets){
					treeText = "Facets loaded";
					treeStatus = "";
				}
				$("#sources ul").append('<li id="' + i + '"' + sourceStatus + '><span class="source-name"><p class="source-name-value"><a href="#" class="toggleactive">'
										//+ source.name + '</a></p><a href="#" class="delete-source"><img src="img/delete-icon.png" style= "float: right; margin-right: 20px; margin-left: 10px; margin-top: -5px;" /></a>'
										+ source.name + '</a></p><a href="#" class="delete-source"><span class="glyphicon glyphicon-remove"></span></a>'
										//+ '<a href="#" class="edit-source"><img src="img/edit-icon.png" style= "float: right; margin-right: 10px; margin-left: 10px; margin-top: -5px;" /></a></span>'
										+ '<a href="#" class="edit-source"><span class="glyphicon glyphicon-pencil"></span></a></span>'
										+ '<br /><div class="sourcedata">'
										+ '<span class="source-endpoint"><span class="source-endpoint-icon">&#x25cf; </span><span class="source-endpoint-value">'
										+ source.endpoint + '</span></span><br />'
										+ '<span class="source-graph"><span class="source-graph-icon">&#x25cf; </span><span class="source-graph-value">'
										+ source.graph + '</span></span><br />'
										+ '<span class="source-type"><span class="source-type-icon">&#x25cf; </span><span class="source-type-value">'
										+ source.type + '</span></span></div><a href="#" class="loadtree' + treeStatus +'"><span class="glyphicon glyphicon-th-large"></span><span class="toggleload"></span></a></li>');
				i++;
			});
		}
		$("#sources #editor").html('<a href="#" class="add-source"><span class="glyphicon glyphicon-plus"></span>&nbsp; Add source</a>');
	};
	
	
	if(!localStorage.sources || localStorage.sources.length == 2) loadSources(sources);
	else loadSources($.parseJSON(localStorage.sources));
	
	var selectedSourceId = 0;
	
	var editSource = function() {
		if(localStorage.sources && localStorage.sources.length > 2){
			var sources = $.parseJSON(localStorage.sources);
			if($(this).parent().attr("id") != "editor"){
				selectedSourceId = $(this).parent().parent().attr('id');			
		
				var sourceName = $(this).parent().text();
				var sourceEndpoint = $(this).parent().siblings().find(".source-endpoint .source-endpoint-value" ).text();
				var sourceGraph = $(this).parent().siblings().find(".source-graph .source-graph-value" ).text();
				var sourceType = $(this).parent().siblings().find(".source-type .source-type-value" ).text();
				if(sources[selectedSourceId] && sources[selectedSourceId].properties)
					selectedProperties = sources[selectedSourceId].properties;
				$("#sources h2").html("Edit source");
			}
			else{
				selectedSourceId = $.parseJSON(localStorage.sources).length;
				$("#sources h2").html("Add source");
			}
		}
		
		$("#sources ul").html('');
		
		// Need to use a callback function to populate the form fields, as load() is asynchronous
		$("#sources #editor").load( "js/sourcemanager/sourcemanager-edit.html", function() {
			$("#sources #editor input#source-name").val(sourceName);
			$("#sources #editor input#source-endpoint").val(sourceEndpoint);
			$("#sources #editor input#source-graph").val(sourceGraph);
			$("#sources #editor input#source-type").val(sourceType);
		});
	};
	// using a delegated .on("click") event to attach the event handler AFTER injecting new HTML (i.e. adding a SPARQL source)
	$("#sources ul").on("click", "li a.edit-source", editSource);
	$("#sources #editor").on("click", "a.add-source", editSource);
	
	$("#sources ul").on("click", "li a.delete-source", function() {
		selectedSourceId = $(this).parent().parent().attr('id');
		var sources = $.parseJSON(localStorage.sources);		
		sources.splice(selectedSourceId, 1);
		localStorage.setItem("sources", JSON.stringify(sources));	
		loadSources(sources);
		refresh();
    });
	
	$("#sources #editor").on("click", "a.finish-editing", function() {		
		var sources, source = {};
		source.name = '';
		source.endpoint = '';
		source.graph = '';
		source.type = '';
		source.properties = [];
		source.active = true;
		if(localStorage.sources && localStorage.sources.length > 2){
			sources = $.parseJSON(localStorage.sources);
			if(selectedSourceId < sources.length)
				source = sources[selectedSourceId];
		}
		else selectedSourceId = 0;
		
		source.name = $("#sources #editor input#source-name").val();
		source.endpoint = $("#sources #editor input#source-endpoint").val();
		source.graph = $("#sources #editor input#source-graph").val();
		source.type = $("#sources #editor input#source-type").val();
		source.properties = selectedProperties;
		
		sources[selectedSourceId] = source;
		
		localStorage.setItem("sources", JSON.stringify(sources));	
		loadSources(sources);
		refresh();
    });
	
	$("#sources #editor").on("click", "a.cancel-editing", function() {				
		loadSources($.parseJSON(localStorage.sources));
    });
	
	$("#sources ul").on("click", "li a.toggleactive", function() {
		var sources = {};
		selectedSourceId = $(this).parent().parent().parent().attr('id');

		sources = $.parseJSON(localStorage.sources);
		if(sources[selectedSourceId].active){
			sources[selectedSourceId].active = false;
			$("#sources ul li#" + selectedSourceId).addClass('inactive');
			$("#sources ul li#" + selectedSourceId + " a.loadtree").addClass('disabled');
		}
		else{
			sources[selectedSourceId].active = true;
			$("#sources ul li#" + selectedSourceId).removeClass('inactive');
			$("#sources ul li#" + selectedSourceId + " a.loadtree").removeClass('disabled');
		}
		
		localStorage.setItem("sources", JSON.stringify(sources));	

		refresh();
		
		
    });
	
	$("#sources ul").on("click", "li a.loadtree", function() {
		var sources = {};
		selectedSourceId = $(this).parent().attr('id');
		
		sources = $.parseJSON(localStorage.sources);
		
		$.each(sources, function(key, source){
			source.facets = false;
		});
		
		sources[selectedSourceId].facets = true;
		
		var scope = angular.element($('html')).scope();
		var service = createSparqlService(sources[selectedSourceId].endpoint, sources[selectedSourceId].graph);
		var concept = sparql.ConceptUtils.createTypeConcept(sources[selectedSourceId].type);
		scope.updateFacetTree(service, concept);
		
		localStorage.setItem("sources", JSON.stringify(sources));	
		loadSources(sources);
    });
	
	$("#sources #editor").on("focus", "input:text#source-type", function() {
		$("#source-editor").hide();
		$("#type-finder-input").hide();
		$("#type-finder").show();
		$("#type-finder .throbber").show();
		$("#type-finder a.manual").show();
		
		propertyStore = [];
		var query = $("#source-endpoint").val() + '?query=SELECT%20DISTINCT%20%3Fo%20FROM%20%3C' + encodeURIComponent($("#source-graph").val()) + '%3E%20WHERE%20%7B%3Fs%20a%20%3Fo.%7D&format=application%2Fjson';
		
		$.getJSON(query, function(data) {
			$("#type-finder-input").show();
			$("#type-finder .throbber").hide();
			$("#type-finder a.manual").hide();
			
			$.each(data.results.bindings, function(key, val) {
				propertyStore.push(val.o.value);
			});
			
			$("#source-type-temp").autocomplete({
				source: propertyStore,
				appendTo: "#type-results"
			});
		});
    });
	
	$("#sources #editor").on("focus", "input:text#source-properties", function() {
		$("#source-editor").hide();
		$("#property-finder-input").hide();
		$("#property-finder").show();
		$("#property-finder .throbber").show();
		$("#property-finder a.manual").show();
		
		propertyStore = [];
		var query = $("#source-endpoint").val() + '?query=SELECT%20DISTINCT%20%3Fp%20FROM%20%3C' + encodeURIComponent($("#source-graph").val()) + '%3E%20WHERE%20%7B%3Fs%20%3Fp%20%3Fo.%7D&format=application%2Fjson';
		
		$.getJSON(query, function(data) {
			$("#property-finder-input").show();
			$("#property-finder .throbber").hide();
			$("#property-finder a.manual").hide();
			
			$.each(data.results.bindings, function(key, val) {
				propertyStore.push(val.p.value);
			});
			
			var properties = $(".clone input");
			
			if(selectedProperties.length){
				if(selectedProperties.length == properties.length){
					//fill out existing fields
					// $.each(selectedProperties, function(key, property){
						// $("input:text#source-property-temp").autocomplete({
							// source: propertyStore,
							// appendTo: "#property-results"
						// });
						// selectedProperties.push(property.value);
					// });
				}
				else{
					//create & populate input fields
					$('.clone input').first().val(selectedProperties[0].uri);
					$('.clone .type').first().val(selectedProperties[0].type);
					$('.clone input').first().autocomplete({
							source: propertyStore,
							appendTo: "#property-results"
						});
					for(i = 1; i < selectedProperties.length; i++){
						var id = "source-property-temp-" + $(".clone").length;
						var clone = $(".clone").last().clone();
						clone.find('input').attr("id", id);
						clone.find('span').remove();
						clone.find('.type').val(selectedProperties[i].type);
						clone.appendTo("#clones");
						$('#' + id).val('');
						
						$('#' + id).autocomplete({
							source: propertyStore,
							appendTo: "#property-results"
						});
						
						$('#' + id).val(selectedProperties[i].uri);
					}
				}
			}
			else{
				$("input:text#source-property-temp").autocomplete({
					source: propertyStore,
					appendTo: "#property-results"
				});
			}
		});
    });
	
	$("#sources #editor").on("click", "a.accept", function() {		
		$("#property-finder").hide();
		$("#type-finder").hide();
		$("#source-editor").show();
		var id  = $(this).parent().attr("id");
		
		if(id && $(this).parent().attr("id")[0] == 't')
			$("input:text#source-type").val($("input:text#source-type-temp").val());
		else {
			$("input:text#source-properties").val($("input:text#source-property-temp").val());
			var properties = $(".clone");
			selectedProperties = [];
			
			$.each(properties, function(key, property){
				var uriValue, typeValue = '';
				for(i = 0; i < property.children.length; i++){
					if(property.children[i].localName == 'input')
						uriValue = property.children[i].value;
					if(property.children[i].localName == 'select')
						typeValue = property.children[i].value;
				}
				selectedProperties.push({uri : uriValue, type : typeValue});
			});
		}
    });
	
	$("#sources #editor").on("click", "a.cancel", function() {		
		$("#property-finder").hide();
		$("#type-finder").hide();
		$("#source-editor").show();
		
		$("#sources #editor").load( "js/sourcemanager/sourcemanager-edit.html", function() {
			$("#sources #editor input#source-name").val(sources[selectedSourceId].name);
			$("#sources #editor input#source-endpoint").val(sources[selectedSourceId].endpoint);
			$("#sources #editor input#source-graph").val(sources[selectedSourceId].graph);
			$("#sources #editor input#source-type").val(sources[selectedSourceId].type);
		});
    });
	
	$("#sources #editor").on("click", "a.manual", function() {		
		if($(this).parent().attr("id")[0] == 't'){
			$("#type-finder-input").show();
			$("#type-finder .throbber").hide();
			$("#type-finder a.manual").hide();
		}
		else {
			$("#property-finder-input").show();
			$("#property-finder .throbber").hide();
			$("#property-finder a.manual").hide();
			
			$('.clone .type').first().val(selectedProperties[0].uri);
			$('.clone .type').first().val(selectedProperties[0].type);
			$('.clone .type').first().autocomplete({
					source: propertyStore,
					appendTo: "#property-results"
				});
			for(i = 1; i < selectedProperties.length; i++){
				var id = "source-property-temp-" + $(".clone").length;
				var clone = $(".clone").last().clone();
				clone.find('input').attr("id", id);
				clone.find('span').remove();
				clone.find('.type').val(selectedProperties[i].type);
				clone.appendTo("#clones");
				$('#' + id).val('');
				
				$('#' + id).autocomplete({
					source: propertyStore,
					appendTo: "#property-results"
				});
				
				$('#' + id).val(selectedProperties[i].uri);
			}
		}
    });
	
	$("#sources #editor").on("click", "a.add-field", function() {
		var id = "source-property-temp-" + $(".clone").length;
		var clone = $(".clone").last().clone();
		clone.find('input').attr("id", id);
		clone.find('span').remove();
		clone.appendTo("#clones");
		$('#' + id).val('');
		
		$('#' + id).autocomplete({
			source: propertyStore,
			appendTo: "#property-results"
		});
		
		counter++;
    });
});