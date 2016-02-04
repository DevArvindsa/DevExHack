// This function is called when Office.js is ready to start your Add-in
Office.initialize = function (reason) { 
	$(document).ready(function () {
		//displayItemDetails();
	});
}; 

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


function getListOfRestaurants() {
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
    //return false;//suppress natural form submission
}


function displayData(data) {
    restaurantData = data;
    len = data.businesses.length;
    console.log("Results count = " + len);
    var businessItem = "";
    if (len > 0) {
        for (var i = 0; i < len; i++) {
            console.log("loop " + i);
            if (1 == 1) { //TODO check business name exists in JSON and anything else which is mandatory
                businessItem += "<tr>";
                businessItem += "<td>" + data.businesses[i].image_url + "</td>";
                businessItem += "<td>" + data.businesses[i].name + "</td>";
                businessItem += "<td>" + data.businesses[i].rating + "</td>";
                businessItem += "<td>" + data.businesses[i].display_phone + "</td>";
                businessItem += "<td>" + data.businesses[i].snippet_text + "</td>";
                businessItem += "</tr>";
                //businessItem += "<tr><td>" + data.restaurants[i].name + "</td><td>" + data.restaurants[0].rating + "</td><td>" + data.businesses[0].url + "</td></tr>";
            }
        }
        if (businessItem != "") {
            document.getElementById("resultTable").innerHTML = ""; //cleanup table first
            $("#resultTable").append(businessItem).removeClass("hidden");
        }
    }

    
}

function addItemToOutlook(selectedRestaurant)
{
    htmlTxt = "<h1>You are invited for Team Lunch</h1>"
    htmlTxt += "&nbsp";
    htmlTxt += "Restaurant " + selectedRestaurant.name;
    htmlTxt += "&nbsp";
    Office.context.mailbox.item.body.setSelectedDataAsync(htmlTxt,
      function (asyncResult) {
          if (asyncResult.status == "failed") {
              showMessage("Action failed with error: " + asyncResult.error.message);
          } else {
              showMessage("You successfully wrote in the email body.");
          }
      }
    );

}

function showMessage(msg)
{
    console.log(msg)
}