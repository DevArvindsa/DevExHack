// This function is called when Office.js is ready to start your Add-in
Office.initialize = function (reason) { 
	$(function () {
		//displayItemDetails();
	});
}; 

var rowTemplate;

$(function() {
    $('#search').click(getListOfRestaurants);
    $('#addItem').click(function () {
        $('#resultTable .ms-ListItem.is-unread').each(function(i, e) {
            var idx = parseInt($(e).data('index'), 10);
            addItemToOutlook(restaurantData.businesses[idx]);  
        });
    });
    rowTemplate = $('#row').html();
    Mustache.parse(rowTemplate);
})

var searchTerm = 'indian'; //read this from the document
var nearZip = '98052'; //read this from the document

var auth; //param for yelp settings
var message; //param for yelp settings
var parameterMap; //param for yelp settings

var restaurantData;

function setYelpParams() {

    auth = {
        consumerKey: "H4i7HNOS1rfwl6ORgsO9Jw",
        consumerSecret: "ljNz06TJrX525idSrNx_d_OaA8w",
        accessToken: "iYZxlWddn7ZCLLI7TIsr7W-LjPWFAuJJ",
        // This example is a proof of concept, for how to use the Yelp v2 API with javascript.
        // You wouldn't actually want to expose your access token secret like this in a real application.
        accessTokenSecret: "QrCeoVtf-a9TzVpiwB6opzZw6WI",
        serviceProvider: {
            signatureMethod: "HMAC-SHA1"
        }
    };

    var accessor = {
        consumerSecret: auth.consumerSecret,
        tokenSecret: auth.accessTokenSecret
    };

    var parameters = [];
    parameters.push(['term', searchTerm]);
    parameters.push(['location', nearZip]);
    parameters.push(['callback', 'cb']);
    parameters.push(['oauth_consumer_key', auth.consumerKey]);
    parameters.push(['oauth_consumer_secret', auth.consumerSecret]);
    parameters.push(['oauth_token', auth.accessToken]);
    parameters.push(['oauth_signature_method', 'HMAC-SHA1']);

     message = {
        'action': 'https://api.yelp.com/v2/search',
        'method': 'GET',
        'parameters': parameters
    };

    OAuth.setTimestampAndNonce(message);
    OAuth.SignatureMethod.sign(message, accessor);
    parameterMap = OAuth.getParameterMap(message.parameters);
    parameterMap.oauth_signature = OAuth.percentEncode(parameterMap.oauth_signature)
    //console.log(parameterMap);

}


function getListOfRestaurants(e) {
    restaurantData = "";
    nearZip = document.getElementById("zipCode").value;
    searchTerm = document.getElementById("cuisine").value;
    if ((nearZip == null) || (nearZip == ""))
    {
        alert("please enter zip code");
        return;
    }

    setYelpParams(); //set yelp search params
    $.ajax({
        'url': message.action,
        'data': parameterMap,
        'cache': true,
        'dataType': 'jsonp',
        'jsonpCallback': 'cb',
        'success': function (data, textStats, XMLHttpRequest) {
            displayData(data);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log('error: ' + textStatus + ': ' + errorThrown);
        }
    });
    $(window).trigger('addin.search', [{
        zip: nearZip,
        query: searchTerm
    }]);
    e.preventDefault();
    e.stopPropagation();
    //return false;//suppress natural form submission
}


$(window).on('addin.located', function (e, addr, lat, lng) {
    $('#zipCode').val(addr);
    console.log(addr, lat, lng); 
});

function stars() {
    var full = '<div class="ms-ListItem-action"><i class="ms-Icon ms-Icon--star"></i></div>';
    var half = '<div class="ms-ListItem-action"><i class="ms-Icon ms-Icon--starEmpty"></i></div>';
    return function (text, render) {
        var rating = render(text);
        var float = parseFloat(rating);
        var integer = parseInt(rating, 10);
        var result = '';
        for (var i = 0; i < integer; i++) {
            result += full;
        }
        if (float > integer) {
            result += half;
        }
        return result;
    }
}

function displayData(data) {
    restaurantData = data;
    len = data.businesses.length;
    $("#resultTable").html('');
    if (len > 0) {
        for (var i = 0; i < len; i++) {
            data.businesses[i].stars = stars;
            data.businesses[i].idx = i;
            var node = Mustache.render(rowTemplate, data.businesses[i]);
            $("#resultTable").append(node);
        }
        $('#resultTable li div *:not(a)').click(function(e) {
            $(e.target).closest('.ms-ListItem').toggleClass('is-unread');
            e.preventDefault();
            e.stopPropagation();
        });
    }

    
}

function addItemToOutlook(selectedRestaurant)
{
    setSubject(selectedRestaurant.name);
    setLocation(selectedRestaurant.location.display_address); //todo change to address
    var address="";
    var htmlTxt  = "";
    //prepare address
    for (i = 0; i < selectedRestaurant.location.display_address.length;i++)
    {
        address += address + selectedRestaurant.location.display_address[i] + " ";
    }

    htmlTxt = "<h2>You are invited for Team Lunch</h2>";
    htmlTxt += "<div><table>";
    htmlTxt += "<tr><td><h1>" + selectedRestaurant.name + "<h1></td>";
    htmlTxt += "<td><img src=\"" + selectedRestaurant.rating_img_url + "\"></td>";
    htmlTxt += "</tr>";
    //htmlTxt += "&nbsp&nbsp";
    htmlTxt += "<tr><td>";
    htmlTxt += "<img src=\"" + selectedRestaurant.image_url + "\">";
    htmlTxt += "</td><td>";
    htmlTxt += "Address : "+  address;
    htmlTxt += "&nbsp";
    htmlTxt += "Phone # : "+  selectedRestaurant.display_phone;
    htmlTxt += "</td></tr></table></div>";
    htmlTxt += "<h4>powered by 'Team Lunch' addins for outlook</h4>";

        
    Office.context.mailbox.item.body.setAsync(htmlTxt, { coercionType: Office.CoercionType.Html },
      function (asyncResult) {
          if (asyncResult.status == "failed") {
              showMessage("Action failed with error: " + asyncResult.error.message);
          } else {
              showMessage("You successfully wrote in the email body.");
          }
      }
    );
}

function setSubject(name) {
    Office.context.mailbox.item.subject.setAsync(
        "Team Lunch - " + name,
        { asyncContext: { var1: 1, var2: 2 } },
        function (asyncResult) {
            if (asyncResult.status == Office.AsyncResultStatus.Failed) {
                showMessage("Action failed with error: " + asyncResult.error.message);
            }
            else {
                showMessage("Successfully set the location");
                // Successfully set the location.
                // Do whatever appropriate for your scenario
                // using the arguments var1 and var2 as applicable.
            }
        });
}

function setLocation(address) {
    Office.context.mailbox.item.location.setAsync(
        address,
        { asyncContext: { var1: 1, var2: 2 } },
        function (asyncResult) {
            if (asyncResult.status == Office.AsyncResultStatus.Failed) {
                showMessage("Action failed with error: " + asyncResult.error.message);
            }
            else {
                showMessage("Successfully set the location");
                // Successfully set the location.
                // Do whatever appropriate for your scenario
                // using the arguments var1 and var2 as applicable.
            }
        });
}


function showMessage(msg)
{
    console.log(msg)
}