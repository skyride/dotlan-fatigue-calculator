var jumptable;				//Reference to the main jump table
var jumps = [];				//Ly distance of jumps
var fatiguefactor = 1;		//Modifier granted from ship
var prefatigues = [];		//Prefatigue value nodes
var postfatigues = [];		//Postfatigue value nodes
var reactivations = [];		//Reactivation value nodes


function df_readJumps() {
	jumptable = document.getElementsByClassName('tablelist table-tooltip')[0];

	//Read jump distances
	var count = Math.floor((jumptable.rows.length - 1) / 2);
	for(var i = 0; i < count; i++) {
		var jump = parseFloat(jumptable.rows[2 + (i * 2)].cells[2].getElementsByTagName('b')[0].childNodes[0].nodeValue.replace(' ly', ''));
		jumps.push(jump);
	}
	
	//Read ship type and get factor
	var ship = document.getElementsByClassName('tn')[0].rows[2].cells[1].childNodes[2].childNodes[0].nodeValue;
	fatiguefactor = ships[ship];
}


function df_buildTableAdditions() {
	var count = Math.floor((jumptable.rows.length - 1) / 2);
	for(var i = 0; i < count; i++) {
		//Create new row
		var row = jumptable.insertRow(((i + 1) * 2) + 1 + i);
		row.className = "tlr1";
		row.style.verticalAlign = "center";
		row.style.height = "50px";
		
		//Insert cells
		var prefatigue = row.insertCell(0);
		var postfatigue = row.insertCell(1);
		var reactivation  = row.insertCell(2);
		var t = row.insertCell(3);
		
		//Modify
		prefatigue.colSpan = 2;
		postfatigue.colSpan = 2;
		reactivation.colSpan = 2;
		
		//Content
			//Post fatigue
			postfatigue.appendChild(document.createTextNode("Fatigue After Jump: "));
			var pb = document.createElement('b');
			var p = document.createTextNode("0D 00:00:00");
			pb = postfatigue.appendChild(pb);
			p = pb.appendChild(p);
			postfatigues[i] = p;
			
			//Reactivation timer
			reactivation.appendChild(document.createTextNode("Reactivation Timer: "));
			var rb = document.createElement('b');
			var r = document.createTextNode("0D 00:00:00");
			rb.appendChild(r);
			reactivation.appendChild(rb);
			reactivations.push(r);
			
			//Pre Fatigue
			if(i == 0) {
				//Starting fatigue
				prefatigue.appendChild(document.createTextNode("Starting Fatigue: "));
				prefatigue.appendChild(document.createElement('br'));
				var s = "<input id=sd type=number min=0 max=30 value=0 class=tnbox>D <input id=sh type=number min=0 max=24 value=0 class=tnbox>:<input id=sm type=number min=0 max=59 value=0 class=tnbox>:<input id=ss type=number min=0 max=59 value=0 class=tnbox>";
				prefatigue.innerHTML += s;
			} else {
				//Wait time
				prefatigue.appendChild(document.createTextNode("Wait before Next Jump: "));
				var s = "<input id=sd type=number min=0 max=30 value=0 class=tnbox>D <input id=sh type=number min=0 max=24 value=0 class=tnbox>:<input id=sm type=number min=0 max=59 value=0 class=tnbox>:<input id=ss type=number min=0 max=59 value=0 class=tnbox>";
				prefatigue.appendChild(document.createElement('br'));
				prefatigue.innerHTML += s;
			}
			prefatigues.push(prefatigue);
	}
	
	//Add onchange events to prefatigues
	for(var i = 0; i < prefatigues.length; i++) {
		prefatigues[i].childNodes[2].onchange = df_doCalcsUpdate;
		prefatigues[i].childNodes[4].onchange = df_doCalcsUpdate;
		prefatigues[i].childNodes[6].onchange = df_doCalcsUpdate;
		prefatigues[i].childNodes[8].onchange = df_doCalcsUpdate;
	}
}


//Re references the global variables for client side updating
function df_rebuildRefs() {
	prefatigues = [];
	postfatigues = [];
	reactivations = [];
	var count = Math.floor((jumptable.rows.length - 1) / 3);
	for(var i = 0; i < count; i++) {
		var row = jumptable.rows[((i+1) * 3)];
		
		//Prefatigue
		prefatigues.push(row.cells[0]);
		
		//Postfatigue
		postfatigues.push(row.cells[1].childNodes[1].childNodes[0]);
		
		//Reactivations
		reactivations.push(row.cells[2].childNodes[1].childNodes[0]);
	}
}


//Performs the initial fatigue calculations
function df_doCalcsInit() {
	//Get starting fatigue
	var fatigue = df_getPrefatigueValue(0);
	var reactivation = 0;
	var total = 0;
	
	//Iterate through each jump
	for(var i = 0; i < jumps.length; i++) {
		//Calculate Reactivation and Fatigue
		reactivation = Math.max(1 + (jumps[i] * fatiguefactor), (fatigue * 0.1) / 60) * 60;
		fatigue = Math.floor(Math.min(Math.max(10 * (1 + (jumps[i] * fatiguefactor)), (fatigue / 60) * (1 + (jumps[i] * fatiguefactor))) * 60, 2592000));
		
		//Update UI
		postfatigues[i].nodeValue = df_formatTime(df_sToT(fatigue));
		var react = df_sToT(reactivation);
		reactivations[i].nodeValue = df_formatTime(react);
		
		//Update next wait before with reactivation timer
		df_setPrefatigueValue(i+1, react);
		fatigue -= reactivation;
	}
}


//Performs fatigue update calculations, same init but without writing changes to the wait boxes
function df_doCalcsUpdate() {
	//Get starting fatigue
	var fatigue = df_getPrefatigueValue(0);
	var reactivation = 0;
	var total = 0;
	
	//Iterate through each jump
	for(var i = 0; i < jumps.length; i++) {
		//Calculate Reactivation and Fatigue
		reactivation = Math.max(1 + (jumps[i] * fatiguefactor), (fatigue * 0.1) / 60) * 60;
		fatigue = Math.floor(Math.min(Math.max(10 * (1 + (jumps[i] * fatiguefactor)), (fatigue / 60) * (1 + (jumps[i] * fatiguefactor))) * 60, 2592000));
		
		//Update UI
		postfatigues[i].nodeValue = df_formatTime(df_sToT(fatigue));
		var react = df_sToT(reactivation);
		reactivations[i].nodeValue = df_formatTime(react);
		
		//Update fatigue with the wait before of the next jump
		if(i+1 != jumps.length) {
			fatigue -= df_getPrefatigueValue(i+1);
		}
	}
}


function df_formatTime(obj) {
	function format(muhint) {
		if(muhint < 10) {
			return "0" + Math.floor(muhint);
		} else {
			return "" + Math.floor(muhint);
		}
	}
	
	var s = obj.days + "D " + format(obj.hours) + ":" + format(obj.minutes) + ":" + format(obj.seconds);
	return s;
}


function df_getPrefatigueValue(i) {
	//Get starting fatigue
	var fatigue = prefatigues[i];
	
	var timer = {};
	
	timer.days = parseInt(fatigue.childNodes[2].value)
	timer.hours = parseInt(fatigue.childNodes[4].value)
	timer.minutes = parseInt(fatigue.childNodes[6].value)
	timer.seconds = parseInt(fatigue.childNodes[8].value);
	
	return df_tToS(timer);
}


function df_setPrefatigueValue(i, obj) {
	if(i < prefatigues.length) {
		var prefatigue = prefatigues[i];
		prefatigue.childNodes[2].value = Math.floor(obj.days);
		prefatigue.childNodes[4].value = Math.floor(obj.hours);
		prefatigue.childNodes[6].value = Math.floor(obj.minutes);
		prefatigue.childNodes[8].value = Math.floor(obj.seconds);
	}
}


//Convert seconds to a time object
function df_sToT(seconds) {
	var ret = {days: 0, hours: 0, minutes: 0, seconds: 0};
	ret.days = Math.floor(seconds / 86400);
	ret.hours = Math.floor((seconds % 86400) / 60 / 60);
	ret.minutes = Math.floor((seconds % 3600) / 60)
	ret.seconds = seconds % 60;
	return ret;
}


function df_sToM(seconds) {
	return seconds / 60;
}


function df_mToS(minutes) {
	return minutes * 60;
}


//Convert a time object to seconds
function df_tToS(obj) {
	var ret = (obj.days * 86400) + (obj.hours * 3600) + (obj.minutes * 60) + obj.seconds;
	return ret;
}