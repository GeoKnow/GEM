$(function() {
	
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
				$("#sources ul").append('<li id="' + i + '"><span class="source-name"><p class="source-name-value">'
										+ source.name + '</p><a href="#" class="delete-source"><img src="img/delete-icon.png" style= "float: right; margin-right: 20px; margin-left: 10px; margin-top: -5px;" /></a>'
										+ '<a href="#" class="edit-source"><img src="img/edit-icon.png" style= "float: right; margin-right: 10px; margin-left: 10px; margin-top: -5px;" /></a></span>'
										+ '<br /><div style="margin-top: 3px; clear: both;">'
										+ '<span class="source-endpoint"><span class="source-endpoint-icon">&#x25cf; </span><span class="source-endpoint-value">'
										+ source.endpoint + '</span></span><br />'
										+ '<span class="source-graph"><span class="source-graph-icon">&#x25cf; </span><span class="source-graph-value">'
										+ source.graph + '</span></span><br />'
										+ '<span class="source-type"><span class="source-type-icon">&#x25cf; </span><span class="source-type-value">'
										+ source.type + '</span></span></div></li>');
				i++;
			});
		}
		$("#sources #editor").html('<a href="#" class="add-source"><span class="glyphicon glyphicon-plus"></span>&nbsp; Add source</a>');
	};
	
	// temporary (used at first start or when the source list is empty)
	var sources = [
			{ 'name' : 'Linked Geo Data', 'endpoint' : 'http://linkedgeodata.org/sparql', 'graph' : 'http://linkedgeodata.org','type' : 'http://linkedgeodata.org/ontology/Airport' },
		    { 'name' : 'DBpedia', 'endpoint' : 'http://akswnc3.informatik.uni-leipzig.de/data/dbpedia/sparql', 'graph' : 'http://dbpedia.org', 'type' : 'http://dbpedia.org/ontology/University' },	   
		];

	if(!localStorage.sources || localStorage.sources.length == 2) loadSources(sources);
	else loadSources($.parseJSON(localStorage.sources));
	
	var selectedSourceId = 0;
	
	var editSource = function() {
		if(localStorage.sources && localStorage.sources.length > 2){
			if($(this).parent().attr("id") != "editor"){
				selectedSourceId = $(this).parent().parent().attr('id');			
		
				var sourceName = $(this).parent().text();
				var sourceEndpoint = $(this).parent().siblings().find(".source-endpoint .source-endpoint-value" ).text();
				var sourceGraph = $(this).parent().siblings().find(".source-graph .source-graph-value" ).text();
				var sourceType = $(this).parent().siblings().find(".source-type .source-type-value" ).text();
			}
			else selectedSourceId = $.parseJSON(localStorage.sources).length;
		}
		
		$("#sources h2").html("Edit source");
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
		var scopeGem = angular.element($('html')).scope();
		scopeGem.updateMap();
    });
	
	$("#sources #editor").on("click", "a.finish-editing", function() {		
		var sources, source = {};
		source.name = '';
		source.endpoint = '';
		source.graph = '';
		source.type = '';
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
		
		sources[selectedSourceId] = source;
		
		localStorage.setItem("sources", JSON.stringify(sources));	
		loadSources(sources);
		var scope = angular.element($('html')).scope();
		scope.updateMap();		
    });
});