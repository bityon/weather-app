var geocoder;
var map;
google.maps.event.addDomListener(window, 'load', initialize);

var helper = (function() {
  var BASE_API_PATH = 'plus/v1/';

  return {
    /**
     * Hides the sign in button and starts the post-authorization operations.
     *
     * @param {Object} authResult An Object which contains the access token and
     *   other authentication information.
     */
    onSignInCallback: function(authResult) {
      gapi.client.load('plus','v1').then(function() {
        $('#authResult').html('Auth Result:<br/>');
        for (var field in authResult) {
          $('#authResult').append(' ' + field + ': ' +
              authResult[field] + '<br/>');
        }
        if (authResult['access_token']) {
          $('#authOps').show('slow');
          $('#gConnect').hide();
          helper.profile();
          helper.people();
        } else if (authResult['error']) {
          // There was an error, which means the user is not signed in.
          // As an example, you can handle by writing to the console:
          console.log('There was an error: ' + authResult['error']);
          $('#authResult').append('Logged out');
          $('#authOps').hide('slow');
          $('#gConnect').show();
        }
        console.log('authResult', authResult);
      });
    },

    /**
     * Calls the OAuth2 endpoint to disconnect the app for the user.
     */
    disconnect: function() {
      // Revoke the access token.
      $.ajax({
        type: 'GET',
        url: 'https://accounts.google.com/o/oauth2/revoke?token=' +
            gapi.auth.getToken().access_token,
        async: false,
        contentType: 'application/json',
        dataType: 'jsonp',
        success: function(result) {
          console.log('revoke response: ' + result);
          $('#authOps').hide();
          $('#profile').empty();
          $('#visiblePeople').empty();
          $('#authResult').empty();
          $('#gConnect').show();
        },
        error: function(e) {
          console.log(e);
        }
      });
    },

    /**
     * Gets and renders the list of people visible to this app.
     */
    people: function() {
      gapi.client.plus.people.list({
        'userId': 'me',
        'collection': 'visible'
      }).then(function(res) {
        var people = res.result;
        $('#visiblePeople').empty();
        $('#visiblePeople').append('Number of people visible to this app: ' +
            people.totalItems + '<br/>');
        for (var personIndex in people.items) {
          person = people.items[personIndex];
          $('#visiblePeople').append('<img src="' + person.image.url + '">');
        }
      });
    },

    /**
     * Gets and renders the currently signed in user's profile data.
     */
    profile: function(){
      gapi.client.plus.people.get({
        'userId': 'me'
      }).then(function(res) {
        var profile = res.result;
        var email = profile.emails[0].value;
        var fullName = profile.displayName;



        $('#loginConatiner').hide();
        // $('#InputName').text(fullName);
        // $('#InputEmail').text(email);
        $('#formConatiner').show();

        $('#profile').empty();
        $('#profile').append(
            $('<p><img src=\"' + profile.image.url + '\"></p>'));
        $('#profile').append(
            $('<p>Hello ' + profile.displayName + '!<br />Tagline: ' +
            profile.tagline + '<br />About: ' + profile.aboutMe + '</p>'));
        if (profile.cover && profile.coverPhoto) {
          $('#profile').append(
              $('<p><img src=\"' + profile.cover.coverPhoto.url + '\"></p>'));
        }
      }, function(err) {
        var error = err.result;
        $('#profile').empty();
        $('#profile').append(error.message);
      });
    }
  };
})();

$(document).ready(function() {
	$('#disconnect').click(helper.disconnect);
  
  	$('#loaderror').hide();
	if ($('[data-clientid="YOUR_CLIENT_ID"]').length > 0) {
	    alert('This sample requires your OAuth credentials (client ID) ' +
	        'from the Google APIs console:\n' +
	        '    https://code.google.com/apis/console/#:access\n\n' +
	        'Find and replace YOUR_CLIENT_ID with your client ID.'
	    );
	}

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
		updateUserTable();
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
		updateUserTable();
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}

function onSignInCallback(authResult) {
  helper.onSignInCallback(authResult);
}

function updateUserTable() {
	var time = new Date().toGMTString();
    var location = $('#InputLocation').val();

    // $('#userTable thead').after('<tr>
				//         			<td>'+'A'+'</td>
				//         			<td>'+'A'+'</td>
				// 		        	<td>'+'A'+'</td>
				// 		        	<td>'+'A'+'</td>
				// 		            <td>'+'A'+'</td>
				// 		            <td>'+'A'+'</td>
				// 		            <td>'+'A'+'</td>
				//         		</tr>');
    //var 
}

