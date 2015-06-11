$(function() {
	var route;

	$('#directions a').on('click', function() {
		$('#details').html('');
		$('#info').removeClass('tab-active');
		$('#directions').addClass('tab-active');
		if(route && route._map) route.removeFrom(map);
		
		if(!userLocation){
			alert("Please let GEM pinpoint your location first, then try again.");
			$( "#compass" ).trigger( "click" );
		}
		
		route = L.Routing.control({
		  alternativeClassName: 'alternative-route',
		  waypoints: [
			userLocation._latlng,
			selectedFeature._latlng
		  ],
		  serviceUrl: 'http://router.project-osrm.org/viaroute', // a workaround for Cordova & local files
		  lineOptions: {
			styles: [{color: '#19afc3', opacity: 0.8, weight: 9},
			{color: '#00ffb4', opacity: 0.8, weight: 6},
			{color: '#00fdf6', opacity: 1, weight: 2}],
			addWaypoints: false
		  },
		  fitSelectedRoutes: true,
		  createMarker: function(i, wp) {
			if(i==0){
				return L.marker(wp.latLng, {
					draggable: false,
					icon: new L.icon({
						iconUrl: 'img/user-icon.png',
						shadowUrl: 'img/marker-shadow.png',
						iconAnchor: [12, 41],
					})
				});
			}
			else {
				return L.marker(wp.latLng, {
					draggable: false,
					icon: new L.icon({
						iconUrl: 'img/finish-icon.png',
						shadowUrl: 'img/finish-shadow.png',
						iconAnchor: [12, 41],
					})
				});
			};
		  }
		}).on('linetouched', function(e) {
				alert("Touched!");
				if(!$('#bottom-drawer').hasClass('expanded')) expandDrawer();
				container.appendTo('#details');
				$('#info').removeClass('tab-active');
				$('#directions').addClass('tab-active');
			});

		route.addTo(map);
		$('#clear-route').removeClass("inactive");
		
		var line;
		route.on('routeselected', function(e) {
			var container = $('.leaflet-routing-alternatives-container');
			var clone = container;
			clone.appendTo('#details');
			line = L.Routing.line(e.route);
		});
	});
	
	$('#clear-route a').on('click', function() {
		$('#clear-route').addClass("inactive");
		route.removeFrom(map);
	});
});