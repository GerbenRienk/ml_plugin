// library of functions to enable multi-language support for cosi 5


// three functions for cookie actions
function createCookie(name, value, days) {
	var expires;
	if (days) {
		var date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		expires = "; expires=" + date.toGMTString();
	} else {
		expires = "";
	}
	document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + expires + "; path=/";
}

function readCookie(name) {
	var nameEQ = encodeURIComponent(name) + "=";
	var ca = document.cookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) === ' ')
			c = c.substring(1, c.length);
		if (c.indexOf(nameEQ) === 0)
			return decodeURIComponent(c.substring(nameEQ.length, c.length));
	}
	return null;
}

function eraseCookie(name) {
	createCookie(name, "", -1);
}

// script to create the language selector
function showLanguageSelector(){
	var select_html = "";								// the composed html for the select
	var languages = ["en","pt","ru","nl"];
	select_html = "en/pt/ru/nl: <select id='language_selector'>";
	languages.forEach(function(language){
		select_html = select_html + "<option value='" + language + "'>" + language;
	})
	select_html = select_html + "</select>";
	document.write(select_html);
}

jQuery(document).ready(function($) { 
	var translations;			// the json object that holds our translations
	var item_name;
	var this_language;
	var this_tr;				// the tr we consider for applying the translations
	var dummy;
	var rit_original;			// a copy of the original right item text, because we must keep the div in and mayba more javascript
	var options_original;
	var start_snip;
	var end_snip;
	var div_start = "<div id=";
	var div_start_pos;
	var new_options;
	var this_select;			// to be used for iterating through the options
	
	var this_language = readCookie("this_language");
	// if we don't have a cookie yet, default to en
	if (!this_language){this_language = "en"}
	// read the translations from file
	$.ajax({
		type: "GET",
		url: "multi_language/items_crf1.json",
		dataType: "json",
		success: saveTranslations
	});

	function saveTranslations(json_data){
		// store the json-object for later use
		//console.log("in save translations");
		translations = json_data;
		updateLabels();
		// now set the language selector to match the cookie
		$('#language_selector').val(this_language);
		}

	function updateLabels(){
		// function to replace left item texts etc with the language of choice
		// loop through all divs of class ml_beacon
		$(".ml_beacon").each(function(){
			this_tr = $(this).parent().parent();
			item_name = $(this)[0].id;
			if (item_name){
				// left item text
				dummy = translations[item_name][this_language].lit;
				$(this_tr).children("td:nth-child(2)").html(dummy);
				// units
				dummy = translations[item_name][this_language].units;
				if (dummy.length > 0){
					dummy = '(' + dummy + ')';
					$(this_tr).children("td:nth-child(5)").html(dummy);
				}
				// right item text
				rit_original = $(this_tr).children("td:last-child").html();
				div_start_pos = rit_original.indexOf(div_start);
				dummy = translations[item_name][this_language].rit;
				dummy = dummy + rit_original.substring(div_start_pos, rit_original.length);
				$(this_tr).children("td:last-child").html(dummy);

				// for radio
				if (translations[item_name].type == 'radio'){
					end_snip = 0;
					new_options = translations[item_name][this_language].options;
					options_original = $(this_tr).children("td:nth-child(3)").html();
					for (var i = 0; i < new_options.length; i++) {
						start_snip = options_original.indexOf('type="radio"', end_snip);
						start_snip = options_original.indexOf('">', start_snip) + 2;
						end_snip = options_original.indexOf('<br>', start_snip);
						
						options_original = options_original.substring(0,start_snip) + new_options[i] + options_original.substring(end_snip);
						$(this_tr).children("td:nth-child(3)").html(options_original);
					}
				};
				// for select
				if (translations[item_name].type == 'select'){
					// get the new options
					new_options = translations[item_name][this_language].options;
					// make reference to the select in the 3rd td
					this_select = $(this_tr).children("td:nth-child(3)").find("select");
					// loop through the options of the select
					$(this_select).find("option").each(function(index, element) {
						element.text = new_options[index];
					});
					
				}
			}
		})
	}
	// add an event handler to the language selector
	$('#language_selector').change(function(){
		// update the cookie for language
		this_language = $('#language_selector').val();
		updateLabels();
		createCookie("this_language", this_language, 1);
	});

	// run the updateLabels function
	window.setTimeout(function(){
		if(translations){
			updateLabels();
		}
	},1);
})

