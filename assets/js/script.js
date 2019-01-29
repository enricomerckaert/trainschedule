/**
* Clientside Scripting - Project
* @author Enrico Merckaert <enrico.merckaert@student.odisee.be>
*
**/
;(function() {
	'use strict';

	// wait till DOM is loaded
	window.addEventListener('load', function() {

		//  Display realtime clock
		function currentTime() {
			var current = moment().format('HH:mm:ss');
			$("#currentTime").html(current);
			setTimeout(currentTime, 1000);
		}
		currentTime();

		//  Initiate date & timepicker
		$("#departureDate").datetimepicker({default: new Date(), format: 'd-m-y', timepicker: false});
		$("#departureTime").datetimepicker({format: 'H:i', datepicker: false, allowTimes:[
			"00:00","00:30","01:00","01:30","02:00","02:30","03:00","03:30","04:00","04:30","05:00","05:30","06:00","06:30","07:00","07:30","08:00","08:30"
			,"09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30"
			,"17:00","17:30","18:00","18:30","19:00","19:30","20:00","20:30","21:00","21:30","22:00","22:30","23:00","23:30"
		]});

		//  Set date & time to now
		$("#departureDate").val(moment().format("DD-MM-YY"));
		$("#departureTime").val(moment().format("HH:mm"));


		// Set trainstations in selectBox
		$.getJSON("https://api.irail.be/stations/?format=json&lang=nl", function(loadStations){
			for (var i = 0; i < loadStations.station.length; i++) {

				var datalist = $("<option>" + loadStations.station[i].name + "</option>");

				$("#trainstations").append(datalist);
			}
		});


		//  Handle "Zoek" button
		$("#submit").on("click", function (event) {
			event.preventDefault();

			//  Get values from input fields
			var origin = $("#origin").val().trim();
			var destination = $("#destination").val().trim();
			var departureTime = $("#departureTime").val().trim();
			var departureDate = $("#departureDate").val().trim();

			//  Set storage items
			localStorage.setItem("origin", origin);
			localStorage.setItem("destination", destination);
			localStorage.setItem('departureDate', departureDate);
			localStorage.setItem('departureTime', departureTime);

			//	Check if all values are filled in
			if (origin == "" || destination == "" ||
			departureTime == "" || departureDate == "") {

				alert("Please fill in all details");

			} else {

				$.getJSON("https://api.irail.be/connections/?from=" + origin + "&to=" + destination + "&date=" + departureDate.replace(/-/g,'') + "&time=" + departureTime.replace(':','') + "&format=json&lang=nl&typeOfTransport=trains", function(loadRoutes) {

					//  Reset schedule
					$("#train-table-rows").empty();

					//  Set value from localStorage when submitted
					$("#origin").val(localStorage.getItem("origin"));
					$("#destination").val(localStorage.getItem("destination"));
					$("#departureDate").val(localStorage.getItem("departureDate"));
					$("#departureTime").val(localStorage.getItem("departureTime"));

					// Make table structure
					for (var i = 0; i < loadRoutes.connection.length; i++) {

						var depTime = moment.unix(loadRoutes.connection[i].departure.time);
						var arrTime = moment.unix(loadRoutes.connection[i].arrival.time);
						var tripTime = moment.duration((loadRoutes.connection[i].duration)*1000).asMinutes();

						var newrow = $("<tr>");
						newrow.append($("<td>" + moment(depTime).format('HH:mm') + "</td>"));
						newrow.append($("<td>" + moment(arrTime).format('HH:mm') + "</td>"));

						newrow.append($("<td>" + loadRoutes.connection[i].departure.station + "</td>"));
						newrow.append($("<td class='text-center'>" + loadRoutes.connection[i].departure.platform + "</td>"));

						newrow.append($("<td class='text-center'>" + loadRoutes.connection[i].arrival.station + "</td>"));
						newrow.append($("<td class='text-center'>" + loadRoutes.connection[i].arrival.platform + "</td>"));

						newrow.append($("<td class='text-center'>" + tripTime + " min" + "</td>"));

						$("#train-table-rows").append(newrow);
					}
				});
			}
		});
	});
})();
