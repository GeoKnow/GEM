$(function() {

	var maplayer = L.tileLayer('http://tile.stamen.com/watercolor/{z}/{x}/{y}.jpg', {
		detectRetina: true,	
	});
	
	// Creating layers (Stamen or plain Leaflet):
	// var labellayer = new L.StamenTileLayer("toner-labels", {transparent: true,detectRetina: true});
	// var labellayer = new L.tileLayer("http://{s}.tiles.mapbox.com/v3/whitepawn.i66cpk3g/{z}/{x}/{y}.png", {transparent: true, detectRetina: true});
	// labellayer.setOpacity(0.5)
	
	var labellayer = new L.tileLayer("http://{s}.tiles.mapbox.com/v3/whitepawn.il8be9p8/{z}/{x}/{y}.png", {transparent: true, detectRetina: true});
	
	var map = new L.Map("map", {
			center: new L.LatLng(51.505, -0.09),
			zoom: 13,
			zoomControl:false,
			maxZoom: 18,
			layers: [maplayer], // add multiple layers here [layer1,layer2...]
		});

	map.locate({setView: true, maxZoom: 18});

	function onLocationFound(e) {
		var radius = e.accuracy / 2;

		L.marker(e.latlng).addTo(map)
			.bindPopup("You are within " + radius + " meters from this point").openPopup();

		L.circle(e.latlng, radius).addTo(map);
	}

	map.on('locationfound', onLocationFound);

	function onLocationError(e) {
		//alert(e.message);
	}

	map.on('locationerror', onLocationError);
					
	var popup = L.popup();

	function onMapClick(e) {
		/*popup
			.setLatLng(e.latlng)
			.setContent("You clicked the map at " + e.latlng.toString())
			.openOn(map);*/
		if(!$("body").hasClass("snapjs-left") && !$("body").hasClass("snapjs-right")){
			$(".ui-element").css("opacity","0.5");
		}
	}

	map.on('click', onMapClick);


	$(".ui-element").on("dragstart",onUITouch);
	$(".ui-element").on("drag",onUITouch);
	$(".ui-element").on("mousedown",onUITouch);
	$(".ui-element").on("touchstart",onUITouch);

	function onUITouch(e) {
		$(".ui-element").css("opacity","1");
	}

	map.on('dragstart', function() {
		if(!$("body").hasClass("snapjs-left") && !$("body").hasClass("snapjs-right")){
			$(".ui-element").css("opacity","0.18");
			$(".ui-element-content").css("opacity","0");
		}
	});

	map.on('dragend', function() {
		if(!$("body").hasClass("snapjs-left") && !$("body").hasClass("snapjs-right")){
			$(".ui-element").css("opacity","0.5");
			$(".ui-element-content").css("opacity","1");
		}
	});
});