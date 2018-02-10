// Code taken from Spotify's example code and modified slightly.

var access_token, refresh_token;

var showLogin = function() {
    if ($('#login-container').hasClass('d-none')) {
        $('#login-container').removeClass('d-none');
    }

    // Disable search
    $('#search-input').attr('placeholder', '');
    $('#search-input').attr('disabled', 'disabled');
    $('#search-button').attr('disabled', 'disabled');
    hideSearchClear();

    hideArtists();
    hideAlbums();
    hideAlbumDetails();
};

var hideLogin = function() {
    if (!$('#login-container').hasClass('d-none')) {
         $('#login-container').addClass('d-none');
    }

    // Enable search
    $('#search-input').attr('placeholder', 'Search for artist');
    $('#search-button').removeAttr('disabled');
    $('#search-input').removeAttr('disabled');

    // This might not work so well if we had to relogin in the
    // middle of doing something else.
    //showArtists();
};

// Obtains parameters from the hash of the URL
var getHashParams = function() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while ( e = r.exec(q)) {
        hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
};

var checkLogin = function() {
    var params = getHashParams();

    refresh_token = params.refresh_token;
    var params_access_token = params.access_token;
    var error = params.error;
    var home = params.home;

    if (params_access_token) {
        access_token = params_access_token;
    }

    if (error) {
        alert('There was an error during the authentication');
    } else {
        if (access_token) {
            $.ajax({
                url: 'https://api.spotify.com/v1/me',
                headers: {
                    'Authorization': 'Bearer ' + access_token
                },
                success: function(response) {
                    hideLogin();
                }
            });
        } else {
            showLogin();
        }
    }
};

var refreshAccessToken = function() {
    $.ajax({
        url: '/refresh_token',
        data: {
            'refresh_token': refresh_token
        }
    }).done(function(data) {
        access_token = data.access_token;
        global_access_token = access_token;
    });
};
