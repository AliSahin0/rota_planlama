var geoserverUrl = "http://localhost:8080/geoserver/";
var selectedPoint = null;

var source = null;
var target = null;

// Linke tıklanınca açılan haritanın görünümü
var map = L.map("map", {
	center: [41.0463, 28.8973],
	zoom: 18 //haritayı zoom seviyemiz
});

//openstreetmap basemap eklenmesi
//var OpenStreetMap = L.tileLayer(
//	"http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
//	{
//		maxZoom: 19,
//		attribution:
//			'&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
//	}
//).addTo(map);



// empty geojson layer for the shortest path result
var pathLayer = L.geoJSON(null);

// draggable marker for starting point. Note the marker is initialized with an initial starting position
var sourceMarker = L.marker([41.04637, 28.89731], {
	draggable: true
	
})
	.on("dragend", function(e) {
		selectedPoint = e.target.getLatLng();
		getVertex(selectedPoint);
		getRoute();
	})
	.addTo(map);

// draggbale marker for destination point.Note the marker is initialized with an initial destination positon
var targetMarker = L.marker([41.04631, 28.89731], {
	draggable: true
})
	.on("dragend", function(e) {
		selectedPoint = e.target.getLatLng();
		getVertex(selectedPoint);
		getRoute();
	})
	.addTo(map);

// function to get nearest vertex to the passed point
function getVertex(selectedPoint) {
	var url = `${geoserverUrl}/wfs?service=WFS&version=1.1.0&request=GetFeature&typeName=forum_istanbul_routing:nearest_vertex&outputformat=application/json&viewparams=x:${
		selectedPoint.lng
	};y:${selectedPoint.lat};`;
	$.ajax({
		url: url,
		async: false,
		success: function(data) {
			console.log(data);
		
			loadVertex(
				data,
				selectedPoint.toString() === sourceMarker.getLatLng().toString()
			);
		}
	});
}

// function to update the source and target nodes as returned from geoserver for later querying
function loadVertex(response, isSource) {
	var features = response.features;
	map.removeLayer(pathLayer);
	if (isSource) {
		console.log(features);
		source = features[0].properties.id;
		
	} else {
		
		target = features[0].properties.id;
		
	}
}

// function to get the shortest path from the give source and target nodes
function getRoute() {
	var url = `${geoserverUrl}/wfs?service=WFS&version=1.1.0&request=GetFeature&typeName=forum_istanbul_routing:shortest_path&outputformat=application/json&viewparams=source:${source};target:${target};`;

	$.getJSON(url, function(data) {
		map.removeLayer(pathLayer);
		pathLayer = L.geoJSON(data);
		map.addLayer(pathLayer);
	});
}

getVertex(sourceMarker.getLatLng());
getVertex(targetMarker.getLatLng());
getRoute();

// function that runs when form submitted
function submitForm(event) {
    event.preventDefault();

    

    // getting form data
    source = document.getElementById("source").value;
    target = document.getElementById("target").value;

    // run directions function
    getRoute(source, target);

    // reset form
    document.getElementById("form").reset();
}

// asign the form to form variable
const form = document.getElementById('form');

// call the submitForm() function when submitting the form
form.addEventListener('submit', submitForm);


//var denemeLayer1= L.tileLayer.wms('http://localhost:8080/geoserver/wms', {maxZoom: 19, layers: 'forum_istanbul_routing:transition_noded_pgr'}).addTo(map);
var denemeLayer = L.tileLayer.wms('http://localhost:8080/geoserver/wms', {maxZoom: 20, maxNativeZoom: 22, layers: 'forum_istanbul_routing:geotiff_coverage'}).addTo(map);
denemeLayer1.bringToFront()