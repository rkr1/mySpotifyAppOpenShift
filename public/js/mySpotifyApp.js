// Copyright (c) 2018 Renee K. Rodgers
//
// mySpotifyApp.js
//
// JavaScript code to interface with the SpotifyAPI.
// 
// Requirements included:
//   - Searching by artist, and giving search suggestions
//   - Display list of artists retrieved
//   - Clicking on an artist retrieves a list of their albums
//   - Clicking on an album retrieves a list of tracks
//   - Use ReactJS
//   - Back button/history state
//
// Known issues:
//   - Didn't use ReactJS
//   - Need "more" button to fetch beyond initial results
//   - Need "clear" button to start over, although clicking on "myApp" does that
//   - Replace "myApp" with a home icon
//   - History state isn't correct all of the time
//   - Formatting imperfections
//   - Everything always needs more error handling and tighting of corner cases

const NO_IMAGE_URL = "assets/no-image.jpg";
const ENABLE_DEBUG = true;

var debugPrint = function(debugStr) {
    if (ENABLE_DEBUG === true) {
        console.log(debugStr);
    }
};

// Verify the input is a string of non-zero length
var isString = function(str) {
    if ((str !== undefined) && (str != null) && (typeof(str) === "string") && (str.length > 0)) {
        return true;
    } else {
        debugPrint("isString = false");
        return false;
    }
};

// Search example: https://api.spotify.com/v1/search?q=Michael&type=artist
var searchSpotify = function(query, searchType, offset, limit, successHandler, errorHandler) {
    var searchData = {
              q: query,
              type: searchType,
              market: 'US',
              offset: offset, 
              limit: limit 
          };
    makeRequest('https://api.spotify.com/v1/search', searchData, successHandler, errorHandler);
};

// https://api.spotify.com/v1/artists/{id}/albums
var albumsByArtistIDSpotify = function(artist_id, successHandler, errorHandler) {
    var requestData = {
            album_type: "single,album",
            offset: 0,
            limit: 10
        };
    var url = 'https://api.spotify.com/v1/artists/' + artist_id + '/albums';
    makeRequest(url, requestData, successHandler);
};

// https://api.spotify.com/v1/albums/{id}
var tracksByAlbumSpotify = function(album_id, successHandler, errorHandler) {
    var requestData = {};
  
    var url = 'https://api.spotify.com/v1/albums/' + album_id;
    makeRequest(url, requestData, successHandler, errorHandler);
};

// ajax wrapper
var makeRequest = function(url, data, successHandler, errorHandler)
{
    $.ajax({
        url: url,
        type: 'GET',
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
        data: data,
        success: function (data) {
            if (successHandler) {
                successHandler(data);
            }
        },
        error: function(error) {
            if (error && error.status) {
                debugPrint("error: " + error.status + ", " + error.statusText);
        
                // If xhr code == 401, need to log in
                switch (error.status) {
                    case 401:
                        debugPrint("login failed");
                        refreshAccessToken();
                        break;
                  
                    //case xxx:
                        // FIXME: One of the status codes means "retry after x seconds",
                        //        look it up and implement it
                        //break;
                  
                    default: debugPrint("unhandled error");
                        break;
                }
            }
            if (errorHandler) {
                errorHandler();
            }
        }
    });
};

var artistSuggestionsGet = function(query, cb) {
    if (isString(query)) {
        //debugPrint("query: " + query);
        searchSpotify(
            query,
            'artist',
            0,
            5,
            function(data) {
                if (data && data.artists && data.artists.items) {
                    // debugPrint(data.artists.items.length + " suggestions retrieved");
                    cb(data.artists.items);
                } else {
                    cb([]);
                }
            },
            function() {
                if (cb) {
                    cb([]);
                }
            }
        );
    }
};

var artistSearch = function() {
    var query = $('#search-input').val();
    if (query && (query.length > 0)) {
        $('#artists-container').empty();
        $('#albums-container').empty();
        hideArtists();
        hideAlbums();
        hideAlbumDetails();
        // TODO: show a spinner
        searchSpotify(query, 'artist', 0, 10, artistListRender, genericErrorHandler);
    }
    return false;
};

var artistListRender = function(data) {
    debugPrint("artistListRender");
    showArtists();
    if (data && data.artists && data.artists.items && (data.artists.items.length > 0)) {
        debugPrint(data.artists.items.length + " artists retrieved");

        // FIXME: use ReactJS to do this
        $.each(data.artists.items, function(i, item) {
            $('#artists-container').append(renderItem(i, item, 'artist'));
        });

        // FIXME: implement this
        /*
        if (data.artists.next) {
            debugPrint("appendMore");
            // https://api.spotify.com/v1/search?query=Michael+Jackson&type=artist&market=US&offset=10&limit=10
            $('#artists-container').append('<a href="' + data.artists.next + '" class="btn btn-primary-outline btn-center">More</a>');
        }
        */

    } else {
        $('#artists-container').append('<h5>No artists found</h5>');
    }
};

var albumsByArtistIDGet = function(artist_id) {
    if (isString(artist_id)) {
        //showAlbums();
        $('#albums-container').empty();
        hideAlbums();
        debugPrint("artist_id: " + artist_id);
        albumsByArtistIDSpotify(artist_id, albumsByArtistIDSuccess, albumsByArtistIDError);
    }
};

/*
  renderItem builds up the following HTML:
  <div class="col-md-2">
    <div class="media justify-content-center">
      <a href="#album-id=fMbdgg4jU18AjLCKBhRSm">
        <img class="rounded" width="120" height="120" src="placeholder160.jpg" />
        <p class="text-center">Diff block 1</p>
      </a>
    </div>
  </div>
 
  This should be replaced with reactJS.
*/
var renderItem = function(i, item, item_type) {
    var div = $('<div class="col-md-2" />');
    let div2 = $('<div class="media justify-content-center">');
    let a = $('<a href="#' + item_type + '-id=' + item.id + '" />');
    let imgurl = (item.images.length > 0) ? item.images[0].url : NO_IMAGE_URL;

    let w = (item_type == 'album') ? "120" : "160";
    let h = w;

    let img = $('<img class="rounded" width=' + w + ' height=' + h + ' src="' + imgurl + '" />');
    let p = $('<p class="text-center">' + item.name + '</p>');

    $(a).append(img).append(p);
    $(div2).append(a);
    $(div).append(div2);
    return div;
};

var albumsByArtistIDSuccess = function(data) {
    showAlbums();
    var header_str = "Albums";
    if (data && data.items && (data.items.length > 0)) {
        debugPrint(data.items.length + " albums retrieved");

        //debugPrint("album by: " + data.items[0].artists[0].name);
        if (data.items[0] && data.items[0].artists && (data.items[0].artists.length > 0) &&
            data.items[0].artists[0].name && (data.items[0].artists[0].name.length > 0)) {
            header_str += " by " + data.items[0].artists[0].name;
        }
        
        $.each(data.items, function(i, item) {
            debugPrint("album: " + item.name);
            $('#albums-container').append(renderItem(i, item, 'album'));
        });
    } else {
        $('#albums-container').append('<h5>No albums found</h5>');
        debugPrint("No albums found");
    }
    $('#albums-header-text').text(header_str);
};

var albumsByArtistIDError = function() {
    debugPrint("albumsByArtistIDError");
    // TODO: Render error, ignore, or retry
};

var tracksByAlbumGet = function(album_id) {
    if (isString(album_id)) {
        $('#tracks-list').empty();
        // debugPrint("album_id: " + album_id);
        tracksByAlbumSpotify(album_id, tracksByAlbumSuccess, genericErrorHandler);
    }
};

var tracksByAlbumSuccess = function(data) {
    var album_name = '';
    var artist_name = '';
    var year = '';

    if (data) {
        debugPrint("tracksByAlbum retrieved " + data.tracks.items.length + " items");

        if (data.name) {
            album_name = data.name;
        }
        if (data.artists && (data.artists.length > 0) && data.artists[0].name) {
            artist_name = data.artists[0].name;
        }
        if (data.release_date) {
            if (data.release_date.length >= 4) {
                year = data.release_date.substring(0, 4);
            } else {
                year = data.release_date;
            }
        }

        if (data.tracks && data.tracks.items && (data.tracks.items.length > 0)) {
            $.each(data.tracks.items, function(i, item) {
                // Using i instead of item.track_number isn't quite right, but it's the way the
                // SpotifyAPI does it for old albums with multiple discs.
                let li = $('<li>' + (i+1).toString() + '. ' + item.name + ' <span class="float-right">' + formatMilliseconds(item.duration_ms) + '</span></li>');
                $('#tracks-list').append(li);
            });
        } else {
            let li = $('<li/>').text('No tracks found');
            $('#tracks-list').append(li);
        }
    } else {
        debugPrint("No album details found");
        let li = $('<li/>').text('No album details found');
        $('#tracks-list').append(li);
    }

    $('#album-details-album-name').text(album_name);
    $('#album-details-artist-name').text(artist_name);
    $('#album-details-year').text(year);
};

// ms/hour = 1000 ms/sec * 60 sec/min * 60 min/hour
const MS_PER_HOUR = 1000 * 60 * 60;
var formatMilliseconds = function(ms) {
    var str = "";
    if (ms && (ms > 0)) {
        date = new Date(ms);
        if (ms >= MS_PER_HOUR) {
            // hh:mm:ss, this is unlikely, and not tested
            str = date.getHours() + ":";
        }
        // mm:ss, but without the leading 0 on the minutes
        str += date.getMinutes() + ":" + ("0" + date.getSeconds()).slice(-2);
    }
    return str;
};

var genericErrorHandler = function() {
    debugPrint("genericErrorHandler");
    // FIXME: Decide what to do - render an error, ignore, or retry
};

// FIXME:
// Make show/hide containers collapsible and slide more smoothly.
// Collapsible it's working with justify-content-center
// There's probably some delay trick that I haven't figured out.
var hideArtists = function() {
    if (!$('#artists-container').hasClass('d-none')) {
         $('#artists-container').addClass('d-none');
    }
    if (!$('#artists-header').hasClass('d-none')) {
         $('#artists-header').addClass('d-none');
    }
};

var showArtists = function() {
    if ($('#artists-container').hasClass('d-none')) {
        $('#artists-container').removeClass('d-none');
    }
    if ($('#artists-header').hasClass('d-none')) {
        $('#artists-header').removeClass('d-none');
    }
};

var showAlbums = function() {
    if ($('#albums-container').hasClass('d-none')) {
        $('#albums-container').removeClass('d-none');
    }
    if ($('#albums-header').hasClass('d-none')) {
        $('#albums-header').removeClass('d-none');
    }
    //$("#albums-container").collapse('show');
};

// Save for furture reference
// This means the collapse('show') has completed.
//$("#albums-container").on("shown.bs.collapse", function() {
//});

var hideAlbums = function() {
    if (!$('#albums-container').hasClass('d-none')) {
         $('#albums-container').addClass('d-none');
    }
    if (!$('#albums-header').hasClass('d-none')) {
         $('#albums-header').addClass('d-none');
    }
    //$("#albums-container").collapse('hide');
};

var showAlbumDetails = function() {
    $('#album-details-container').collapse('show');
};

var hideAlbumDetails = function() {
    $('#album-details-container').collapse('hide');
};

var hideSearchClear = function() {
    if (!$('#search-clear').hasClass('d-none')) {
         $('#search-clear').addClass('d-none');
    }
};

var showSearchClear = function() {
    if ($('#search-clear').hasClass('d-none')) {
        $('#search-clear').removeClass('d-none');
    }
};

// let this snippet run before your hashchange event binding code
if(!window.HashChangeEvent)(function(){
    var lastURL=document.URL;
    window.addEventListener("hashchange",function(event){
        Object.defineProperty(event,"oldURL",{enumerable:true,configurable:true,value:lastURL});
        Object.defineProperty(event,"newURL",{enumerable:true,configurable:true,value:document.URL});
        lastURL=document.URL;
    });
}());

if ("onhashchange" in window) {
    //debugPrint("The browser supports the hashchange event!");
}

var locationHashChanged = function() {
    //debugPrint("location.hash: ", location.hash);

    if (location.hash) {
        if (location.hash.indexOf("artist", 0) > 0) {
            var artist_id;
            var spl = location.hash.split("#artist-id=");
            if (spl.length > 0) {
                artist_id = spl[1];
                console.log("artist in hash: " + artist_id);
                hideAlbumDetails();
                showAlbums();
                albumsByArtistIDGet(artist_id);
            }
        } else if (location.hash.indexOf("album", 0) > 0) {
            var album_id;
            var spl = location.hash.split("#album-id=");
            if (spl.length > 0) {
                album_id = spl[1];
                //debugPrint("album in hash: " + album_id);
                showAlbumDetails();
                tracksByAlbumGet(album_id);
            }
        } else {
            hideAlbumDetails();
            hideAlbums();
            //showArtists();
        }
    } else {
        //debugPrint("no hash");
        hideAlbumDetails();
        hideAlbums();
        //showArtists();
    }
};

window.onhashchange = locationHashChanged;

$(document).ready(function() {
    // search_click_disabled prevents the search button from being triggered
    // multiple times in a half second
    var search_click_disabled = false;
    $('#search-button').on('click', function() {
        if (search_click_disabled) {
            return;
        }
        search_click_disabled = true;
        setTimeout(function(){search_click_disabled = false;}, 500);
        artistSearch();
    });
    $('#search-clear').on('click', function() {
        $('#search-input').val('');
        $(this).blur();
        hideSearchClear();
    });

    // Initialize the autocomplete search suggestions
    autocomplete('#search-input', { hint: true }, [{
        source: function(q, cb) {
            // There is a setting for minimum input length.
            // I saw it, then I couldn't find it again.
            if (q && (q.length > 0)) {
                showSearchClear();
                artistSuggestionsGet(q, cb);
            } else {
                hideSearchClear();
                cb([]);
            }
        },
        displayKey: 'name',
        templates: {
            suggestion: function(suggestion) {
                return suggestion.name;
            }
        }
    }]).on('keyup keydown change autocomplete:selected', function(event, suggestion, dataset) {

        if (event.type === 'autocomplete:selected') {
            $('#search-button').trigger("click");
            
        // 13 is enter
        } else if ((event.type === 'keydown') && (event.which === 13)) {
            $('#search-button').trigger("click");
            $('#search-input').blur();
        }

        if ($('#search-input').val().length > 0) {
            showSearchClear();
        } else {
            hideSearchClear();
        }
    });

    $('#artists-close').on('click', function() {
        $('#artists-container').empty();
        hideArtists();
    });

    $('#albums-close').on('click', function() {
        $('#albums-container').empty();
        hideAlbums();
    });

    $('#album-details-close').on('click', function() {
        hideAlbumDetails();
    });

    checkLogin();
});
