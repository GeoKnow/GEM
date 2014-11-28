$(function() {
	var scope = angular.element($('html')).scope();
	$('#search').keydown(function(event) {
        if (event.keyCode == 13) {
            applyFilter();
        }
    });
	$('#search').on('click', function(){
		_(scope.dataSources).each(function(dataSource, i) {
			console.log(currentResults);
		});
		$('#search-box #results').css('display','block');
		$('#search-box #results').html('<li>test</li><li>test2</li>');
	});
    $('#filter').on('click', function(){
		applyFilter();
	});
	
	function applyFilter(){
		scope.filterClicked($("#search").val());
		if(!scope.$root.$$phase) {
			scope.$apply();
		}
	}
});