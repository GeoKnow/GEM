/**
 * Created by vukm on 11/4/15.
 */

var polygonService = {};

(function() {
    // create sliders
    var layerOn = false;
    var layerAttractions = null;
    var layerTheatres = null;
    var layerViewpoints = null;
    var layerMountains = null;
    $(function() {
        $("#motive-drawer #attraction-slider").slider({
            value: 0,
            min: 0,
            max: 10,
            step: 1,
            slide: function(event, ui) {
                var val = ui.value;
                if (val === 10) $(this).closest(".motive-block").find(".motive-value").html("1.0");
                else $(this).closest(".motive-block").find(".motive-value").html("0." + val);
                if (val === 0) layerAttractions = null
                else layerAttractions = motiveAttractions[10-val];
                polygonService.update();
            }
        });
        $("#motive-drawer #theatre-slider").slider({
            value: 0,
            min: 0,
            max: 10,
            step: 1,
            slide: function(event, ui) {
                var val = ui.value;
                if (val === 10) $(this).closest(".motive-block").find(".motive-value").html("1.0");
                else $(this).closest(".motive-block").find(".motive-value").html("0." + val);
                if (val === 0) layerTheatres = null
                else layerTheatres = motiveTheatres[10-val];
                polygonService.update();
            }
        });
        $("#motive-drawer #viewpoint-slider").slider({
            value: 0,
            min: 0,
            max: 10,
            step: 1,
            slide: function(event, ui) {
                var val = ui.value;
                if (val === 10) $(this).closest(".motive-block").find(".motive-value").html("1.0");
                else $(this).closest(".motive-block").find(".motive-value").html("0." + val);
                if (val === 0) layerViewpoints = null
                else layerViewpoints = motiveViewpoints[10-val];
                polygonService.update();
            }
        });
        $("#motive-drawer #mountain-slider").slider({
            value: 0,
            min: 0,
            max: 10,
            step: 1,
            slide: function(event, ui) {
                var val = ui.value;
                if (val === 10) $(this).closest(".motive-block").find(".motive-value").html("1.0");
                else $(this).closest(".motive-block").find(".motive-value").html("0." + val);
                if (val === 0) layerMountains = null
                else layerMountains = motiveMountains[10-val];
                polygonService.update();
            }
        });
        $("#motive-drawer .motive-value").html("0.0");
    });

    var layer;

    function addPolygon(geojson) {
        if (!map) return;
    }
    function removePolygon() {
        if (!map) return;
    }
    function setData(data) {
        if (!map) return;
        if (!layer) {
            layer = L.geoJson(null, {
                onEachFeature: function(feature, layer) {
                    layer.on({
                        click: function() {
                            console.log(feature);
                            $("#motive-drawer").animate({
                                height: '0'
                            }, 200, function() {
                                $("#motive-drawer").css("display", "none");
                            });
                        }
                    });
                },
                style: function(feature) {
                    var color = feature.geometry.color;
                    var fillColor = feature.geometry.fillColor;
                    if (!color) {
                        color = '#999';
                        if (!fillColor) fillColor = '#0000ff';
                    } else {
                        if (!fillColor) fillColor = color;
                    }

                    return {
                        weight: 2,
                        color: color,
                        opacity: 1,
                        fillColor: fillColor,
                        fillOpacity: 0.5
                    }
                }
            });
            layer.addTo(map);
        }
        layer.clearLayers();
        layer.addData(data);
    }
    function clear() {
        if (layer) layer.clearLayers();
    }
    function update() {
        if (!map) return;
        if (!layer) {
            layer = L.geoJson(null, {
                onEachFeature: function(feature, layer) {
                    layer.on({
                        click: function() {
                            $("#motive-drawer").animate({
                                height: '0'
                            }, 200, function() {
                                $("#motive-drawer").css("display", "none");
                            });
                        }
                    });
                },
                style: function(feature) {
                    var color = feature.geometry.color;
                    var fillColor = feature.geometry.fillColor;
                    if (!color) {
                        color = '#999';
                        if (!fillColor) fillColor = '#0000ff';
                    } else {
                        if (!fillColor) fillColor = color;
                    }
                    return {
                        weight: 2,
                        color: color,
                        opacity: 1,
                        fillColor: fillColor,
                        fillOpacity: 0.5
                    }
                }
            });
            layer.addTo(map);
        }
        layer.clearLayers();
        if (layerAttractions) layer.addData(layerAttractions);
        if (layerTheatres) layer.addData(layerTheatres);
        if (layerViewpoints) layer.addData(layerViewpoints);
        if (layerMountains) layer.addData(layerMountains);
    }

    polygonService.addPolygon = addPolygon;
    polygonService.removePolygon = removePolygon;
    polygonService.setData = setData;
    polygonService.clear = clear;
    polygonService.update = update;

    $('#sources').on('click','.sources-headline',function() {
        if (layerOn) polygonService.clear();
        else polygonService.setData(countryData);
        layerOn = !layerOn;
    });
})();