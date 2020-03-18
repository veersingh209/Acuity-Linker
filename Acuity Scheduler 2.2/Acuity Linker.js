/*
Add a button to go to a specified Acuity link
*/
var count = 0;
document.getElementById("gsft_main").addEventListener("load", myMain, false);

function getSNID(doc){
	if(getIncidentNumber(doc).charAt(1) == "I"){
		return doc.getElementById("sys_original.sc_req_item.request.requested_for")["value"];
	}
	return doc.getElementById("sys_original.incident.caller_id")["value"];
}

function getFullName(doc){
	if(getIncidentNumber(doc).charAt(1) == "I"){
		return  doc.getElementById("sys_display.original.sc_req_item.request.requested_for")["value"];
	}
	return doc.getElementById("sys_display.incident.caller_id")["value"];
}

function getPhoneNumber(doc){
    if (doc.getElementById("incident.u_alternate_phone_number")["value"] == ""){
        return "No Number Provided";
    }
    else{
        return doc.getElementById("incident.u_alternate_phone_number")["value"];
    }
}

function getURL(doc){
	return doc.URL;
}

function getLocation(doc){
	return doc.getElementById("sys_display.incident.location")["value"];
}

function getIncidentNumber(doc){
	return doc.title.split(" ")[0];
}

function getFirstName(FN){
	return FN.split(" ")[0];
}

function getLastName(FN){
	var fularr = FN.split(" ");
	return fularr[fularr.length - 1];
}


function getDescription(doc){
    return doc.getElementById("incident.short_description")["value"];
}

function getRoomNumber(doc){
    return doc.getElementById("incident.u_room")["value"];
}

function myMain (evt) {
	
	if(document.title.includes("INC") || document.title.includes("RITM")){//TODO: this
	AcuityLinker();
	}
	
}

function ajaxRequest(){
 var activexmodes=["Msxml2.XMLHTTP", "Microsoft.XMLHTTP"] //activeX versions to check for in IE
 if (window.ActiveXObject){ //Test for support for ActiveXObject in IE first (as XMLHttpRequest in IE7 is broken)
  for (var i=0; i<activexmodes.length; i++){
   try{
    return new ActiveXObject(activexmodes[i])
   }
   catch(e){
    //suppress error
   }
  }
 }
 else if (window.XMLHttpRequest) // if Mozilla, Safari etc
  return new XMLHttpRequest()
 else
  return false
}

function authenticateSN(userinfo){
	var snrequest=new ajaxRequest()
	snrequest.onreadystatechange=function(){
	if (snrequest.readyState==4){
		if (snrequest.status==200 || window.location.href.indexOf("http")==-1){
			var ServiceNowInfo = snrequest.responseText;
			userinfo.email=JSON.parse(ServiceNowInfo)["result"]["email"];
			userinfo.phone=JSON.parse(ServiceNowInfo)["result"]["phone"];
            count = 99;
	}
	else{
	alert("An error has occured making the request, please try again.")
	}
	}
	}
	snrequest.open("GET", "https://ucmerced.service-now.com/api/now/table/sys_user/" +getSNID(oc), true)//,"sthd","HDspring$16")
	snrequest.setRequestHeader('Accept','application/json');
	snrequest.send()

}

function AcuityLinker(){
	
	oc=document.getElementById("gsft_main").contentDocument;

	var button = oc.createElement("button");
	button.innerHTML = "Acuity💩";
	var body = oc.getElementsByClassName("navbar-right")[0];
	body.appendChild(button);

	function user(){ //Object to contain user parameters
        this.fn="";
        this.ln="";
        this.phone="";
        this.email="";
        this.description="";
        this.roomNumber="";
	
	}

	function getFromSN(callback, ui) {
		//Applies a delay before going to Acuity
        
		authenticateSN(ui);
		pullFromSN(ui);
		setTimeout(function() {
			if(typeof callback == 'function')
				callback(ui);
		}, 2000);
	};

	button.addEventListener ("click", function() {

		var userinfo = new user();

		getFromSN(goToAcuityScheduling, userinfo);

	});

	function goToAcuityScheduling(userinfo){
        if (count == 99){
		window.open("https://itsupport.acuityscheduling.com/schedule.php?appointmentType=category:Desktop+Support"+"&first_name="+userinfo.fn+"&last_name="+userinfo.ln+"&phone="+userinfo.phone+"&email="+userinfo.email+"&field:2071440="+userinfo.loc+"&phone="+userinfo.pn+"&field:1805812="+getURL(oc)+"&field:3185401="+userinfo.rn+"&field:2248833="+userinfo.des+"&field:3185260="+userinfo.des,"");
        }
	}

	function pullFromSN(userinfo){
	
        userinfo.fn = getFirstName(getFullName(oc));
        userinfo.ln = getLastName(getFullName(oc));
        userinfo.loc = getLocation(oc);
        userinfo.pn = getPhoneNumber(oc);
        userinfo.des = getDescription(oc);
        userinfo.rn = getRoomNumber(oc);
	}


}
