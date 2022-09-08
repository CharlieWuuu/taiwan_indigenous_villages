// (1)import
// import baseLayer
var osmMap = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
  attribution: 'OpenStreetMap',
});
var myMap = L.map('map', { layers: [osmMap] }).setView([23.6, 120.9], 7);

// import county geojson
var countyLayer = new L.layerGroup([]);
function getCounty(choice) {
  $.getJSON('assets/data/county.geojson', function (county) {
    countyLayer.addLayer(
      L.geoJSON(county['features'], {
        polygon: function polygon(feature, latlng) {
          return L.polygon(latlng);
        },
        style: function (feature) {
          return {
            stroke: true,
            color: 'rgba(0,0,0, 0.7)',
            weight: 1,
            opacity: 0.3,
            fill: true,
            fillColor: 'black',
            fillOpacity: 0.15,
            smoothFactor: 0.5,
            interactive: false,
          };
        },
        filter: function (feature, layer) {
          if (choice == '') return true;
          if (feature.properties['COUNTYNAME'] == choice) {
            return true;
          } else {
            return false;
          }
        },
      }),
    );
  });
}
countyLayer.addTo(myMap);

// import tribe geojson
var tribeLayer = new L.layerGroup([]);
function getTribe(choice) {
  $.getJSON('assets/data/tribe_test2.geojson', function (data) {
    tribeLayer.addLayer(
      L.geoJSON(data['features'], {
        onEachFeature: onEachFeature,
        pointToLayer: function pointToLayer(feature, latlng) {
          return L.circle(latlng, 300, {
            color: 'blue',
          });
        },
        filter: function (feature, layer) {
          if (choice == '') return true;
          if (feature.properties['縣市'] == choice) {
            return true;
          } else {
            return false;
          }
        },
      }),
    );
    displayDetails(data['features'], choice);
  });
}
tribeLayer.addTo(myMap);

// import overLayer
getCounty('');
getTribe('');

// create map control
var baseLayers = {};
var overlays = { 縣市邊界: countyLayer, 原住民部落: tribeLayer };
var layerControl = L.control.layers(baseLayers, overlays).addTo(myMap);

// display details
function displayDetails(features, choice) {
  $('.ListBlockscroll').html('');
  for (i = 0; i < features.length; i++) {
    if (choice == '') {
      renderDetail(features);
    } else if (features[i].properties['縣市'] == choice) {
      renderDetail(features);
    }
  }
}

function renderDetail(features) {
  tribeTemplate =
    `<div id="tribeTemplate">
      <div class="panel panel-default">
        <div class="panel-heading">
          <h3 class="panel-title">` +
    features[i].properties['部落名稱'] +
    `</h3>
        </div>
        <div class="panel-body">
          <strong>族語名稱</strong>：<span class="traditional">` +
    features[i].properties['部落傳統名制_羅馬拼音'] +
    `</span><br />
          <strong>地址</strong>：<span class="address">` +
    features[i].properties['縣市'] +
    features[i].properties['鄉鎮市區'] +
    features[i].properties['村里'] +
    `</span>
          <hr />
          <button
            class="btn btn-secondary btn-sm btn-location"
            type="button"
            data-id="0"
            data-lat="` +
    features[i].geometry.coordinates[0] +
    `"data-lng="` +
    features[i].geometry.coordinates[1] +
    `">
            Location
          </button>
        </div>
      </div>
    </div>`;
  $('.ListBlockscroll').append(tribeTemplate);
}

// (2)interact
// filter
function changeCounty() {
  var choice = document.getElementById('towns').value;
  countyLayer.clearLayers();
  tribeLayer.clearLayers();
  getCounty(choice);
  getTribe(choice);
}

// fly to
$(document).on('click', '.btn-location', function () {
  myMap.flyTo([$(this).data('lng'), $(this).data('lat')], 14);
});

// tribe pop out
function onEachFeature(feature, layer) {
  var content =
    '<h6>' +
    feature.properties['部落名稱'] +
    '｜' +
    feature.properties['部落傳統名制_羅馬拼音'] +
    '</h6><p>' +
    feature.properties['縣市'] +
    feature.properties['鄉鎮市區'] +
    feature.properties['村里'] +
    '</p><p>鄰近：' +
    feature.properties['定位點'] +
    '</p>';
  layer.bindPopup(content);
}
