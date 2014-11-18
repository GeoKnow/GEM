$(function() {
	var sources = [
			{ 'name' : 'Linked Geo Data', 'endpoint' : 'http://linkedgeodata.org/sparql', 'graph' : 'http://linkedgeodata.org','type' : 'http://linkedgeodata.org/ontology/Airport' },
		    { 'name' : 'DBpedia', 'endpoint' : 'http://akswnc3.informatik.uni-leipzig.de/data/dbpedia/sparql', 'graph' : 'http://dbpedia.org', 'type' : 'http://dbpedia.org/ontology/University' },
		   
		];

	localStorage.setItem("sources", JSON.stringify(sources));

	if(!localStorage.sources){
		sources = [
		   { 'name' : 'DBpedia', 'endpoint' : 'http://dbpedia.org/sparql', 'graph' : 'http://dbpedia.org', 'type' : 'http://dbpedia.org/ontology/Airport' },
		];
	}
	
	else{
		sources = localStorage.sources;
		// Recreate saved source list
		var i = 1;
		$("#sources ul").html('');
		$.each($.parseJSON(localStorage.sources), function(key, source){
			$("#sources ul").append('<li id="' + i + '">' + source.name + '<br />' + source.endpoint + '<br />' + source.graph + '<br />' + source.type + '</li>');
			i++;
		});
	}

	
	$( "#sources-title a" ).click(function() {
      $('#source-form').dialog({show:'fade',hide:'fade'});
	  $('#source-form').dialog("open");
	  $('#source-form').dialog("option","position",[220,87]);
    });
	
	$( "#source-form" ).dialog({
      autoOpen: false,
      height: 230,
      width: 510,
      modal: true,
      buttons: {
        "Add source": function() {
			var linkid = 1;
			if($('#sources ul li').last().length){
				linkid = parseInt($('#sources ul li').last().attr('id'), 10) + 1;
			}
			$("#sources ul").append('<li id="' + linkid + '">' + $("#source").val() + '<br />' + $("#endpoint").val() + '</li>');
			sources.push({ 'name' : $("#source").val(), 'endpoint' :  $("#endpoint").val() });
			$.cookie("sources", JSON.stringify(sources));
			console.log($.cookie("sources"));
			$( this ).dialog( "close" );
        },
        Cancel: function() {
			$( this ).dialog( "close" );
        }
      }
    });
	
	// using a delegated .on("click") event to attach the event handler AFTER injecting new HTML (i.e. adding a SPARQL source)
	$("#sources").on("click", "li a.remove", function() {
		var item = $(this).siblings().text();
		var i = 0;
		$.each(sources, function(key, source){	
			if(source.name == item){
				sources.splice(i,1);
				return false;
			}
			i++;
		});
		
		$(this).parent().remove();
		$.cookie("sources", JSON.stringify(sources));
	});
});