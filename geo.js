// global jQuery, Microsoft

(function($, Microsoft) {
    'use strict';
    
    var locationOptions = {
        enableHighAccuracy: false,
        maximumAge: 10 * 60 * 1000
    };
    
    var MAPS_KEY = 'AmhiwJANHbWLh1L6FY1cG2A8WBcdatwp46HyOYP0xlgOw1cos0o4xuVHbJgkFs9P';
    var map = null;
    
    function onLocationError(error) {
        // now what????
    }
    
    function searchModuleLoaded() {
        
        // function search() {
        //     return searchManager.search({
        //         what: $('#cuisine option:selected').get(0).value + ' restaurant',
        //         where: $('input[name="zipCode"]').val(),
        //         callback: function(searchResponse) {
        //             console.log(JSON.stringify(searchResponse.searchResults))
        //             for (var key in searchResponse.searchResults) {
        //                 console.log(searchResponse.searchResults[key])
        //             }
        //             map.setView({ bounds: searchResponse.searchRegion.mapBounds.locationRect, zoom: 14 });
        //         }
        //     });
        // }
        
        // $('select').on('change', search);
                
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(onLocationSuccess,
                onLocationError,
                locationOptions);
        }
        $(document).on('addin.search', centerMapOnQuery);
    }
    
    function onLocationSuccess(position) {
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;
        var searchManager = new Microsoft.Maps.Search.SearchManager(map);
        var location = new Microsoft.Maps.Location(lat, lng);
        searchManager.reverseGeocode({
            location: location,
            callback: function (result) {
                map.setView({ center: location, zoom: 14 });
                $(document).trigger('addin.located', [result.name, lat, lng]);
            }
        });
    }
    
    function centerMapOnQuery(e, query) {
        var searchManager = new Microsoft.Maps.Search.SearchManager(map);
        return searchManager.geocode({
            where: query.zip,
            callback: function (results) {
                if (results.results.length === 0) return;
                var location = results.results[0].location;
                var lat = location.latitude;
                var lng = location.longitude;
                var addr = results.parsedAddress.formattedAddress;
                map.setView({ center: location, zoom: 14 });
                $(document).trigger('addin.located', [addr, lat, lng]);
            }
        });
    }
    
    $(function() {
        map = new Microsoft.Maps.Map(document.getElementById('mapDiv'), {
            credentials: MAPS_KEY,
            zoom: 9
        });
        
        Microsoft.Maps.loadModule('Microsoft.Maps.Search', { callback: searchModuleLoaded });
    });
})(jQuery, Microsoft);