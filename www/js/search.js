$(function() {
	var scope = angular.element($('html')).scope();
	console.log("Whaaat: ");console.log(angular);
	
	$('#search').keydown(function(event) {
        if (event.keyCode == 13) {
            applyFilter($("#search").val());
        }
    });
	
	$('#search').on('click', function(){
		$('#search-box #results').css('display','block');
		$('#search-box #results').html('');
		
		$.each(screenItems, function(key, source){
			$('#search-box #results').append('<li><a href="#">' + source.shortLabel.displayLabel + '</a></li>');
		});

	});
	
    $('#filter').on('click', function(){
		applyFilter($("#search").val());
	});
	
	$("#results").on("click", "li a", function() {
		applyFilter(this.text);
	});
	
	function applyFilter(text){
		scope.filterClicked(text);
		if(!scope.$root.$$phase) {
		 // scope.$apply() clears the featureLayer and prevents fitting the map bounds to feature cluster
			scope.$apply();
		}
		//map.fitBounds(group.getBounds());
		$('#search').blur();
		$('#search-box').height("inherit");
		$('#search-box #results').html('');
		$('#search-box #results').css('display','none');

		// have to sleep for a short while before calling fitBounds(),
		// since the items watcher calls clearItems(), rendering featureLayer empty
		setTimeout(function(){
			map.fitBounds(featureLayer.getBounds());
			$(".ui-element").css("opacity","0.5");
		}, 500);
	}
});