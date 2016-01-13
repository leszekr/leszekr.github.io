$(document).ready(function() {
  $.get(window.page.geojson, function(data) {
    L.mapbox.accessToken = 'pk.eyJ1IjoiaGlrciIsImEiOiJxM3V6ZXk0In0.1CNCWhDo7kNlczl5fv9hRA';
    var map = L.mapbox.map('map', 'mapbox.streets').setView(window.page.center, 13);
    L.geoJson(data, { style: L.mapbox.simplestyle.style }).addTo(map);
  });
})
