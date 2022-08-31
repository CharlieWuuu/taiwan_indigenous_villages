// 引入底圖
var osmUrl = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png';
var osmMap = L.tileLayer(osmUrl, { attribution: 'OpenStreetMap' });
var myMap = L.map('map', { layers: [osmMap] }).setView([23.6, 120.9], 7);

var countyLayer = new L.layerGroup([]);
$.getJSON('assets/data/county.geojson', function (county) {
  countyLayer.addLayer(
    L.geoJSON(county['features'], {
      polygon: polygon,
      style: (feature) => {
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
    }),
  );
  displayDetails(county['features'], '');
});
countyLayer.addTo(myMap);

function polygon(feature, latlng) {
  return L.polygon(latlng, 300, {
    color: 'blue',
  });
}

var tribeLayer = new L.layerGroup([]);
$.getJSON('assets/data/tribe_test2.geojson', function (data) {
  tribeLayer.addLayer(
    L.geoJSON(data['features'], {
      // onEachFeature: onEachFeature,
      pointToLayer: pointToLayer,
    }),
  );
  displayDetails(data['features'], '');
});
tribeLayer.addTo(myMap);

// 部落位置
function pointToLayer(feature, latlng) {
  return L.circle(latlng, 300, {
    color: 'blue',
  });
}

// 彈出視窗
function onEachFeature(feature, layer) {
  if (feature.properties) {
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
}

var baseLayers = {};
var overlays = { 縣市邊界: countyLayer, 原住民部落: tribeLayer };
var layerControl = L.control.layers(baseLayers, overlays).addTo(myMap);

function displayDetails(features, choice) {
  $('.ListBlockscroll').html('');
  var ListRow = $('.ListBlockscroll');
  var pharmacyTemplate = $('#pharmacyTemplate');
  for (i = 0; i < features.length; i++) {
    if (choice == '') {
      pharmacyTemplate
        .find('.panel-title')
        .text(features[i].properties['部落名稱']);
      pharmacyTemplate
        .find('.traditional')
        .text(features[i].properties['部落傳統名制_羅馬拼音']);
      pharmacyTemplate
        .find('.address')
        .text(
          features[i].properties['縣市'] +
            features[i].properties['鄉鎮市區'] +
            features[i].properties['村里'],
        );
      pharmacyTemplate
        .find('.btn-location')
        .attr('data-lat', features[i].geometry.coordinates[0]);
      pharmacyTemplate
        .find('.btn-location')
        .attr('data-lng', features[i].geometry.coordinates[1]);
      ListRow.append(pharmacyTemplate.html());
    } else if (features[i].properties['縣市'] == choice) {
      pharmacyTemplate
        .find('.panel-title')
        .text(features[i].properties['部落名稱']);
      pharmacyTemplate
        .find('.traditional')
        .text(features[i].properties['部落傳統名制_羅馬拼音']);
      pharmacyTemplate
        .find('.address')
        .text(
          features[i].properties['縣市'] +
            features[i].properties['鄉鎮市區'] +
            features[i].properties['村里'],
        );
      pharmacyTemplate
        .find('.btn-location')
        .attr('data-lat', features[i].geometry.coordinates[0]);
      pharmacyTemplate
        .find('.btn-location')
        .attr('data-lng', features[i].geometry.coordinates[1]);
      ListRow.append(pharmacyTemplate.html());
    }
  }
}

// 篩選資料
function countySelect() {
  var choice = document.getElementById('towns').value;
  countyLayer.clearLayers();
  myMap.removeLayer(countyLayer);

  $.getJSON('assets/data/county.geojson', function (county) {
    countyLayer.addLayer(
      L.geoJSON(county['features'], {
        polygon: polygon,
        style: (feature) => {
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
    countyLayer.addTo(myMap);
  });

  tribeLayer.clearLayers();
  myMap.removeLayer(tribeLayer);

  $.getJSON('assets/data/tribe_test2.geojson', function (data) {
    tribeLayer.addLayer(
      L.geoJSON(data['features'], {
        onEachFeature: onEachFeature,
        pointToLayer: pointToLayer,
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
    tribeLayer.addTo(myMap);
    displayDetails(data['features'], choice);
  });
}

// 跳到點選的藥局
$(document).on('click', '.btn-location', function () {
  myMap.flyTo([$(this).data('lng'), $(this).data('lat')], 14);
});
