/////////////Ajax Requests////////////
$(document).ready(function () {
  // Fetch the initial table
  refreshTable();
  // Fetch the initial Map
  refreshMap();

  // Fetch the initial Chart
  refreshChart();
  // Fetch every 5 second
  setInterval(refreshChart, 5000);

  // Fetch every 1 second
  setInterval(refreshTable, 1000);
  setInterval(refreshMap, 5000);
});

google.charts.load("current", { packages: ["corechart"] });
google.charts.setOnLoadCallback(refreshChart);

function refreshTable() {
  // var trHTML = '';

  $.getJSON(
    "https://spreadsheets.google.com/feeds/list/14PQ_c-u9KFF3aCm3LoCNs8qCKOw0OeqgZKgvQ9Gf2ZM/1/public/full?alt=json",
    function (data) {
      var trHTML = "";

      for (var i = 0; i < data.feed.entry.length; ++i) {
        var myData_map, myData_order;

        trHTML +=
          "<tr><td>" +
          data.feed.entry[i].gsx$orderid.$t +
          "</td><td>" +
          data.feed.entry[i].gsx$item.$t +
          "</td><td>" +
          data.feed.entry[i].gsx$priority.$t +
          "</td><td>" +
          data.feed.entry[i].gsx$city.$t +
          "</td><td>" +
          data.feed.entry[i].gsx$dispatchstatus.$t +
          "</td><td>" +
          data.feed.entry[i].gsx$shippedstatus.$t +
          "</td><td>" +
          data.feed.entry[i].gsx$orderdateandtime.$t +
          "</td><td>" +
          data.feed.entry[i].gsx$dispatchdateandtime.$t +
          "</td><td>" +
          data.feed.entry[i].gsx$shippeddateandtime.$t +
          "</td><td>" +
          data.feed.entry[i].gsx$timetaken.$t +
          "</td></tr>";
      }

      console.log(trHTML);
      $("#tableContent").html(trHTML);
      var trHTML = "";
    }
  );
}

function refreshMap() {
  var container = L.DomUtil.get("map");

  if (container != null) {
    container._leaflet_id = null;
  }

  var map = L.map("map").setView([20.5937, 78.9629], 4);
  var jsonDataObject = [];

  $.getJSON(
    "https://spreadsheets.google.com/feeds/list/14PQ_c-u9KFF3aCm3LoCNs8qCKOw0OeqgZKgvQ9Gf2ZM/1/public/full?alt=json",
    function (data) {
      for (var i = 0; i < data.feed.entry.length; ++i) {
        var json_data = {
          City: data.feed.entry[i].gsx$city.$t,
          OderID: data.feed.entry[i].gsx$orderid.$t,
          Item: data.feed.entry[i].gsx$item.$t,
          Latitude: parseFloat(data.feed.entry[i].gsx$latitude.$t),
          Longitude: parseFloat(data.feed.entry[i].gsx$longitude.$t),
          Dispatch_status: data.feed.entry[i].gsx$dispatchstatus.$t,
          Shipped_status: data.feed.entry[i].gsx$shippedstatus.$t,
        };
        jsonDataObject.push(json_data);

        for (var j = 0; j < jsonDataObject.length; j++) {
          var marker = L.marker(
            [
              parseFloat(jsonDataObject[j].Latitude),
              parseFloat(jsonDataObject[j].Longitude),
            ],
            {
              icon: set_marker_color(
                jsonDataObject[j].Dispatch_status,
                jsonDataObject[j].Shipped_status
              ),
            }
          );
          marker.bindPopup(jsonDataObject[j].City, {
            autoClose: true,
          });
          map.addLayer(marker);
          marker.on("click", onClick_Marker);
          // Attach the corresponding JSON data to your marker:
          marker.myJsonData = jsonDataObject[j];
          function set_marker_color(dis_status, ship_status) {
            var redIcon = new L.Icon({
              iconUrl:
                "https://github.com/pointhi/leaflet-color-markers/blob/master/img/marker-icon-red.png?raw=true",
              shadowUrl:
                "https://github.com/pointhi/leaflet-color-markers/blob/master/img/marker-shadow.png?raw=true",
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41],
            });

            var greenIcon = new L.Icon({
              iconUrl:
                "https://github.com/pointhi/leaflet-color-markers/blob/master/img/marker-icon-green.png?raw=true",
              shadowUrl:
                "https://github.com/pointhi/leaflet-color-markers/blob/master/img/marker-shadow.png?raw=true",
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41],
            });

            var yellowIcon = new L.Icon({
              iconUrl:
                "https://github.com/pointhi/leaflet-color-markers/blob/master/img/marker-icon-yellow.png?raw=true",
              shadowUrl:
                "https://github.com/pointhi/leaflet-color-markers/blob/master/img/marker-shadow.png?raw=true",
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41],
            });

            if (dis_status == "YES" && ship_status == "YES") {
              return greenIcon;
            } else if (dis_status == "YES" && ship_status == "NO") {
              return yellowIcon;
            } else {
              return redIcon;
            }
          }

          // var info = L.control();
          // info.onAdd = function (map) {
          //   this._div = L.DomUtil.create("div", "info"); // create a div with a class "info"
          //   this.update();
          //   return this._div;
          // };

          // function onClick_Marker(e) {
          //   var marker = e.target;
          //   // info.addTo(map);
          //   popup = L.popup()
          //     .setLatLng(marker.getLatLng())
          //     .setContent(
          //       "Order ID: " +
          //         marker.myJsonData.OderID +
          //         " || Item: " +
          //         marker.myJsonData.Item
          //     )
          //     .openOn(map);

          //   // var marker = e.target;

          //   // method that we will use to update the control based on feature properties passed
          //   info.update = function (marker) {
          //     this._div.innerHTML = "<h4>Population Density</h4>";
          //   };

          //   info.update(marker);
          // }
          function onClick_Marker(e) {
            // info.onRemove(map);
            var info = L.control();

            info.onAdd = function (map) {
              this._div = L.DomUtil.create("div", "info"); // create a div with a class "info"
              this.update();
              return this._div;
            };

            // method that we will use to update the control based on feature properties passed
            info.update = function () {
              this._div.innerHTML = "<h4>US Population Density</h4>";
            };
            info.addTo(map);

            // function onClick_Marker(e) {
            var marker = e.target;
            // info.onRemove(map);

            info.update();
            info.onRemove(map);
          }

          // function resetHighlight(e) {
          //   info.update();
          // }

          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
              '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
          }).addTo(map);
        }
      }
    }
  );
}

function refreshChart() {
  var jsonDataObject = [];
  var graph_arr = [["Order ID", "Time Taken", { role: "style" }]];
  var bar_color = [];
  $.getJSON(
    "https://spreadsheets.google.com/feeds/list/14PQ_c-u9KFF3aCm3LoCNs8qCKOw0OeqgZKgvQ9Gf2ZM/1/public/full?alt=json",
    function (data) {
      for (var i = 0; i < data.feed.entry.length; ++i) {
        var json_data = {
          OderID: data.feed.entry[i].gsx$orderid.$t,
          TimeTaken: parseFloat(data.feed.entry[i].gsx$timetaken.$t),
          Priority: data.feed.entry[i].gsx$priority.$t,
        };
        jsonDataObject.push(json_data);
      }
      // Setting color for the coloumns of graph according to priority of items
      for (var j in jsonDataObject) {
        if (jsonDataObject[j].Priority == "HP") {
          var color = "#FF0000";
        } else if (jsonDataObject[j].Priority == "MP") {
          var color = "#FFFF00";
        } else if (jsonDataObject[j].Priority == "LP") {
          var color = "#00FF00";
        }
        bar_color.push(color);
      }

      // Converting Json Object to JavaScript Array
      for (var j in jsonDataObject) {
        graph_arr.push([
          jsonDataObject[j].OderID,
          jsonDataObject[j].TimeTaken,
          bar_color[j],
        ]);
      }
      var graphArray_Final = google.visualization.arrayToDataTable(graph_arr);

      var data = new google.visualization.DataView(graphArray_Final);

      var options = {
        title: "Time Taken for items to be Shipped",
        hAxis: { title: "Order ID" },
        vAxis: { title: "Time Taken (s)" },
        legend: { position: "none" },
      };
      var chart = new google.visualization.ColumnChart(
        document.getElementById("column_chart")
      );
      chart.draw(data, options);
    }
  );
}
