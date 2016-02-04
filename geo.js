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
        
    }
    
    function searchModuleLoaded(coords) {
        var searchManager = new Microsoft.Maps.Search.SearchManager(map);
        var location = new Microsoft.Maps.Location(coords.latitude, coords.longitude);
        
        function search() {
            return searchManager.search({
                what: $('#cuisine option:selected').get(0).value + ' restaurant',
                where: $('input[name="zipcode"]').val(),
                callback: function(searchResponse) {
                    console.log(searchResponse)
                    console.log(JSON.stringify(searchResponse.searchResults))
                    for (var key in searchResponse.searchResults) {
                        console.log(searchResponse.searchResults[key])
                    }
                    map.setView({ bounds: searchResponse.searchRegion.mapBounds.locationRect, zoom: 14 });
                }
            });
        }
        
        $('select').on('change', search);
        
        return searchManager.reverseGeocode({
            location: location,
            callback: function (result) {
                console.log(result.name)
                map.setView({ center: location, zoom: 14 });
                $('input[name="zipcode"]').val(result.name);
            }
        });
    }
    
    function onLocationSuccess(position) {
        console.log(position.coords.latitude, position.coords.longitude);
        map = new Microsoft.Maps.Map(document.getElementById("mapDiv"), {credentials: MAPS_KEY,
            center: new Microsoft.Maps.Location(position.coords.latitude, position.coords.longitude), zoom: 9 });

         Microsoft.Maps.loadModule('Microsoft.Maps.Search', { callback: searchModuleLoaded.bind(this, position.coords) });
        
    }
    
    $(function() {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(onLocationSuccess,
                onLocationError,
                locationOptions);
                
        }
    });
})(jQuery, Microsoft);