$(function() {	
	$('#details').on('click', '.property .content a.edit-field', function() {
		var current = $(this).parent().parent();
		current.find('.updater').show();
		current.find('.content .property-value').hide();
		current.find('.content a.edit-field').hide();
		
		current.find('.updater input.update-field').focus();
		// Move the cursor to the end of the string
		//current.find('.updater input.update-field').val(current.find('.updater input.update-field').val());
	});
	
	$('#details').on('click', '.property .updater a.update-submit', function() {
		var current = $(this).parent().parent();
		current.find('.updater').hide();
		current.find('.content .property-value').show();
		current.find('.content a.edit-field').show();
		
		var openTag = '';
		var closeTag = '';
		
		if(current.hasClass("uri")){
			openTag = '<';
			closeTag = '>';
		}
		if(current.hasClass("numeric")){
			openTag = '"';
			closeTag = '"';
		}
		if(current.hasClass("textual")){
			openTag = '"';
			closeTag = '"@' + selectedFeature.properties.lang;
		}
		
		
		var oldValue = current.find('.content .property-value').html();
		var newValue = current.find('.update-field').val();
		var property = current.find('.property-uri').html();
		var datatype = current.find('.datatype').html();
		if(datatype) datatype = '^^<' + datatype + '>';
		else datatype = '';
		
		var endpoint = selectedFeature.properties.endpoint;
		var resource = selectedFeature.properties.val.id;
        var graph = selectedFeature.properties.graph;
		
		// Workaround; Virtuoso doesn't let us match floats in SPARQL :/
		if(datatype != '^^<http://www.w3.org/2001/XMLSchema#float>' && datatype != '^^<http://www.w3.org/2001/XMLSchema#double>'){
			query = 'DELETE DATA {GRAPH <' + graph + '> {<' + resource + '> <' + property + '> ' + openTag + oldValue + closeTag + '' + datatype + '. }}';
			query += ' INSERT DATA {GRAPH <' + graph + '> {<' + resource + '> <' + property + '> ' + openTag + newValue + closeTag + '' + datatype + '. }}';
		}
		else {
			lowerBound = Number(oldValue) - 0.0001;
			upperBound = Number(oldValue) + 0.0001;
			query = 'WITH <' + graph + '> DELETE {<' + resource + '> <' + property + '> ?o.} WHERE {<' + resource + '> <' + property + '> ?o. FILTER(?o > ' + lowerBound + ' && ?o < ' + upperBound + ')}';
			query += ' INSERT DATA {GRAPH <' + graph + '> {<' + resource + '> <' + property + '> ' + openTag + newValue + closeTag + '' + datatype + '. }}';
		}
		query = endpoint + '?query=' + encodeURIComponent(query);
		
		$.ajax({
			url: query,
		}).done(function(){
				console.log("UPDATED!");
				current.find('.content .property-value').html(prettifier.prettifyURI(newValue));
		});
		
	});
});