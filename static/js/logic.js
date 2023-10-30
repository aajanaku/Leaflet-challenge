// Create a Leaflet map
let myMap = L.map("map", {
    center: [
        40.7, -94.5
    ],
    zoom: 3,
});

// Add a base map layer
var lightBlue = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

var usgs = L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>'
});

lightBlue.addTo(myMap);

//menu

let baseMaps = {
    "Light Global": lightBlue,
    "USGS": usgs
};

let tectonicplates = new L.LayerGroup();

let earthquakes = new L.LayerGroup();

let overlays = {
    "Tectonic Plates": tectonicplates,
    Earthquakes: earthquakes
};


L
    .control
    .layers(baseMaps, overlays, { collapsed: false })
    .addTo(myMap);
///////////////////////////////

// Function to determine circle size based on magnitude
function getSize(magnitude) {
    return magnitude * 5;
}

// Function to determine circle color based on depth
function getColor(depth) {
    if (depth < 10) return 'red';
    if (depth < 50) return 'orange';
    return 'yellow';
}

// Function to create a popup for each earthquake marker
function createPopup(feature, layer) {
    layer.bindPopup(`
        <b>Magnitude:</b> ${feature.properties.mag}<br>
        <b>Depth:</b> ${feature.geometry.coordinates[2]} km<br>
        <b>Location:</b> ${feature.properties.place}
    `);
}

// Fetch earthquake data from the URL and create markers
//delete fetch('https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json')
//delete    .then(response => response.json())
//delete    .then(data => {

d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data) {

    L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
                radius: getSize(feature.properties.mag),
                fillColor: getColor(feature.geometry.coordinates[2]),
                color: 'black',
                weight: 1,
                opacity: 1,
                fillOpacity: 0.7,
            });
        },
        onEachFeature: createPopup,
    }).addTo(earthquakes);

    earthquakes.addTo(myMap)

    let legend = L.control({ position: 'bottomright' });

    legend.onAdd = function () {
        let div = L.DomUtil.create("div", "info legend");

        let grades = [-10, 10, 30, 50, 70, 90];

        let colors = [
            "#98ee00",
            "#d4ee00",
            "#eecc00",
            "#ee9c00",
            "#ea822c",
            "#ea2c2c"];

        for (let i = 0; i < grades.length; i++) {
            div.innerHTML += "<i style='background: "
                + colors[i]
                + "'></i> "
                + grades[i]
                + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
        }

        return div;
    };

    legend.addTo(myMap);

})
//delete .catch(error => {
//delete    console.error('Error fetching earthquake data:', error);
//delete });
