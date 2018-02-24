
var map;

var locations = [
    { title: 'Salsa People Dance School', placeID: "ChIJZ1neR8wLkEcRfGP1-y8wVBU", location: { lat: 47.395939, lng: 8.491489 }, id: 0 },
    { title: 'Eidgenössische Technische Hochschule Zürich', placeID: "ChIJ94xuUaagmkcRB3Y3tij0YUs", location: { lat: 47.376313, lng: 8.54767 }, id: 1 },
    { title: 'Flussbad Oberer Letten', placeID: "ChIJF70BXg0KkEcRf0RYUImlHws", location: { lat: 47.38566, lng: 8.53431 }, id: 2 },
    { title: 'Zürich Langstrasse', placeID: "ChIJFViJ6BAKkEcR_HK1Ocp6uFk", location: { lat: 47.378773, lng: 8.527336 }, id: 3 },
    { title: 'Restaurant Linde Oberstrass', placeID: "ChIJ7X4FVqCgmkcRqCPsrwv6_h4", location: { lat: 47.383437, lng: 8.547982 }, id: 4 },
];




// represent a single location
var Place = function (data) {
    this.title = ko.observable(data.title),
        this.location = ko.observable(data.location),
        this.id = ko.observable(data.id),
        this.placeID = ko.observable(data.placeID),
        this.focus = ko.observable(false)
};


var ViewModel = function () {
    var self = this;

    // KO variable to store details of a place
    this.placeDetails = ko.observable();

    // KO variable to store a Wikipedia extract related to the place
    this.wikiExtract = ko.observable();

    // KO variable to store the text input of the input field
    this.filter = ko.observable("");

    // KO array representing all locations
    this.locations = ko.observableArray(locations.map(function (data) {
        return new Place(data);
    }));

    // KO variable representing the currently selected place
    this.current = ko.observable(new Place({ title: "", placeID: "", location: { lat: 0, lng: 0 }, id: -1 }));


    // KO variable to track whether the List View is hidden or shown on mobile screens
    this.mobileOptions = ko.observable(false)
    // Always show List View on screens larger than 768px
    if (window.innerWidth > 768) {
        self.mobileOptions(true);
    }
    // Show/hide options on window resize
    window.onresize = function () {
        if (window.innerWidth > 768) {
            self.mobileOptions(true);
        } else {
            self.mobileOptions(false);
        }
    }

    // GOOGLE MAPS
    // Create a new blank array for all the listing markers.
    var markers = [];

    var largeInfowindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();

    // initMap is used to initialize the map
    function initMap() {
        // Create a styles array to use with the map.
        var styles = [
            {
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#46bcec"
                    },
                    {
                        "lightness": 17
                    }
                ]
            },
            {
                "featureType": "landscape",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#f5f5f5"
                    },
                    {
                        "lightness": 20
                    }
                ]
            },
            {
                "featureType": "road.highway",
                "elementType": "geometry.fill",
                "stylers": [
                    {
                        "color": "#ffffff"
                    },
                    {
                        "lightness": 17
                    }
                ]
            },
            {
                "featureType": "road.highway",
                "elementType": "geometry.stroke",
                "stylers": [
                    {
                        "color": "#ffffff"
                    },
                    {
                        "lightness": 29
                    },
                    {
                        "weight": 0.2
                    }
                ]
            },
            {
                "featureType": "road.arterial",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#ffffff"
                    },
                    {
                        "lightness": 18
                    }
                ]
            },
            {
                "featureType": "road.local",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#ffffff"
                    },
                    {
                        "lightness": 16
                    }
                ]
            },
            {
                "featureType": "poi",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#f5f5f5"
                    },
                    {
                        "lightness": 21
                    }
                ]
            },
            {
                "featureType": "poi.park",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#dedede"
                    },
                    {
                        "lightness": 21
                    }
                ]
            },
            {
                "elementType": "labels.text.stroke",
                "stylers": [
                    {
                        "visibility": "on"
                    },
                    {
                        "color": "#ffffff"
                    },
                    {
                        "lightness": 16
                    }
                ]
            },
            {
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "saturation": 36
                    },
                    {
                        "color": "#333333"
                    },
                    {
                        "lightness": 40
                    }
                ]
            },
            {
                "elementType": "labels.icon",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "transit",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#f2f2f2"
                    },
                    {
                        "lightness": 19
                    }
                ]
            },
            {
                "featureType": "administrative",
                "elementType": "geometry.fill",
                "stylers": [
                    {
                        "color": "#fefefe"
                    },
                    {
                        "lightness": 20
                    }
                ]
            },
            {
                "featureType": "administrative",
                "elementType": "geometry.stroke",
                "stylers": [
                    {
                        "color": "#fefefe"
                    },
                    {
                        "lightness": 17
                    },
                    {
                        "weight": 1.2
                    }
                ]
            }
        ]
        // Constructor creates a new map - only center and zoom are required.
        map = new google.maps.Map(document.getElementById('map'), {
            center: { lat: 47.37174, lng: 8.54226 },
            zoom: 15,
            styles: styles,
        });

        // The following group uses the location array to create an array of markers on initialize.
        for (var i = 0; i < self.locations().length; i++) {
            // Get the position from the location array.
            var position = self.locations()[i].location();
            var title = self.locations()[i].title();
            var id = self.locations()[i].id();
            var placeID = self.locations()[i].placeID();

            // Create a marker per location, and put into markers array.
            var marker = new google.maps.Marker({
                map: map,
                position: position,
                title: title,
                animation: google.maps.Animation.DROP,
                id: id,
                placeID: placeID
            });

            // Push the marker to our array of markers.
            markers.push(marker);
            // Create an onclick event to open the large infowindow at each marker.
            marker.addListener('click', function () {
                toggleInfoCard(this, largeInfowindow);
            });

            // Create an onclick event to set focus to false when the infowindow is closed
            largeInfowindow.addListener('closeclick', function () {
                self.current().focus(false);
            });

            // Extend the boundaries of the map for each marker
            bounds.extend(markers[i].position);
        }
        // Fit the map the 
        map.fitBounds(bounds);
    }

    initMap();

    // Return array of locations where the location title contains the filter string provided by the user
    // Only show the filtered locations on the map
    this.filteredLocations = ko.computed(function () {
        return self.locations().filter(function (place) {
            var index = place.id();
            if (place.title().toUpperCase().search(self.filter().toUpperCase()) > -1) {
                markers[index].setMap(map);
                bounds.extend(markers[index].position);
                map.fitBounds(bounds);
                if (place.focus()){
                    markers[index].setAnimation(google.maps.Animation.BOUNCE);
                }
                return true
            } else {
                markers[index].setMap(null);
                return false
            }
        });
    });

    // This function is called when the user clicks the button to show/hide the List View (only on mobile)
    // It changes the value of the KO variable "mobileOptions"
    this.toggleOptions = function () {
        self.mobileOptions(!self.mobileOptions());
    }

    // This function populates the infowindow when the marker is clicked. We'll only allow
    // one infowindow which will open at the marker that is clicked, and populate based
    // on that markers position.
    function populateInfoWindow(marker, infowindow) {
        infowindow.setContent('');
        infowindow.marker = marker;
        marker.setAnimation(google.maps.Animation.BOUNCE);
        var streetViewService = new google.maps.StreetViewService();
        var radius = 50;
        // In case the status is OK, which means the pano was found, compute the
        // position of the streetview image, then calculate the heading, then get a
        // panorama from that and set the options
        function getStreetView(data, status) {
            if (status == google.maps.StreetViewStatus.OK) {
                var nearStreetViewLocation = data.location.latLng;
                var heading = google.maps.geometry.spherical.computeHeading(
                    nearStreetViewLocation, marker.position);
                infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
                var panoramaOptions = {
                    position: nearStreetViewLocation,
                    pov: {
                        heading: heading,
                        pitch: 30
                    }
                };
                var panorama = new google.maps.StreetViewPanorama(
                    document.getElementById('pano'), panoramaOptions);
            } else {
                infowindow.setContent('<div>' + marker.title + '</div>' +
                    '<div>No Street View Found</div>');
            }
        }
        // Use streetview service to get the closest streetview image within
        // 50 meters of the markers position
        streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
        infowindow.open(map, marker);

        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick', function () {
            infowindow.marker = null;
            marker.setAnimation(null);
        });
    }

    // When a marker is clicked the following should happen
    // - Open infowindow
    // - Animate marker
    // - Display place details associated with the marker in List View
    function toggleInfoCard(marker, infowindow) {
        // Get place details for the selected marker
        getPlaceDetails(marker);
        // Remember the ID (note: ID equals the index of a marker in the markers array) of the marker that was previously selected
        var index_old = self.current().id();
        // Check to make sure the infowindow is not already opened on this marker
        if (infowindow.marker != marker) {
            // If another marker/place was selected previously...
            if (markers[index_old] != marker && index_old != -1) {
                // turn off animation for the previously selected marker
                markers[index_old].setAnimation(null);
                // set "focus" of the previously selected place to "false"
                self.locations()[index_old].focus(false);
            }
            marker.setAnimation(null);
            populateInfoWindow(marker, infowindow);

            var index = marker.id;
            // Update the KO variable "current" to point to the clicked place
            self.current(self.locations()[index]);
            // Change "focus" of the clicked place to "true"
            self.current().focus(true);
        }
    }

    // When a place in the List View clicked the following should happen
    // - Open infowindow
    // - Animate marker
    // - Display place details associated with the marker in List View
    this.toggleInfo = function (clickedPlace) {
        var prevmarker = markers[self.current().id()];
        var newmarker = markers[clickedPlace.id()];
        getPlaceDetails(newmarker);
        var index = newmarker.id
        if (clickedPlace != self.current()) {
            try {
                prevmarker.setAnimation(null);
            } finally {
                self.current().focus(false);
                self.current(clickedPlace);
                self.current().focus(true);
                newmarker.setAnimation(google.maps.Animation.BOUNCE);
                populateInfoWindow(newmarker, largeInfowindow);
            }
        } else if (self.current().focus() == false) {
            self.current().focus(true);
            populateInfoWindow(newmarker, largeInfowindow);
            newmarker.setAnimation(google.maps.Animation.BOUNCE);
        } else {
            self.current().focus(false);
            largeInfowindow.close();
            largeInfowindow.newmarker = null;
            newmarker.setAnimation(null);
        }
    }

    // Get place details for the selected place and store it in the KO variable "placeDetails"
    function getPlaceDetails(marker) {
        var service = new google.maps.places.PlacesService(map);
        service.getDetails({
            placeId: marker.placeID
        }, function (place, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                var placeDetails = {};
                if (place.name) {
                    placeDetails.name = place.name;
                } else { placeDetails.name = "No Name Information Available"; }
                if (place.formatted_address) {
                    placeDetails.address = place.formatted_address;
                } else { placeDetails.address = "No Address Information Available"; }
                if (place.opening_hours) {
                    if (place.opening_hours.open_now) {
                        placeDetails.open_now = "Currently Open"
                    } else {
                        placeDetails.open_now = "Currently Closed"
                    }
                } else { placeDetails.open_now = "No Opening Hours Information Available"; }
                if (place.website) {
                    placeDetails.website = '<a href="' + place.website + '">' + place.name + '<a>';
                } else { placeDetails.website = "No Website Information Available"; }
                if (place.photos) {
                    placeDetails.photo = '<img class="place-img" src="' + place.photos[0].getUrl(
                        { maxHeight: 300, maxWidth: 300 }) + '">';
                } else {
                    placeDetails.photo = "";
                }
                if (place.types.indexOf("restaurant") == -1 && place.types.indexOf("gym") == -1) {
                    getWikipediaSnippet(place.name);
                } else {
                    self.wikiExtract("");
                }
                self.placeDetails(placeDetails);
            } else {
                alert("Failed to load Google Place Details. Check the Console for details.")
                console.log(status);
            }
        }
        );

        // Request Wikipedia articles related to the selected place and store a snippet of the most relevant article it in the KO variable "wikiExtract"
        function getWikipediaSnippet(title) {
            $.ajax({
                url: 'https://de.wikipedia.org/w/api.php',
                data: {
                    action: 'query',
                    list: 'search',
                    srsearch: title,
                    format: 'json',
                    formatversion: 2
                },
                dataType: 'jsonp',
                success: function (x) {
                    var html;
                    if (x.query.search[0].snippet) {
                        html = '[...] ' + x.query.search[0].snippet + ' [...] <a target="_blank" href=https://de.wikipedia.org/?curid=' + x.query.search[0].pageid + '">Wikipedia</a>'
                        self.wikiExtract(html);
                    } else {
                        html = "";
                        self.wikiExtract(html);
                    }
                },
                error: function(requestObject, error, errorThrown) {
                    alert("Failed to load Wikipedia Snippet. Check the Console for details.")
                    console.log(requestObject);
                }
            });
        }
    }
}

function initApp() {
    ko.applyBindings(new ViewModel());
}