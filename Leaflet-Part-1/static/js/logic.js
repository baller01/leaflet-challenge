// Step 1: Define the earthquake data URL
const earthquakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Step 2: Create a new Leaflet map
const myMap = L.map("map", {
  center: [37.7749, -122.4194],
  zoom: 4
});

// Step 3: Add a tile layer to the map
const tileLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors"
}).addTo(myMap);

// Step 4: Create a new layer group for the earthquake data
const earthquakes = L.layerGroup().addTo(myMap);

// Step 5: Retrieve earthquake data and create markers for each earthquake
fetch(earthquakeUrl)
  .then(response => response.json())
  .then(data => {
    L.geoJSON(data, {
      pointToLayer: function(feature, latlng) {
        return L.circleMarker(latlng, {
          radius: feature.properties.mag * 5,
          fillColor: getColor(feature.geometry.coordinates[2]),
          color: "#000",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        });
      },
      onEachFeature: function(feature, layer) {
        layer.bindPopup(`<h3>${feature.properties.place}</h3><hr>
                          <p>${new Date(feature.properties.time)}</p>
                          <p>Magnitude: ${feature.properties.mag}</p>
                          <p>Depth: ${feature.geometry.coordinates[2]}</p>`);
      }
    }).addTo(earthquakes);

    // Step 6: Define a function to get the color based on the depth of the earthquake
    function getColor(depth) {
      const colors = ['#ADFF2F', '#FFFF00', '#FFA500', '#FF8C00', '#FF4500', '#FF0000'];
      return depth > 90 ? colors[5] :
             depth > 70 ? colors[4] :
             depth > 50 ? colors[3] :
             depth > 30 ? colors[2] :
             depth > 10 ? colors[1] : colors[0];
    }

    // Step 7: Create a legend for the earthquake data
    const legend = L.control({ position: "bottomright" });
    legend.onAdd = function() {
      const div = L.DomUtil.create("div", "info legend");
      const depths = [-10, 10, 30, 50, 70, 90];
      const labels = [];

      for (let i = 0; i < depths.length; i++) {
        div.innerHTML +=
          `<i style="background:${getColor(depths[i] + 1)}"></i> ` +
          `${depths[i]}${depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+'}`;
      }
      return div;
    };

    // Step 8: Add the legend to the map
    legend.addTo(myMap);
  })
  .catch(error => console.error(error));