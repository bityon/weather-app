var geocoder;
var map;
google.maps.event.addDomListener(window, 'load', initialize);

$(document).ready(function() {
	$('#submit').click(getLocation);

	$('#current_loc').click(function() {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(UpdateTable);
        }
	});

	$('#searchLog').click(function() {
		codeAddress();
	});

	var x = document.getElementById("demo");   
});

function UpdateTable(position) {
	$('#currLatitude').text(position.coords.latitude.toFixed(4));
	$('#currLongitude').text(position.coords.longitude.toFixed(4));
	showPosition(position.coords.latitude, position.coords.longitude);
	getWeather(position.coords.latitude, position.coords.longitude);
}

function getWeather(lat, lon) {
	base_url = "http://api.worldweatheronline.com/free/v2/weather.ashx?"
	key = "key=18dd48cad69a32f3c0eb9f15e10b2"
	format = "&format=json"
	latitude = lat;//position.coords.latitude;
	longitude = lon;//position.coords.longitude;
	q = "&q=" + latitude + "," + longitude;
	final_url = base_url + key + format + q;	

	$.getJSON(final_url, function( data ) {
		var tempC = data.data.current_condition[0].temp_C;
		$('#currWeather').text(tempC + "°");
		$('#dataTable').slideDown();
	});
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
}

function showPosition(lat, lon)
{
  // lat=position.coords.latitude;
  // lon=position.coords.longitude;
  latlon=new google.maps.LatLng(lat, lon)
  mapholder=document.getElementById('mapholder')
  mapholder.style.height='250px';
  mapholder.style.width='100%';

  var myOptions={
  center:latlon,zoom:14,
  mapTypeId:google.maps.MapTypeId.ROADMAP,
  mapTypeControl:false,
  navigationControlOptions:{style:google.maps.NavigationControlStyle.SMALL}
  };
  var map=new google.maps.Map(document.getElementById("mapholder"),myOptions);
  var marker=new google.maps.Marker({position:latlon,map:map,title:"You are here!"});
}

function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            x.innerHTML = "User denied the request for Geolocation."
            break;
        case error.POSITION_UNAVAILABLE:
            x.innerHTML = "Location information is unavailable."
            break;
        case error.TIMEOUT:
            x.innerHTML = "The request to get user location timed out."
            break;
        case error.UNKNOWN_ERROR:
            x.innerHTML = "An unknown error occurred."
            break;
    }
}

function initialize() {
  geocoder = new google.maps.Geocoder();
  var latlng = new google.maps.LatLng(-34.397, 150.644);
  var mapOptions = {
    zoom: 8,
    center: latlng
  }
  // map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
}

function codeAddress() {
  	var address = $('#InputLocation').val();
  	geocoder.geocode( { 'address': address}, function(results, status) {
	
	if (status == google.maps.GeocoderStatus.OK) {
  		$('#currLatitude').text(results[0].geometry.location.k.toFixed(4));
		$('#currLongitude').text(results[0].geometry.location.D.toFixed(4));
		//var position = results[0].geometry.location;
		showPosition(results[0].geometry.location.k, results[0].geometry.location.D);
		getWeather(results[0].geometry.location.k, results[0].geometry.location.D);
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}