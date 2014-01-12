/**
 /* 
 * 
 * TODO:
 * 
 * download google image to device
 * upload form + image to server
 * upload google+ friend list and user info to server as well
 * save user info and picture on device get encrypted password from server and save that
 * 
 * add text - sign up with google+ recive +10 points (can start story and comment)
 * 
 * auto login screen after signup (using encrypted password)
 * forget me 
 * manual login
 * update profile (picture, name, email, password, location, about text)
 * 
 * list of stories with stats like page count, contributers images, genre, title, beginning of first chapter, date added, last added date, etc.
 * click to read story with all pages, each page starts with contributers image name etc.
 * 
 * create new story (length dropdown min-max words for each chapter 50-100, 150-250, 500-1000, genre selection, title)
 * count words while writing dont let it post bellow or above target range show words left to target, and words left to max target after target has been reached
 * post new story to timeline
 * 
 * favorite stories
 * follow users
 * 
 * look at user profiles (badges, name, picture, location, about text), stories started, stories contributed to, expert from all chapters ,go to story link on all
 *  
 * local cache all data viewed
 * 
 */
var xToken,xID;

var pictureSource;   // picture source
var destinationType; // sets the format of returned value
var xImageData;  
var SignUpGoogle = false;

var googleapi = {
    authorize: function(options) {
        var deferred = $.Deferred();

        //Build the OAuth consent page URL
        var authUrl = 'https://accounts.google.com/o/oauth2/auth?' + $.param({
            client_id: options.client_id,
            redirect_uri: options.redirect_uri,
            response_type: 'code',
            scope: options.scope
        });

        //Open the OAuth consent page in the InAppBrowser
        var authWindow = window.open(authUrl, '_blank', 'location=yes,toolbar=yes');

        //The recommendation is to use the redirect_uri "urn:ietf:wg:oauth:2.0:oob"
        //which sets the authorization code in the browser's title. However, we can't
        //access the title of the InAppBrowser.
        //
        //Instead, we pass a bogus redirect_uri of "http://localhost", which means the
        //authorization code will get set in the url. We can access the url in the
        //loadstart and loadstop events. So if we bind the loadstart event, we can
        //find the authorization code and close the InAppBrowser after the user
        //has granted us access to their data.
        $(authWindow).on('loadstart', function(e) {
            var url = e.originalEvent.url;
            var code = /\?code=(.+)$/.exec(url);
            var error = /\?error=(.+)$/.exec(url);

            if (code || error) {
                //Always close the browser when match is found
                authWindow.close();
            }

            if (code) {
                //Exchange the authorization code for an access token
                $.post('https://accounts.google.com/o/oauth2/token', {
                    code: code[1],
                    client_id: options.client_id,
                    client_secret: options.client_secret,
                    redirect_uri: options.redirect_uri,
                    grant_type: 'authorization_code'
                }).done(function(data) {
                    deferred.resolve(data);
                }).fail(function(response) {
                    deferred.reject(response.responseJSON);
                });
            } else if (error) {
                //The user denied access to the app
                deferred.reject({
                    error: error[1]
                });
            }
        });

        return deferred.promise();
    }
};

function GetFriends()
{
	console.log("https://www.googleapis.com/plus/v1/people/"+ xID + "/people/visible?alt=json&access_token="+xToken);
 	
 	$.ajax({  
         type: "GET",   
         url: "https://www.googleapis.com/plus/v1/people/"+ xID + "/people/visible?alt=json&access_token="+xToken,  
         dataType: "json",   
         success: function ( data3, statusCode, xhr ) {
         	console.log(JSON.stringify( data3));
         	
         	for (var key in data3["items"]) {
         		console.log(key+" "+JSON.stringify(  data3["items"][key] ));
         		$("#results").append( data3["items"][key]["id"] + "<br>" + data3["items"][key]["displayName"] + "<br><img src=\"" + data3["items"][key]["image"]["url"] + "\"><hr>"  )
       		}         	
         },  
         error: function ( xhr, errorType, exception ) {   
             var errorMessage = exception || xhr.statusText;   
             console.log( "Error: " + errorMessage );  
         }  
     });                  	
}

function awin(r) {
	$("#progressx").css('width', '100%');
	$("#progressx").html('100% - Picture Uploaded!');
//console.log("Code = " + r.responseCode);
//console.log("Response = " + r.response);
//console.log("Sent = " + r.bytesSent);
}

function afail(error) {
	alert("An error has occurred: Code = " + error.code);
//console.log("upload error source " + error.source);
//console.log("upload error target " + error.target);
}	

function uploadPhoto()
{
//		console.log( "file name:" + xImageData.substr(xImageData.lastIndexOf('/') + 1) );
	options = new FileUploadOptions();
	options.fileKey = "file";
	options.fileName = xImageData.substr(xImageData.lastIndexOf('/') + 1);
	options.mimeType = "image/jpeg";
	options.headers = { Connection: "close" };

	var params = new Object();	
	params.value1 = $("#tagsetc").val();
	params.value2 = "param";
	options.params = params;		

	ft = new FileTransfer();
	ft.onprogress = function(progressEvent) {
		var perc;

		if (progressEvent.lengthComputable) {
			perc = Math.floor(progressEvent.loaded / progressEvent.total * 100);

			$("#progressx").css('width', perc+'%');
			$("#progressx").html(perc+'%');
		}
	};
	ft.upload(xImageData, "http://elodika.com/Android/savephoto.php", awin, afail, options);
}


// Called when a photo is successfully retrieved
function onPhotoDataSuccess(imageData) {
  // console.log(imageData);
  xImageData = imageData;
  $("#smallImage").attr("src", imageData);
  $("#clicktext").html("");
}

function onFail(message) {
	alert('Failed because: ' + message);
} 
function capturePhoto() {
	if (!SignUpGoogle)
	{
		navigator.camera.getPicture(onPhotoDataSuccess, onFail, { quality: 50, destinationType: destinationType.FILE_URI });	  
	}
}

function GooglePlusSignUp(data2)
{
	$("body").removeClass("loading"); 
	
	$("#RealName").val(data2["displayName"]);
	$("#EMailx").val(data2["emails"][0]["value"]);

	//$("#RealName").prop("readonly",true);

	SignUpGoogle = true;
	$("#EMailx").prop("readonly",true);

	tempPic = data2["image"]["url"] + "";
	tempPic = tempPic.replace("?sz=50","");

	$("#smallImage").attr("src", tempPic);
	$("#clicktext").html("");
	$("#use-googleplus").hide();

	$("#passwordx").focus();

	console.log(JSON.stringify( data2));
	xID = data2["id"];
}

function validEmail(v) {
    var r = new RegExp("[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?");
    return (v.match(r) == null) ? false : true;
}

function FinishSignUp()
{
	if (!($("#RealName").val().length > 5)) { alert("Please enter your name. It must be at least 6 characters."); }  else
	if (!validEmail($("#EMailx").val())) { alert("Please enter your email."); } else
	if (!($("#passwordx").val().length > 6)) { alert("Please enter your password. Password should be no less than 7 characters long."); } else
		
	{
		//submit data
		$("body").addClass("loading"); 
		
	}
	
	
}

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
		app.receivedEvent('deviceready');
		
		pictureSource=navigator.camera.PictureSourceType;
		destinationType=navigator.camera.DestinationType; 		

		xmultipler = 2;

		if ( $(window).width() < $(window).height() ) { var LowerValue = $(window).width(); } else {LowerValue = $(window).height(); }
      var DefFontSize = LowerValue / 30;

		$('.form-2').css('width', (($(window).width()/xmultipler)  * 0.90)+"px");
		$('body').css('zoom', xmultipler);
		
/*
		$('.container > header h1').css('font-size', (30 * xmultipler )+"px");
		$('.container > header h2').css('font-size', (14 * xmultipler )+"px");
		$('.codrops-top').css('font-size', (11 * xmultipler )+"px");
		$('.form-2 h1').css('font-size', (15 * xmultipler )+"px");
		$('.form-2 label').css('font-size', (11 * xmultipler )+"px");
		$('.form-2 input[type=text], .form-2 input[type=password]').css('font-size', (13 * xmultipler )+"px");
		$('.form-2 input[type=submit], .form-2 .log-twitter').css('font-size', (14 * xmultipler )+"px");
*/		
		
        
        $("#results").append("<br>screen:"+$(window).width()+"x"+$(window).height()+" font-size:"+DefFontSize+"px" );
//        $("body").css("font-size", DefFontSize+"px");
        
        $("#getfriends").on('click',function() { GetFriends(); } );
		  
		  $("#SignUpDone").on('click',function() { 
			  FinishSignUp();
		  } );
        
        
        //https://developers.google.com/oauthplayground/
        $("#use-googleplus").on('click', function() {
			  
			   $("body").addClass("loading");
            googleapi.authorize({
                client_id: '7991818212118a5q73uj6jbom0le7e3rud85a41m.apps.googleusercontent.com',
                client_secret: 'n1Ihd5-k',
                redirect_uri: 'http://localhost',
                scope: 'https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/plus.me https://www.googleapis.com/auth/userinfo.email' // https://www.googleapis.com/auth/userinfo.profile
            }).done(function(data) {
                $("#results").html('Access Token: ' + data.access_token);
                xToken = data.access_token;
                $.get( "https://www.googleapis.com/plus/v1/people/me?alt=json&access_token="+data.access_token, 
                    	function( data2 ) {
								GooglePlusSignUp(data2);
                    	});
            }).fail(function(data) {
					$("body").removeClass("loading"); 
               $loginStatus.html(data.error);
            });
				return false;
        });
        
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
    	$("#results").append("Received Event: " + id );
        console.log('Received Event: ' + id);
    }
};
