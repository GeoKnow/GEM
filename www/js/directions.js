$(function() {	 
	var lineOptions = { styles: [{color: '#19afc3', opacity: 0.8, weight: 9},
								{color: '#00ffb4', opacity: 0.8, weight: 6},
								{color: '#00fdf6', opacity: 1, weight: 2}],
						addWaypoints: true,
						missingRouteStyles: [{color: 'black', opacity: 0.15, weight: 7},
											{color: 'white', opacity: 0.6, weight: 4},
											{color: 'gray', opacity: 0.8, weight: 2, dashArray: '7,12'}]
					  };

	$('#directions a').on('click', function() {
		$('details').html('');
		var wp = false;
		$('#clear-route').removeClass('inactive');
		$('#add-waypoint').addClass('inactive');
		if(route && route._map) {
			for(i=0; i < waypoints.length; i++){
				if(selectedFeature.properties.val.id == waypoints[i]){
					showDirections();
					wp = true;
				}
			}
			if(!wp){
				route.removeFrom(map);
				waypoints = [];
				getDirections();
			}
		}	
		else{
			getDirections();
		}
	});
	
	$('#clear-route a').on('click', function() {
		route.removeFrom(map);
		waypoints = [];
		onMapClick(this);
	});
	
	$('#add-waypoint a').on('click', function() {
		var index = findNearestWpBefore(findClosestRoutePoint(selectedFeature._latlng)) + 1;
		route.spliceWaypoints(index,0,selectedFeature._latlng);
		waypoints.push(selectedFeature.properties.val.id);
		$('#add-waypoint').addClass('inactive');
		showDirections();
	});
	
	function getDirections(){
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
		  routeLine: function(r) {
						var line = L.Routing.line(r, lineOptions);
						//line.on('linetouched', function(e) { alert("Clicked"); });
						return line;
					 },
		  fitSelectedRoutes: true,
		  createMarker: function(i, wp, n) {
							if(i == 0){
								return L.marker(wp.latLng, {
									draggable: false,
									icon: new L.icon({
										iconUrl: 'img/user-icon.png',
										shadowUrl: 'img/marker-shadow.png',
										iconAnchor: [12, 41],
									})
								});
							}
							
							if(i == n-1) {
								return L.marker(wp.latLng, {
									draggable: false,
									icon: new L.icon({
										iconUrl: 'img/finish-icon.png',
										shadowUrl: 'img/finish-shadow.png',
										iconAnchor: [12, 41],
									})
								});
							};
						},
		});

		route.addTo(map);
		
		route.on('routeselected', function(e) {	
			directions = $('.leaflet-routing-alternatives-container .leaflet-routing-alt');
			waypoints.push(selectedFeature.properties.val.id);
			showDirections();
			line = L.Routing.line(e.route);
			route._plan.on("waypointsspliced", function(e) {
				console.log(e);
			});
		});
	}
	
	function findNearestWpBefore(i) {
			var wpIndices = line._wpIndices,
				j = wpIndices.length - 1;
			while (j >= 0 && wpIndices[j] > i) {
				j--;
			}

			return j;
	}
	
	function findClosestRoutePoint(latlng) {
			var minDist = Number.MAX_VALUE,
				minIndex,
			    i,
			    d;

			for (i = line._route.coordinates.length - 1; i >= 0 ; i--) {
				d = latlng.distanceTo(line._route.coordinates[i]);
				if (d < minDist) {
					minIndex = i;
					minDist = d;
				}
			}

			return minIndex;
	}
});