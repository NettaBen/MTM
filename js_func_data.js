function leafletGeoBrew (filename, current_comn_name, default_color, name_prop, normalize_col
	, unique_id_col_name, first_visit, ui_name = null, type_muni = null, reg_muni_file = null
	, curr_leaf = null, papa = null, normalize_link = 0, csv_object = null, show_extra = null, rtl=0) {	
	var brew = new classyBrew();
	var brew_data_array = [];
	var total_population = 0;
	var filtered_population = 0;
	var feature_group_length = 0;
	var filter_array = [];
	var legend_array = [];
	var legend_values_array = [];
	var active_filter_array = [];
	var brew_bucket_ind = 0;
	var selection_ind = 0;
	var manual_selection_ind = 0;
	var brew_max_num = 5;	
	var brew_curr_num = 5;	
	var classy_method = 'jenks';	
	var data_timer = '';		
	var bubble_timer = '';		
	//var display_normalize_bubbles = 5;		
	var no_data_color = "lightgrey";		
	var disabled_options_array = [];		
	var external_data_array = {};		
	var external_data_array_names = [];		
	var external_data_headers = [];	
	var extraFeatureGroup	= '';
	var muni_name_options	= '<option val="none">' + ui_strings['select_muni'] + '</option>';
	var categories_select_all_options = categories_select_options;	// Initiate local categories select options.
	var min_brew_select = 3, max_brew_select = 9;
	var selected_style = 
		{
			weight: 1,
			opacity: 1,
			color: '#333',
			dashArray: '',
			fillOpacity: 1
		};
	var default_style = 
		{
			weight: 0.7,
			opacity: 1,
			color: 'grey',
			dashArray: '1',
			fillOpacity: 0.7
		};	
	var empty_style = 
		{
			fillColor: 'lightgrey',
			weight: 0.7,
			opacity: 1,
			color: 'grey',
			dashArray: '1',
			fillOpacity: 0.7
		};		
	var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);	
	
	var balloon_hor_pos_edit = rtl > 0 ? "left" : "right";
	var balloon_hor_pos_control = rtl > 0 ? "right" : "left";
	var control_btns_pos = rtl > 0 ? 'topright' : 'topleft';
	var info_pos = rtl > 0 ? 'topleft' : 'topright';
	var legend_pos = rtl > 0 ? 'bottomright' : 'bottomleft';
	var gen_btns_pos = rtl > 0 ?  'bottomleft' : 'bottomright';
	console.log(control_btns_pos);
	
	var names_list = ['muni_heb', 'Muni_Eng', 'a1',  'LocalityCo', 'a2',  'name',  'd_name' ];
	// TODO: remove and pass as param
	if (!curr_leaf) {
		var url = window.location.pathname;		
		curr_leaf = url.substring(url.lastIndexOf('/')+1);
	}
	//console.log(curr_leaf);
	
	// Check the current interface strings.
	var curr_ui_strings = (ui_name) ? eval("ui_strings" + ui_name) : ui_strings;
	if (ui_name.length > 0) {
		var new_array = eval("ui_strings" + ui_name);
		for (ui_str in ui_strings) {
			if (!new_array[ui_str] && new_array[ui_str] != '') {
				curr_ui_strings[ui_str] = ui_strings[ui_str];
			}
		}
		ui_strings = curr_ui_strings;
		//ui_strings.extends(new_array);
	}
	
	var curr_titles = (ui_name) ? eval("ui_objects_titles" + ui_name) : ui_objects_titles;
	if (ui_name.length > 0) {
		var new_array = eval("ui_objects_titles" + ui_name);
		for (ui_str in ui_objects_titles) {
			if (!new_array[ui_str] && new_array[ui_str] != '') {					
				curr_titles[ui_str] = ui_objects_titles[ui_str];
			}
		}
		ui_objects_titles = curr_titles;			
	}		

	// Initiate base layers.		
	var mbAttr = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
			'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
			'Imagery © <a href="http://mapbox.com">Mapbox</a>',
		mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

	var grayscale   = L.tileLayer(mbUrl, {id: 'mapbox.light', attribution: mbAttr, opacity: 0.5}),
		streets  = L.tileLayer(mbUrl, {id: 'mapbox.streets',   attribution: mbAttr, opacity: 0.5});
	var googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
		maxZoom: 20,
		subdomains:['mt0','mt1','mt2','mt3'],
		opacity: 0.5
	});
	var googleTerrain = L.tileLayer('http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',{
		maxZoom: 20,
		subdomains:['mt0','mt1','mt2','mt3'],
		opacity: 0.5
	});
	var googleHybrid = L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',{
		maxZoom: 20,
		subdomains:['mt0','mt1','mt2','mt3'],
		opacity: 0.5
	});
	var googleStreets = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{
		maxZoom: 20,
		subdomains:['mt0','mt1','mt2','mt3'],
		opacity: 0.5
	});

	var baseLayers = {
		"Streets": streets,
		"Grayscale": grayscale,
		"Google Satellite": googleSat,
		"Google Terrain": googleTerrain,
		"Google Hybrid": googleHybrid,
		"Google Streets": googleStreets
	};	
					
	// Initiate leaflet controls.	
	var legend = L.control({position: legend_pos});	
	var info = L.control({position: info_pos});
	//var info2 = L.control();
	var info3 = L.control({position: info_pos});		
	var circles = L.control({position: control_btns_pos});
	var refocus = L.control({position: control_btns_pos});
	var showTable = L.control({position: legend_pos});
	var attribution = L.control.attribution({position: 'bottomleft'});		
	var baseLayerControl = L.control.layers(baseLayers, null, {position: control_btns_pos});
	var colorControl = L.control({position: control_btns_pos});
	//var opacitySlider = new L.Control.opacitySlider({position: 'bottomright'});		
	var higherOpacity = new L.Control.higherOpacity({position: gen_btns_pos});
	var lowerOpacity = new L.Control.lowerOpacity({position: gen_btns_pos});
	var share = new L.Control({position: gen_btns_pos});
	var searchControl = new L.Control.geocoder({position: gen_btns_pos, defaultMarkGeocode: false});
	var scaleControl = new L.control.scale({position: 'bottomright', imperial: false});
	var data_proc_control = new L.Control({position: gen_btns_pos});
			
	// Initiate the map.
	var map = L.map('map', {
		attributionControl: false, 
		zoomControl: true
	});
	
	map.zoomControl.setPosition(control_btns_pos);
	// TODO: Add bouds save - optional?
	/*map.on('moveend', function() {
		console.log("finished zoom");
	});*/
	map.on('baselayerchange', function (e) {
		//console.log(e.layer);
		lowerOpacity.setOpacityLayer(e.layer);
		higherOpacity.setOpacityLayer(e.layer);	
	});
	
	// Selecting a geocoded search result will focus the map on the new location.
	searchControl.on('markgeocode', function(e) {
		var bbox = e.geocode.bbox;
		var poly = L.polygon([
			 bbox.getSouthEast(),
			 bbox.getNorthEast(),
			 bbox.getNorthWest(),
			 bbox.getSouthWest()
		]);
		map.fitBounds(poly.getBounds());
	});
	
	// Create the map's feature groupe (geojson base map, etc, layer in leaflet is a polygon.....)
	var geojsonLayer = new L.GeoJSON.AJAX(
		filename, 
		{		
			onEachFeature: onEachFeature,
		}
	);	
	
	if (reg_muni_file) {
		//console.log('pf');
		extraFeatureGroup = new L.GeoJSON.AJAX(
			reg_muni_file, 
			{		
				onEachFeature: onEachFeature,	
			}
		);			
	}

	// Create the markers layer
	var markersLayer = L.layerGroup();
	// Add the feature groupe to the map.
	geojsonLayer.addTo(map);
	
	// After the loading of the feature group.
	geojsonLayer.on('data:loaded', function() {
		//console.log("data loaded");	
		var layer_num = geojsonLayer.getLayers().length;
		var new_layer_num = 0;
		if (reg_muni_file) {				
			extraFeatureGroup.addTo(map);
			// Wait until the extra layers are added to the map to proceed with map preparation.
			var new_interval = setInterval(function() {
				//console.log(extraFeatureGroup.getLayers().length);
				if (extraFeatureGroup.getLayers().length > 0){
					//console.log(extraFeatureGroup.getLayers().length);
					extraFeatureGroup.eachLayer(function (layer) {
						geojsonLayer.addLayer(layer);					
					});
					// Remove the featuregroup after being added to the main FeatureGroup.
					map.removeLayer(extraFeatureGroup);
					new_layer_num = geojsonLayer.getLayers().length;
					//console.log("after muni loop");
					//console.log(new_layer_num);
					if (papa) {				
						parseCSV();						
					}	
					clearInterval(new_interval);
					prepareMap();								
				}
			}, 100);												
		}
		// Add data from external CSV to the displayed polygons.						
		function parseCSV() {	
			// TODO: iterate on new categories
			for (header_option in csv_object.header_options) {
				//console.log(header_option);
				//console.log(csv_object.header_options[header_option]);
				header_options_by_cat[header_option] = csv_object.header_options[header_option];
				document.getElementById("col_filter_select").innerHTML += header_options_by_cat[header_option];						
				document.getElementById("data_col_select0").innerHTML += header_options_by_cat[header_option];	
			}
			//header_options_by_cat[99] = csv_object.header_options[0];
			external_data_array = csv_object.data_object;
			external_data_headers = csv_object.header_object;
			var key_col = csv_object.match_col;
			var start_col = csv_object.start_col;				
			var new_categories_options = csv_object.external_cat_options[0];				
			//var new_categories = csv_object.new_categories[0];				
			var start_col = csv_object.start_col;				
			//console.log("Matched by " + key_col);
			//console.log("start by " + start_col);
			//console.log(external_data_headers);
			// Add the data to the displayed featureGroup.
			addExtrnalData(geojsonLayer, external_data_array, external_data_headers, key_col, start_col);	
			//console.log("after new table");
			// Change the category selector options.	
			// TODO: Move the functionality.				
			categories_select_all_options += new_categories_options;
			if (document.getElementById("cat_sel")) {
				var cat_id = document.getElementById("cat_sel").value;
				document.getElementById("cat_sel").innerHTML = categories_select_all_options;
				document.getElementById("cat_sel").value = cat_id;
				//console.log('change cat');
			}				
			// Add the new column to the select columns array.
		
			
		}
		// Classify and color the feature group layers by attribute.	
		function prepareMap() {
			streets.addTo(map);		
			map.removeLayer(geojsonLayer); // Re initiate the loaded layers.
			map.addLayer(geojsonLayer);
			// Initiate the municipalities selector with a reference to the layer id.
			geojsonLayer.eachLayer(function (layer) {
				muni_name_options += "<option data-id='" + layer._leaflet_id + "' value='" + layer.feature.properties[name_prop] + "'>" + layer.feature.properties[name_prop] + "</option>";	
			});			
			changeColorByAttr(geojsonLayer, current_comn_name/*, undefined, undefined*/);							
			// Initiate the total number of layer entities (cities).
			feature_group_length = geojsonLayer.getLayers().length;			
			// Info divs and base layer.
			addControlElements();
			displayNormalizeBubble();
			toggleShowTableContainer();							
			zoomToLayer();				
			// Toggle loading and map display.						
			fadeOut(document.getElementById('loading_div'), "none");
			// Commented db registration for hackathon
			//if (!first_visit)	
				fadeOut(document.getElementById('info_modal'), "none");
			/*else {
				registerVisit();
				if (!isMobile) {
					var next_data_e = document.getElementsByClassName('prev_data')[0];					
					var first_legend_e = document.querySelector('.legendBtn.legendAction.user_action');	
					next_data_e.setAttribute('data-balloon-visible', true);
					first_legend_e.setAttribute('data-balloon-visible', true);
					var bubble_inter = setInterval(function() {
						if (next_data_e.getAttribute('data-balloon-visible')) {					   						
							//col_actions_element.classList.remove("bubble");
							next_data_e.removeAttribute('data-balloon-visible')
							first_legend_e.removeAttribute('data-balloon-visible')
							clearInterval(bubble_inter);					   
					   }
					}, 700);
				}	
			}*/									
			// Create autocomplete inputs for column and filter selectors.
			updateAutoCompleteElements();							
			// Prevent double click on leaflet elements.
			preventDoubleClick();
			createLegendEventListeners();	
			// When normalized is set - change the data classification and display.
			if (((typeof(getNormalizeCookie()) != 'undefined' 
				&& getNormalizeCookie(curr_leaf) == 1  ) || normalize_link == 1)
				&& document.getElementsByClassName('action_sign').length > 0 ) {
				normalizeData();
			}						
		}
		
		// When there is no extra polygons file (read the csv) and prepare the map.
		if (!reg_muni_file ) {
			if (papa) {				
				parseCSV();						
			}
			prepareMap();				
		} 			
		this.update;
	}.bind(this));
		
	function onEachFeature(feature, layer) {
		var bounds = layer.getBounds();	
		if (Math.abs(bounds.getWest()) + Math.abs(bounds.getEast()) > 359) {					
			var latlongs = layer.getLatLngs();				
			latlongs.forEach(function (shape) {					
				shape.forEach(function (cord) {
					cord.forEach(function (inner_cord) {
					//console.log(inner_cord);
						if (inner_cord.lng > 0) {
							//console.log(inner_cord.lng);
							//console.log("fix coords");
							inner_cord.lng -= 360;
							//console.log(inner_cord.lng);
						}   
					})   
				}) 
			}); 
			layer.setLatLngs(latlongs);
		}
		layer.on({
			mouseover: highlightFeature,			
			mouseout: resetHighlight,
			click: zoomToFeature,
			dblclick: selectFeature
		});
		// Add the internal layer attributes for all features (layer) elements.
		feature.style = 1;			
		feature.selected = 0;
		feature.manual_selected = 0;
		layer.filtered = 0;
		//layer.feature.properties[unique_id_col_name] = layer.feature.properties[unique_id_col_name] > 0 ? layer.feature.properties[unique_id_col_name] : layer.feature.properties["a1"];
		layer.uniqueID = layer.feature.properties[unique_id_col_name] ? layer.feature.properties[unique_id_col_name] : layer.feature.properties["a1"];
		layer.leaflet_id = layer.feature.properties[unique_id_col_name];
		// Initiate the filter properties array.
		filter_array[layer.feature.properties[unique_id_col_name]] = [];
		layer.centroid = layer.getBounds().getCenter();	
		var circle = L.circle(layer.centroid);
		markersLayer.addLayer(circle);		
	}
	
	function addExtrnalData(featureGroup, data_array, headers_array, key_col, start_col) {		
		//console.log(data_array);
		//console.log(headers_array.length);
		var z = 0;			
		var match_type = (eval(key_col) === unique_id_col_name) ? 0 : 1;
		//console.log(match_type);
		// Iterate on the featureGroup and match by name/unique1d.
		featureGroup.eachLayer(function (layer) {
		//console.log(layer.feature.properties[name_prop]);	
			if (match_type == 1) {					
				//console.log(data_array[layer.feature.properties[name_prop]]);	
				if (data_array[layer.feature.properties[name_prop]]	) {
					for (var t = start_col; t < headers_array.length; t++) {
						// Add the new data to each layer.
						//console.log(headers_array[t].name);
						//console.log(layer.feature.properties[name_prop]);
						//console.log(layer.feature.properties);
						//console.log(data_array[layer.feature.properties[name_prop]][t]);
						var curr_name = layer.feature.properties[name_prop];
						layer.feature.properties[headers_array[t].name] = data_array[curr_name][t];							
					}
					//console.log(layer.feature.properties);
					z++;
				} else {
					console.log(layer.feature.properties[name_prop]);
				}					
			}
			else {
				if (data_array[layer.uniqueID]	) {
					for (var t = start_col; t < headers_array.length; t++) {
						// Add the new data to each layer.						
						layer.feature.properties[headers_array[t].name] = data_array[layer.uniqueID][t];
					}
					z++;						
				}			
			}	
		})
		//console.log(z + " csv matches");
	}
	
	// Create the info div's actions.	
	info.onAdd = function (map) {
		this._div = L.DomUtil.create('div', 'info topInfo');		
		this._div.id = "info";
		
		// Create the info header.
		var div_header = L.DomUtil.create('span');
		div_header.id = "info_header";
		div_header.title = ui_objects_titles["column_select"];
		
		// Create the paging objects.			
		var next_data = L.DomUtil.create('div', 'next_data change_data');
		next_data.innerHTML = rtl > 0 ? '☚' :'☛';
		next_data.title = ui_objects_titles['prev_data'];									
		var prev_data = L.DomUtil.create('div', 'prev_data change_data');
		prev_data.innerHTML = rtl > 0 ? '☛' :'☚';
		prev_data.title = ui_objects_titles['next_data'];
		
		// create the select column element.		
		var category_col_select = L.DomUtil.create('div');
		category_col_select.id = "columns_container";
		
		// The displayed column header.
		var header = L.DomUtil.create('h4', 'user_action');
		
		// Append the generated header elenents.
		div_header.appendChild(next_data);
		div_header.appendChild(header);
		div_header.appendChild(prev_data);			
		
		// Create the category select element.
		var category_select = L.DomUtil.create('div');
		category_select.id = "category_select";
		category_select.title = ui_objects_titles['category_select'];			
		var select_element = L.DomUtil.create('select', 'user_action');
		select_element.id = "cat_sel";
		select_element.dir = rtl > 0 ? 'ltr' :'rtl';			
		select_element.innerHTML = categories_select_all_options;
		//console.log(categories_select_all_options);
		category_select.appendChild(select_element);
		
		// Create the content div
		var div_content = L.DomUtil.create('div');
		div_content.id = "info_content";
		var div_footer = L.DomUtil.create('div', 'minimized');
		div_footer.id = "info_footer";
		div_footer.innerHTML  = '<div id="muni_sel_container"><select id="muni_sel" class="muni_sel user_action">' + muni_name_options + '</select></div>';
		
		
		// Add all the elements to the current div.
		this._div.appendChild(category_select);
		this._div.appendChild(category_col_select);			
		this._div.appendChild(div_header);			
		this._div.appendChild(div_content);
		this._div.appendChild(div_footer);
		
		return this._div;
	};	
			
	info3.onAdd = function (map) {
		this._div = L.DomUtil.create('div', 'info3');
		this._div.innerHTML ='<div>' + ui_strings['create_filters'] + '</div><div id="filter_container"></div>';		
		return this._div;
	};
	
	refocus.onAdd = function (map) {
		this._div = L.DomUtil.create('div');
		this._div.id = "refocus_container;";
		this._div.innerHTML ='<div id="refocus" title="' + ui_objects_titles['refocus'] + '" data-balloon="'+ui_objects_titles['refocus']+'" data-balloon-pos="' + balloon_hor_pos_edit + '" class="refocus"><b>&#10021</b></div>';												
		return this._div;
	};
	
	circles.onAdd = function (map) {
		this._div = L.DomUtil.create('div');
		this._div.id = "circles_toggle";
		this._div.innerHTML ='<div id="circles" ' + /*title="' + ui_objects_titles['refocus'] +*/ '" class="refocus"><b>o</b></div>';						
		return this._div;
	};
	share.onAdd = function (map) {
		this._div = L.DomUtil.create('div');
		this._div.id = "share_container";
		this._div.innerHTML ='<div id="share" data-balloon="' + ui_strings['get_link'] + '" data-balloon-pos="' + balloon_hor_pos_control + '" class="refocus"><b>☍</b></div>';						
		return this._div;
	};

	data_proc_control.onAdd = function (map) {
		this._div = L.DomUtil.create('div');
		this._div.id = "data_proc_control_container";
		this._div.innerHTML ='<div id="data_proc_control" data-balloon="' + ui_strings['data_proc_control'] + '" data-balloon-pos="' + balloon_hor_pos_control + '" class="refocus"><b>&#9534</b></div>';									
		return this._div;
	};
	
	showTable.onAdd = function (map) {
		this._div = L.DomUtil.create('div', 'showTable');
		this._div.id = "showTableContainer";
		this._div.innerHTML ='<div id="showTable" title="' + ui_objects_titles['showTable'] +'" class="refocus"><div id="showTableAnchor"><b>&#8868</b></div><div id="selected_table_header" class=""></div></div>';				
		return this._div;
	};
	
	// TODO: change div to static and update elements in the update function.
	info.update = function (props) {
		var display_name = getCurrentHeaderAlias();							
		var extra_info = getCurrentHeaderArray().source ? getCurrentHeaderArray().source + "<br>" :'';
		document.querySelector('#info_header > h4').innerHTML = display_name;	
		if (current_comn_name.replace('z', '') > 0) {				
			var cat_sel = document.getElementById("cat_sel");				
			var cat_name = cat_sel.options[cat_sel.selectedIndex].text;			
			//console.log(cat_sel_v);
			if (ui_strings["external_info_array"][cat_name]) {
				extra_info += ui_strings["external_info_array"][cat_name] + '<br>';
			}
			else
				extra_info += ui_strings['external_info'] + '<br>';
		}
		var city_info =  update_city_info(props, extra_info);		
		document.getElementById('info_content').innerHTML = city_info;			
	};	
	
	//function toggleExpandedView(e) {
	function openMuniProfile(e) {
		var info_footer = document.getElementById("info_footer");
		var info_footer_select = e.target;
		
		if(info_footer.classList.contains("minimized")) {
			info_footer.classList.remove("minimized");			
			info_footer.classList.add("expanded");	
			
		}
		
		// Close the profile div if no municipality is chosen.		
		if (info_footer_select.selectedIndex == 0) {
			info_footer.classList.remove("expanded");			
			info_footer.classList.add("minimized");					
		} else {
			var data_id = info_footer_select[info_footer_select.selectedIndex].attributes['data-id'].value;
			changeMuniSelect(geojsonLayer.getLayer(data_id));		
		}		
	}
		
	// Stubs for GoogleServe	 
	function changeMuniSelect(layer) {
	 console.log(layer);
	}

	function createDataProfileSelect() {
	 
	}

	function changeDataProfile(layer, prof_id) {
	 
	}
	
	function toggleHeaderColSelect() {				
		this.parentElement.style.display = 'none';			
		document.getElementById('columns_container').style.display = 'block';
		document.querySelector('#col_select_custom-combobox > input').click();			
	}
	
	function toggleHeaderInput() {
		if (document.querySelector("#col_select_custom-combobox input").value === '') 
		{
			document.querySelector('#info_header').style.display = '';		
			document.querySelector('#ui-id-1').style.display = 'none';		
			document.querySelector('#columns_container').style.display = 'none';						
		}
	}
	
	function update_city_info(props, extra_info = null) {
		var normalized = document.getElementsByClassName('legendAction normalizedLeg').length;				
		//console.log(props);				
		return (props ? '<div id="city_info"><b> ' + ui_strings['muni_name'] + ': ' + props[name_prop] + '</b>'
			+  ((type_muni) ?  "<br>" + props[type_muni] : "")
			+ '<div id="info_display">' 
			+ '<div id="column_data">' 
				+ getCurrentHeaderAlias() + " : " + (parseFloat(props[current_comn_name]) 
					? formatNumberToDisplay(eliminateStringsInNumbers(props[current_comn_name])) 
					: (!props[current_comn_name] && props[current_comn_name] != 0  ? '-' : props[current_comn_name] )) 
				+ '</div>'					
				+ (normalized > 0 ? '<div class="normalizedLeg">' + formatNumberToDisplay(eliminateStringsInNumbers(props[current_comn_name]) / props[normalize_col], 2) + ' ' + ui_strings['normalize_title'] + ' </div>' : ' ') 
		//		+ data_string
				+ createInfoDiv(props)		
				+ (current_comn_name === normalize_col 
					? '<div class="sub_info"> ' + ui_strings['displayed_pop_str'] + ' ' 
						+ formatNumberAsPercent(props[current_comn_name] / population) 
						+ ' ' + ui_strings['from_displayed_pop'] + ' ' 
					: '<div class="sub_info">' + ui_strings['population'] 
						+ ': ' + formatNumberToDisplay(props[normalize_col]) 
						+  ' ' + ui_strings['thousand_pop'] + ' </div>') 
			+ '</div></div>'
			: '<div class="sub_info"> ' + extra_info  + (isMobile ? ui_strings['empty_info_sub_title_mobile'] : ui_strings['empty_info_sub_title']) + '</div>') 
			+ (current_comn_name === normalize_col 
				? '<div id="info_foot"> ' + ui_strings['total_population_str'] + ' ' 
				+ formatNumberToDisplay(population) + ' ' + ui_strings['pop_col_display'] + '</div>' 
				: '')
			;
	}

	// Create the legend div's actions.	
	legend.onAdd = function (map) {
		// console.log("in legend add");
		this._div = L.DomUtil.create('div', 'info legend');	
		this._div.id = "legend";
		this.update();
		return this._div;
	};
					
	legend.update = function (map) {		
		//console.log("in legend update");
		var div = L.DomUtil.create('div', 'info legend'),
			grades = brew.getBreaks(),
			labels = [],
			from, to;			
		// console.log(brew.getBreaks());
		// TODO: Extract function createLegendContent
		var data_balloon = "data-balloon='" + ui_strings['legend_hint'] + "' data-balloon-pos='" + balloon_hor_pos_edit + "' ";
		var data_balloon_h = "data-balloon='" + ui_strings['legend_toggle'] + "' data-balloon-pos='" + balloon_hor_pos_control + "' ";
		if (brew_bucket_ind > 0) {
			labels.push(
			'<div class="legend-line" data-num=' + -1 + '>'
				+ '<div class="legend-entry" title="' + brew_bucket_ind + '/' + feature_group_length + '">'
					+ '<i class="legendAction" data-action="selectLegendFeatures" style="background:' + no_data_color + '" ></i> '
					+ "-" 
				+ '</div>'
				+ '<div class="legend-actions">'						 
					+ '<span class="legendBtn legendNum legendAction user_action" ' + data_balloon + 'data-action="selectLegendFeatures">[' + brew_bucket_ind + ']</span>'				
					+ '<div class="legendBtn legendAction hideAction user_action" ' + data_balloon_h + ' data-action="toggleFeaturesDisplay"> Hide </div>' 
				+ '</div></div>');
			
		}
		for (var i = 0; i < (grades.length - 1); i++) {
			from = grades[i];
			to = grades[i + 1];		
			if (legend_array[i] > 0) {	
			labels.push(
				'<div class="legend-line" data-num=' + i + '>'
					+ '<div class="legend-entry" title="' + legend_array[i] + '/' + feature_group_length + '">'
						+ '<i class="legendAction" data-action="selectLegendFeatures" style="background:' + getColor(to ) + '" ></i> '
						+ (formatNumberToDisplay(to) - formatNumberToDisplay(from) != 1 ? formatNumberToDisplay(from) + '&ndash;' : "" ) + (formatNumberToDisplay(to) ?  
						 formatNumberToDisplay(to)  : '+') 
					+ '</div>'
					+ '<div class="legend-actions">'						
							+ ((typeof(legend_values_array[i]) != 'undefined' && getCurrentHeaderArray().action_col < 3) 
							? '<span class="legendBtn legendStat legendAction user_action"  ' + data_balloon + ' data-action="selectLegendFeatures">' + ' ∑' + formatNumberToDisplay(legend_values_array[i], 0) + '</span>' 
							: '<span class="legendBtn legendNum legendAction user_action"  ' + data_balloon + ' data-action="selectLegendFeatures">[' + legend_array[i] + ']</span>')						
						+ '<div class="legendBtn legendAction hideAction user_action" ' + data_balloon_h + ' data-action="toggleFeaturesDisplay"> Hide </div>' 						
					+ '</div></div>'
				);
			}
		}			
		var normalized_legend = (getCurrentHeaderArray().action_col > 0) ? '<span id="col_actions" >' :
			'<span id="col_actions" class="legendAction user_action" data-action="normalizeData" title="' + ui_objects_titles['normalize'] + '">'
			+ '<div class="action_sign"> &#8469 </div>';
		this._div.innerHTML = normalized_legend
			 +  shortColumnTitle(getCurrentHeaderAlias()) + '</span>' + labels.join('');					
	};

// Create the legend div's actions.	
	colorControl.onAdd = function (map) {
		this._div = L.DomUtil.create('div');
		this._div.id = 'colorControlContainer';			
		
			var extra_op = '<span id="color_num" ><select id="classy_sel" placeholder="' + ui_strings['choose_classify_num'] + '">' + buildBrewNumSelect() + '</select>'
			+ '<select id="brew_method_sel">' + buildBrewMethodSelect() + '</select></span>';				
			var e = "<div id='colors' class='colors' style='display:none;'>" + buildColorsSelectTable() + extra_op + "</div>";
			this._div.innerHTML ='<div id="colors_container" data-balloon="' + ui_objects_titles['colors_container'] + '"data-balloon-pos="' + balloon_hor_pos_edit + '" class="colorControl" title="' 			
			+ ui_objects_titles['colors_container'] + '"><b>❀</b>'+e+'</div>';
						
		return this._div;
	};

	function changeBrewNum() {
		//console.log(this);
		brew_max_num = document.getElementById("classy_sel").value;
		console.log(brew_max_num);
		changeColorByAttr(geojsonLayer, current_comn_name);	
		updateControlElements();	
		document.querySelector('#brew_colors').innerHTML = buildColorsSelectTable();
		createColorsListeners();
	}
	
	function changeBrewMethod() {
		//console.log(this);
		classy_method = document.getElementById("brew_method_sel").value;
		changeColorByAttr(geojsonLayer, current_comn_name);	
		updateControlElements();	
		// normalizeData(1);
	}
	
	// Create the onEachFeature actions.
	function highlightFeature(e) {
		//console.log(e.target.centroid);
		var layer = e.target;
		//console.log(layer);
		if (!document.getElementsByClassName('normalizedLeg').length)
			layer.normalStyle = getNormalStyle(eliminateStringsInNumbers(e.target.feature.properties[current_comn_name]), layer.feature.selected);
		//styleFeatureByAttr(e.target.feature,current_comn_name,false);		
		else {
			layer.normalStyle = styleFeatureByNormalizedAttr(e.target.feature,current_comn_name, false, true);		
		}
		if (layer.feature.selected == 0) {				
			layer.setStyle({
				weight: 2,
				opacity: 0.7,
				color: 'blue',
				dashArray: '',
				/*fillOpacity: 0.7*/
			});		
			
			
		} else {
			layer.setStyle({
				weight: 2,					
				color: 'blue',
				dashArray: ''					
			});		
			
		}
		
		if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
				layer.bringToFront();
		}
		// TODO: Add multi select info.
		info.update(layer.feature.properties);
		//info.update_city(layer.feature.properties);
	}
	
	function toggleShowTableContainer() {
		var dt = createDataTable();

		if (dt) {
			//console.log("show table control");
			document.getElementById('showTableContainer').style.display = '';
			showSelectedData();				
		} else if (!dt) {
			selection_ind = 0;
			manual_selection_ind = 0;
			document.getElementById('showTableContainer').style.display = 'none';
			//console.log("hide table control");
		}
			
	}
	
	function resetHighlight(e) {
		e.target._map.doubleClickZoom.enable();
		var layer = e.target;
		if (layer.feature.selected == 0) {
			layer.setStyle(layer.normalStyle);				
		} else {
			layer.setStyle({
				weight: 1,					
				color: '#333',					
			});	
		}
		info.update();
	}

	function zoomToFeature(e) {
		e.target._map.doubleClickZoom.disable();
		map.fitBounds(e.target.getBounds());
		if (isMobile) {
			selectFeature(e);
		}
	}

	function selectFeature(e) {					
		destroyDataTable();
		var layer = e.target;		
		if (layer.feature.selected == 0 || layer.feature.manual_selected == 0) {
			layer.setStyle(selected_style);
			layer.feature.selected = 1;	
			layer.feature.manual_selected = 1;	
			selection_ind += 1;
			manual_selection_ind += 1;
		} else {
			layer.feature.selected = 0;	
			layer.feature.manual_selected = 0;	
			selection_ind = (selection_ind > 0) ? selection_ind - 1 : selection_ind;
			manual_selection_ind = (manual_selection_ind > 0) 
				? manual_selection_ind - 1 : manual_selection_ind;
			//manual_selection_ind -= 1;
			resetHighlight(e);
		}
		toggleShowTableContainer();
		
		if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
			layer.bringToFront();
		}
		
		// TODO: Add updateMultipleSelection
		//info.update(layer.feature.properties);			
	}
	// Change the displayed data series.
	// 1. Receives event - the change is from the paginating elements.
	// 2. Receives an empty event and a col_name - change the displayed data by col_name.
	function changeDisplayData(e, col_name = null) {
		//e.preventDefault();
		destroyDataTable();			
		var cat_id = document.getElementById("cat_sel").value;
		var curr_cat_id = cat_id;
		if (!col_name) {
			if (e.target.getAttribute('data-balloon'))
				e.target.removeAttribute('data-balloon');					
			var headers_l = header_name_to_alias.length;	
			for (var i = 0; i < headers_l; i++) {
				if (header_name_to_alias[i].name === current_comn_name){
					var next_map_index = (this.classList.contains("prev_data")) ? (i + 1)  : (i - 1);
					if (typeof(header_name_to_alias[next_map_index]) == 'undefined') {
						next_map_index = (this.classList.contains("prev_data")) ? (0)  : (headers_l - 1);
						curr_cat_id = header_name_to_alias[next_map_index].cat_id;
						current_comn_name = header_name_to_alias[next_map_index].name;	
					} else {
						curr_cat_id = header_name_to_alias[next_map_index].cat_id;
						current_comn_name = header_name_to_alias[next_map_index].name;
					}					
					break;
				}
			}
		} else {
			current_comn_name = col_name;
			curr_cat_id = getCurrentHeaderArray().cat_id;
			
		}
		if (cat_id != curr_cat_id)	{							
			changeColSelectOptions(curr_cat_id);				
		}			
		changeColorByAttr(geojsonLayer, current_comn_name);	
		updateControlElements()	;			
		changeDisplayedDataCookie(current_comn_name, curr_leaf);
		toggleShowTableContainer();					
		//document.getElementById('map').click();
		//e.target.removeAttribute("data-balloon-visible");
	}

	
	
	function changeColumn(event, ui, external_val) {
		//console.log(ui);
		var cat_sel_value = document.getElementById('cat_sel').value;
		if (!external_val && cat_sel_value >= 0)
			chosen_category = ui.item.option.attributes['data-cat_id'].value;
		else {
			chosen_category = cat_sel_value;
		}						
		changeColSelectOptions(chosen_category);				
		destroyDataTable();
		chosen_option = ui ? ui.item.option.attributes['data-col_name'].value : external_val.attributes['data-col_name'].value;		
		changeColorByAttr(geojsonLayer, chosen_option);		
		updateControlElements();	
		changeDisplayedDataCookie(chosen_option, curr_leaf);	
		document.getElementById('columns_container').style.display = 'none';			
		document.querySelector('#info_header').style.display = '';	
		toggleShowTableContainer();							
	}
	
	function createFilter(event, ui) {
		destroyDataTable();
		var curr_option = ui.item.option;			
		curr_option.selected = true;
		var chosen_option = curr_option.attributes['data-col_name'].value;
		//console.log(curr_option);
		var chosen_option_name = curr_option.value;	
		var min_val = parseFloat(curr_option.attributes[2].value) 
			? formatNumberToDisplay(parseFloat(curr_option.attributes[2].value)) 
			: curr_option.attributes[2].value;
		var max_val = parseFloat(curr_option.attributes[3].value) 
			? formatNumberToDisplay(parseFloat(curr_option.attributes[3].value))
			: curr_option.attributes[3].value;						
		// Get the last filter div num or initiate the filter count.
		var num = document.getElementsByClassName("filter").length ==0 ? 0 
			: parseInt(document.getElementById("filter_container").lastChild.getAttribute('id').replace('filter','')) + 1;
		
		// TODO: Limit the number of filters (pref desktop 5 and mobile 2-3).
		// Create the filter div, add listeners and update filter column selector and control arrays.
		createFilterDiv(num, chosen_option_name, chosen_option, min_val, max_val);				
		addFilterListeners(num);				
		updateFilterArraysAndCombo(chosen_option_name, chosen_option, num,curr_option);	
		Cookies.set('last_filter' + curr_leaf, chosen_option, { expires: 7 });
		toggleShowTableContainer();	
	}
	
	function addControlElements() {
		//map.attributionControl.addAttribution(
		attribution_text = 
					
		'<a href=http://www.cbs.gov.il/reader/?MIval=cw_usr_view_SHTML&ID=357 target="_blank">'
		+' ' + ui_strings['cbs_attribution'] + ' </a>' 
		+ '&copy; <a href="http://www.cbs.gov.il" target="_blank"> Israel Central Bureau of Statistics  </a>' 
		+ '| <a href="javascript:;" onclick="openModal();" class="about"> By Netta Beninson</a> |' 
		;
		
		attribution.addAttribution(attribution_text).addTo(map);
		showTable.addTo(map);
		legend.addTo(map);
		info.addTo(map);
		info.update();
		//info2.addTo(map);		
		info3.addTo(map);			
		refocus.addTo(map);			
		//circles.addTo(map);			
		scaleControl.addTo(map);
		share.addTo(map);
		if (!show_extra)
			data_proc_control.addTo(map);
		
		map.addControl(lowerOpacity);			
		map.addControl(higherOpacity);	
		searchControl.addTo(map);
		lowerOpacity.setOpacityLayer(streets);
		higherOpacity.setOpacityLayer(streets);
		document.getElementById('h_opacity0').setAttribute('data-balloon', ui_strings['increase_opacity']);
		document.getElementById('h_opacity0').setAttribute('data-balloon-pos', balloon_hor_pos_control);
		document.getElementById('l_opacity0').setAttribute('data-balloon', ui_strings['decrease_opacity']);
		document.getElementById('l_opacity0').setAttribute('data-balloon-pos', balloon_hor_pos_control);
		var next_data_e = document.getElementsByClassName('prev_data')[0];
		var prev_data_e = document.getElementsByClassName('next_data')[0];
		next_data_e.setAttribute("data-balloon", ui_strings['paging_bubble']);			
		next_data_e.setAttribute('data-balloon-pos', balloon_hor_pos_control);
		prev_data_e.setAttribute("data-balloon", ui_strings['paging_bubble']);			
		prev_data_e.setAttribute('data-balloon-pos', 'down');
		prev_data_e.setAttribute('data-balloon-length', 'smallX');

		
		colorControl.addTo(map);
		baseLayerControl.addTo(map);
		disableMapPanAndZoom('refocus');
		disableMapPanAndZoom('legend');
		disableMapPanAndZoom('info');
		disableMapPanAndZoom('showTable');
		disableMapPanAndZoom('filter_container');
		disableMapPanAndZoom('columns_container');
		disableMapPanAndZoom('colors_container');
		
		// TODO: Create mapButtonsListener function.
		document.getElementById("refocus").addEventListener("click", zoomToLayer);
		//document.getElementById("circles").addEventListener("click", toggleCircles);
		document.getElementById("share").addEventListener("click", createShareLink);
		if (!show_extra)
			document.getElementById("data_proc_control").addEventListener("click", toggleDataProc);
		document.getElementById("colors_container").addEventListener("click", changeBrewColor);
		document.getElementById("showTableAnchor").addEventListener("click", showSelectedData);
		document.getElementById("cat_sel").addEventListener("change", changeCategory);
		document.getElementById("cat_sel").addEventListener("click", categoryClick);			
		document.querySelector(".next_data.change_data").addEventListener("click", changeDisplayData);
		document.querySelector(".prev_data.change_data").addEventListener("click", changeDisplayData);		
		
		var curr_cat_id = getCurrentHeaderArray().cat_id;			
		
		changeColSelectOptions(curr_cat_id);			
		
		if (!isMobile) {
			/*document.querySelector('#info_header > h4').addEventListener('mouseenter', toggleHeaderColSelect);									
			//document.querySelector('#ui-id-1').addEventListener('mouseout', toggleHeaderInput);
			document.querySelector('#columns_container').addEventListener('mouseout', toggleHeaderInput);*/
			document.querySelector('#info_header > h4').addEventListener('click', toggleHeaderColSelect);	
		} else {
			document.querySelector('#info_header > h4').addEventListener('click', toggleHeaderColSelect);							
		}			
		
		document.getElementById("muni_sel").addEventListener("change", openMuniProfile);		
	}
	
	function updateControlElements() {
		info.update();	
		legend.update();	
		createLegendEventListeners();			
		displayNormalizeBubble();
		displayTableBubble();
	}
	
	function displayNormalizeBubble() {
		var col_actions_element = document.getElementById('col_actions');
		if (document.getElementsByClassName('action_sign').length > 0 ) {				
			col_actions_element.setAttribute('data-balloon', ui_strings['user_normalize_action']);
			col_actions_element.setAttribute('data-balloon-pos', 'down');
			col_actions_element.setAttribute('data-balloon-visible', 'data-balloon-visible');				
			var bubble_timer = setTimeout(function() {
			   if (col_actions_element.getAttribute('data-balloon-visible')) {					   						
					//col_actions_element.classList.remove("bubble");
					col_actions_element.removeAttribute('data-balloon-visible')
					clearTimeout(bubble_timer);					   
			   }
			}, 700);
			//display_normalize_bubbles--;
		}
	}
	
	function displayTableBubble() {
		var table_button = document.getElementById('showTable');
		if (table_button && !document.getElementById('dataTable')) {				
			table_button.setAttribute('data-balloon', ui_strings['selected_data_bubble']);
			table_button.setAttribute('data-balloon-pos', balloon_hor_pos_edit);
			table_button.setAttribute('data-balloon-length', 'medium');
			table_button.setAttribute('data-balloon-visible', 'data-balloon-visible');				
			data_timer = setTimeout(function() {
			   if (table_button.getAttribute('data-balloon-visible')) {					   						
					//col_actions_element.classList.remove("bubble");
					table_button.removeAttribute('data-balloon-visible')
					clearTimeout(data_timer);					   
			   }
			}, 1500);
			//display_normalize_bubbles--;
		} else {
			table_button.setAttribute('data-balloon-pos', "none");
		}
	}
	
	function updateAutoCompleteElements() {
		var column_container = document.getElementById('columns_container');		
		var filter_container = document.getElementById('filter_container');
		
		// Move autocomplete select box to container.	
		column_container.appendChild(document.getElementById('col_select_custom-combobox'));
		filter_container.appendChild(document.getElementById('col_filter_select_custom-combobox'));
		
		// Set place holders.
		document.querySelector("#columns_container > span > input").setAttribute('placeholder', ui_strings['choose_display_col']);
		document.querySelector("#filter_container > span > input").setAttribute('placeholder',  ui_strings['choose_filter_col']);
		
		// Initial focus on column selector.
		document.querySelector("#columns_container > span > input").focus();
	}
	function normalizeData(cond = 0) {
		destroyDataTable();
		
		//console.log("in norm");
		if (!document.getElementsByClassName('normalizedLeg').length || (cond > 0 && document.getElementsByClassName('normalizedLeg').length > 0)) {
			changeColorByAttr(geojsonLayer, current_comn_name, undefined, normalize_col);	
			updateControlElements();				
			var legend_title = document.getElementById("col_actions");
			legend_title.innerHTML += " (" + ui_strings['normalize_title'] + ") ";
			legend_title.classList.add("normalizedLeg");
			legend_title.setAttribute('title', ui_objects_titles['unnormalize']);
			setNormalizeCookie(1, curr_leaf);	
			var col_actions_element = document.getElementById('col_actions');						
			col_actions_element.setAttribute('data-balloon-pos', "none");								
		}
		else
		{				
			changeColorByAttr(geojsonLayer, current_comn_name);	
			updateControlElements();
			var legend_title = document.getElementById("col_actions");
			setNormalizeCookie(0, curr_leaf);
			var col_actions_element = document.getElementById('col_actions');						
			col_actions_element.setAttribute('data-balloon-pos', "down");								
		}			
	}		
	
	// Create natural jenks array by attr and color plate.
	function changeColorByAttr(featureGroup, attr, color = default_color, brew_factor = null) {		
		// Create the brew data array and classes.
		brewByAttr(featureGroup, attr, color, brew_factor);	
		
		// Pass the attr to global var.
		current_comn_name = attr;		
		
		// Empty the legend array on column change.
		legend_array = [];
		legend_values_array = [];
		// Change the style of the feature group by the new brew.
		if (!brew_factor)
			featureGroup.setStyle(styleFeatureByAttr);
		else {
			featureGroup.setStyle(styleFeatureByNormalizedAttr);
		}
	}
	
	function changeLayersBrewColor(e) {
		var table_row = e.target.parentElement;
		var new_color = table_row.getAttribute('data-color_code');
		var colors_div = document.getElementById('colors');
		//console.log(table_row.getAttribute('data-color_code'));
		brew.setColorCode(new_color);
		default_color = new_color;
		changeColorByAttr(geojsonLayer, current_comn_name, default_color);	
		updateControlElements();	
	}
	
	function brewByAttr(featureGroup, attr, color, brew_factor = null) {		 
		var distinct_array = [];
		brew_data_array = [];
		brew_bucket_ind = 0;
		population = 0;	
		// Iterate over the features and create the new brew_data_array.
		featureGroup.eachLayer(function (layer) {
			var feat_attr = layer.feature.properties[attr];					
			population = population + layer.feature.properties[normalize_col];				
			if (eliminateStringsInNumbers(feat_attr)) {
				feat_attr = eliminateStringsInNumbers(feat_attr);
				
				if (!distinct_array.contains(feat_attr))
					distinct_array.push(feat_attr);						
				
				if (!brew_factor)
					brew_data_array.push(feat_attr);
				else
					brew_data_array.push(feat_attr/layer.feature.properties[brew_factor])
				
				//console.log("has layer " + map.hasLayer(layer));
				if (!map.hasLayer(layer) && layer.feature.style == 0 && layer.filtered == 0) {
					// Add the feature to the map if it's not in the map and the feature's legend visibility was off.
					//console.log("in add layer");				
					map.addLayer(layer);						
				}
				
			} else {
				//console.log(layer.feature.style);
				// If the layer was hidden from the legend and the layer is in the filter array -> readd the layer.
				if (!map.hasLayer(layer) && layer.feature.style == 0 && layer.filtered == 0) {					
					map.addLayer(layer);						
				}					
				brew_bucket_ind += 1;									
			}

			//console.log(str_out);
			// Changing the displayed column resets the style (legend visibility) attribute.
			layer.feature.style = 1;
		});
		
		// Re-evaluate the number of classes, if there are less values than classes, change the classes to match.
		var brew_class_num = (brew_data_array.length <= brew_max_num) ? (brew_data_array.length - 1) : brew_max_num;		
		//console.log(brew_class_num);
		brew_class_num = (distinct_array.length > 0 && brew_max_num >= (distinct_array.length - 1)) ? distinct_array.length - 1 : brew_class_num;
			
		brew_curr_num = brew_class_num;
		brew.setSeries(brew_data_array);
		brew.setNumClasses(brew_class_num);
		brew.setColorCode(color); 
		brew.classify(classy_method);	
	}

	// Styling and color by functions.	
	function styleFeatureByAttr(feature, attr=current_comn_name, is_change_color = true) {
		// Parse the colored property numeric value.
		var str = eliminateStringsInNumbers(feature.properties[attr]);					
		feature.curr_class = getCurrentBreak(str);
		//console.log(feature.curr_class);
		// Change the legend arrays if the displayed column changed. 
		if (is_change_color) {
			legend_array[feature.curr_class] = legend_array[feature.curr_class] > 0 
				? legend_array[feature.curr_class] + 1
				: 1;
			legend_values_array[feature.curr_class] = (typeof(legend_values_array[feature.curr_class]) != 'undefined')
				? legend_values_array[feature.curr_class] + parseFloat(str)
				: parseFloat(str);
		}
		//var selected = feature.manual_selected > 0 ? feature.manual_selected : feature.selected;
		var selected = feature.manual_selected > feature.selected ? feature.manual_selected : feature.selected;			
		return getNormalStyle(str, selected);							
	}
	
	function styleFeatureByNormalizedAttr(feature, attr=current_comn_name, is_change_color = true, is_change_selected = false) {
		var str = eliminateStringsInNumbers(feature.properties[attr]) / feature.properties[normalize_col];			
		feature.curr_class = getCurrentBreak(str);
		if (is_change_color)
			legend_array[feature.curr_class] = legend_array[feature.curr_class] > 0 
				? legend_array[feature.curr_class] + 1
				: 1;
		var selected = feature.manual_selected > 0 ? feature.manual_selected : feature.selected;		
		selected = !is_change_selected ? selected : 0;
		return getNormalStyle(str, selected);				
		//TODO: Consider diffrent style for normalized data ==> dashArray: '3'.			
	}

	function getColor(number) {					
		return (!brew.getColorInRange(number) || (number==0)) ? no_data_color : brew.getColorInRange(number);			
	}

	function getCurrentBreak(num) {			
		//console.log(num);
		if (!num) 
			return -1;
		for (var i = 0; i < brew.getBreaks().length; i++) {
			if (num <= brew.getBreaks()[i])
				break;
				
		}
		if ( i == 0 )
			return i;	
		return (i - 1); 
	}
	
	function toggleFeaturesDisplay() {			
		var curr_state = (this).classList.contains('hide');
		var curr_class = (this).parentElement.parentElement.getAttribute('data-num');		
		var selected_legends = (this).parentElement.parentElement;		
		geojsonLayer.eachLayer(function (layer) {				
			if (layer.feature.curr_class == curr_class) {
				//console.log("City is %s curr_class is %s", layer.feature.properties.Muni_Heb, curr_class);				
				//var display = layer.feature.style > 0 ? 0 : 1;
				var display =  curr_state  ? 1 : 0;
				var filtered = layer.filtered > 0 ? 1 : 0;
				if (display > 0 && filtered == 0) {
					map.addLayer(layer);
				}
				else {
					map.removeLayer(layer);					
				}
				//console.log(layer.feature);					
				layer.feature.style = display > 0 ? 1: 0;
			}
		});
		
		if (selected_legends.length > 0)
			destroyDataTable();
		// TODO: create toggle display string function.
		if ((this).classList.contains('hide')) {
			(this).classList.remove("hide");
			this.innerHTML = "Hide";
			
				
		} else {
			(this).classList.add("hide");
			this.innerHTML = "Show";				
		}
		if (selected_legends.length > 0)
			toggleShowTableContainer();						
	}
	
	function selectLegendFeatures() {
		destroyDataTable();
		var curr_legend_line = (this).parentElement.parentElement;
		var curr_class = curr_legend_line.getAttribute('data-num');	
		var legend_actions = curr_legend_line.querySelector('div.legend-actions > span');
		//console.log(curr_class);
		var curr_legend_display = legend_actions.classList.contains('selectedLegend') ? 1 : 0;	
		geojsonLayer.eachLayer(function (layer) {				
			if (layer.feature.curr_class == curr_class) {								
				// If the current legend items selection is active, disable the selection.					
				layer.feature.selected = curr_legend_display > 0 ? 0 : 1;
				// If the feature is manually selected, set the display by the manual selection.
				layer.feature.selected = (layer.feature.manual_selected > 0) ? 1 : layer.feature.selected;					
				// If the feature is manually selected or the legend row selection is active set the feature as selected.	
				if (layer.feature.selected > 0 ) {
					layer.setStyle(selected_style);
					selection_ind = (layer.feature.manual_selected > 0) ? selection_ind : selection_ind + 1;
				} else {
					layer.setStyle(default_style);
					//selection_ind = (layer.feature.manual_selected  == 0) ? selection_ind : selection_ind + 1;
					selection_ind = (selection_ind > 0) ? selection_ind - 1 : selection_ind;
				}
			}
		});
		toggleShowTableContainer();
		
		if (curr_legend_display > 0) {
			legend_actions.classList.remove("selectedLegend");				
		} else {
			//(this).classList.add("selectedLegend");				
			legend_actions.classList.add("selectedLegend");				
		}			
	}

	function createLegendEventListeners() {
		var legendBtns = document.getElementsByClassName("legendAction");
		for (var i=0; i < legendBtns.length; i ++ )
		{
			var action = legendBtns[i].getAttribute('data-action');
			//console.log(action + i);
			if (action)
				legendBtns[i].addEventListener("click", eval(action));
		}
	}

	function createColorsListeners() {
		var colorsRows = document.getElementsByClassName("color_pick");
		for (var i=0; i < colorsRows.length; i ++ )
		{
			var color_code = colorsRows[i].getAttribute('data-color_code');
			colorsRows[i].addEventListener("click", changeLayersBrewColor);
		}
	}
	
	function addFilterListeners(num) {
		document.getElementById('oper_select' + num).addEventListener("change", focusFilterInput);
		document.getElementById('filter_value' + num).addEventListener("keyup", changeFilterInput);
		document.getElementById('close' + num).addEventListener("click", removeFilter);
	}
	
	function preventDoubleClick() {
		var leafletItems = document.getElementsByClassName("leaflet-control");
		for (var i=0; i < leafletItems.length; i ++ )
		{			
			leafletItems[i].addEventListener("dblclick", emptyDoubleClick);
			leafletItems[i].addEventListener("mousedown", emptyDoubleClick);
			leafletItems[i].addEventListener("mousewheel", emptyDoubleClick);
		}
	}	
	function emptyDoubleClick(e) {
		e.stopPropagation();			
	}	

	function changeColSelectOptions(cat_id) {
		var current_options = header_options;
		//console.log(cat_id);
		if (cat_id >= 0) {
			current_options = header_options_by_cat[cat_id];
			//console.log("change cat to " + cat_id);
		} 
		document.getElementById("col_select").innerHTML = "<option></option>" + current_options;
		document.getElementById("cat_sel").value = cat_id >= 0 ? cat_id : "All";
		//console.log(document.getElementById("cat_sel").value);
	}
	
	function doubleClickAsClick(e) {
		e.preventDefault();
		e.target.click();			
	}

	function focusFilterInput(e) {
		var num = this.id.replace("oper_select", '');
		document.getElementById('filter_value' + num).focus();		
	}
	
	function createFilterDiv(num, chosen_option_name, chosen_option, min_val, max_val) {
		var e = document.createElement('div');
		e.className = "filter";
		e.id = "filter" + num;
		e.innerHTML = ("<span class='filter_header'><div id='close" + num + "' class='close filter_header'>X</div>"
			+ "</span>"
			+" <span class='column_prop'><div class='column_name'>" + chosen_option_name + "</div>"
			+ "<div id='filter_res" + num + "' class='filter_header filter_res'></div></span>"
				+ "<span class='range_span'>"+ ui_strings['range'] 
					+ " : <div id='max_val" + num  + " 'class='filter_header' >" + max_val + " - </div>"
					+ "<div id='min_val" + num + "' class='filter_header'>" + min_val 
				+ "</div></span>" 										
			+ "<span class='filter_data'>" + operatorSelector(num)
			+ "  <input id='filter_value"+num+"' class='filter_value' data-col_name='"
			+ chosen_option + "'/></span>");
		document.querySelector('#filter_container').appendChild(e);
		document.getElementById('oper_select' + num).focus();
	}
	
	function updateFilterArraysAndCombo(chosen_option_name, chosen_option, num, itemOption){		
		active_filter_array.push({"name" : chosen_option_name, "prop_name" : chosen_option});				
		var filter_select = document.getElementById("col_filter_select");		
		disabled_options_array[num] = itemOption;		
		filter_select.remove(filter_select.selectedIndex);
		document.querySelector("#filter_container > span > input").value = '';
	}	
	
	function changeFilterInput(e) {			
		destroyDataTable();
		var input_val = this.value;
		var filter_num = this.id.replace("filter_value", '');
		var alias_name = document.querySelector('#filter' + filter_num + ' .column_name').innerHTML;
		var col_name = this.attributes['data-col_name'].value;
		var oper_select = document.getElementById('oper_select' + filter_num);
		var operator_index = oper_select.selectedIndex;
		var operator = oper_select.options[operator_index].attributes['data-operator'].value;		
		//console.log(document.getElementById('oper_select').value);		
		updateLayersByFilter(input_val, operator, col_name, filter_num);		
	}

	function removeFilter(e) {	
		destroyDataTable();
		var filter_num = this.id.replace("close", '');		
		var col_name = document.getElementById('filter_value' + filter_num).attributes['data-col_name'].value;		
		updateLayersByFilter('', ' ', col_name, filter_num);
		var filter_div = document.getElementById('filter' + filter_num);
		filter_div.parentNode.removeChild(filter_div);
		// Remove event listeners.
		filter_div = null;
		// Remove from active filter array.
		var filter_index = arrayObjectIndexOf(active_filter_array, col_name, "prop_name");		
		active_filter_array.splice(filter_index, 1);
		// Add the filtered column to the select filter column list.
		var filter_select = document.getElementById('col_filter_select');
		filter_select.add(disabled_options_array[filter_num]);
	}

	function updateLayersByFilter(input_val, operator, col_name, filter_num) {
		var z = 0;			
		geojsonLayer.eachLayer(function (layer) {
			//console.log("eval %s %s %s", layer.feature, parseFloat(layer.feature.properties[col_name]), input_val);
			// Set the default to no show in the filter array
			filter_array[layer.feature.properties[unique_id_col_name]][col_name] = 1;							
			if (input_val == '' || (parseFloat(layer.feature.properties[col_name]) 
				&& eval(layer.feature.properties[col_name]  + operator + input_val))) {	
				// Mark the feature as filtered by the current col_name.
				filter_array[layer.feature.properties[unique_id_col_name]][col_name] = 0;
				
			}				
			// Check the feature's visibility based on all filters.
			var display = 0;			
			Object.keys(filter_array[layer.feature.properties[unique_id_col_name]]).forEach(function(key, index) {									
				display = display + this[key];				
			}, filter_array[layer.feature.properties[unique_id_col_name]]);
			//console.log(display);
			if (display > 0) {
				layer.filtered = 1;				
				if (map.hasLayer(layer)) {
					map.removeLayer(layer);						
				}					
			}
			else {
				layer.filtered = 0;
				
				// If the feature is not hidden from the legend and in the filtered results, add it to the map.
				if (layer.feature.style != 0) {
					if (!map.hasLayer(layer))
						map.addLayer(layer);												
				}
				z++;					
			}
		});			
		updateFilterHeader(z, filter_num);
	}
	
	function updateFilterHeader(filtered_res, filter_ser) {
		var elems = document.querySelectorAll(".filter_res");
		for (var i=0; i < elems.length; i++) {
			elems[i].innerHTML =  "[" + filtered_res + "/" + feature_group_length + "]";
		}			
	}

	function createInfoDiv(props) {
		var filter_array_temp = [];
		//console.log(active_filter_array);
		var filter_info = '';
		for (var i=0; i < active_filter_array.length; i++) {
			var displayed_value = parseFloat(props[active_filter_array[i].prop_name])
				? formatNumberToDisplay(eliminateStringsInNumbers(props[active_filter_array[i].prop_name])) 
				: props[active_filter_array[i].prop_name];
			displayed_value = !displayed_value && displayed_value != 0 ?  '-' : displayed_value;
			filter_info += "<span class='filter_info'><div class='col_header filter_header'>"
				+ active_filter_array[i].name +"</div>" 
				+ "<div class='col_value filter_header'>: " 
				+ displayed_value
				+ "</div></span>";
		}
		//console.log(filter_info);
		return filter_info;		
	}

	// TODO: Fix geojsonLayer to mainLayer as a function variable. Create default bounds (mainLayer problem/no bounds)
	function zoomToLayer() {			
		map.fitBounds(geojsonLayer.getBounds());
	}
	
	function toggleCircles() {
		var show = this.classList.contains('markers') ? 1 : 0;
		//console.log(markersLayer);
		if (show > 0 ) {				
			map.removeLayer(markersLayer);
			this.classList.remove('markers');
			
		} else {
			markersLayer.addTo(map);
			this.classList.add('markers');
		}
	}	

	function toggleDataProc(e) {
		var data_proc = document.getElementById('data_proc');
		var map_div = document.getElementById('map');
		var e_target = event.target;
			if (data_proc.style.display != 'none') {
				data_proc.style.display = 'none';
				if (!isMobile) {					
					map_div.classList.add('wide_map');
					map.invalidateSize();
				} else { 
					//map_div.style.display = '';
					//map_div.style.visibility = 'visible';
				}
			} else {
				data_proc.style.display = '';
				if (!isMobile) {
					map_div.classList.remove('wide_map');
					map.invalidateSize();
				} else {
					//map_div.style.display = 'none';
					//map_div.visibility = 'hidden';
					var data_proc_control = document.getElementById("data_proc_control");
					if (!document.getElementById("data_proc_control1")) {
						var data_proc_control = document.getElementById("data_proc_control");
						//var data_proc_btn = document.createElement("div");
						var data_proc_btn = data_proc_control.cloneNode(true);
						data_proc_btn.id = "data_proc_control1";
						data_proc_btn.innerHTML = "<b>&#9596;</b>";
						data_proc.appendChild(data_proc_btn);					
						document.getElementById("data_proc_control1").addEventListener("click",toggleDataProc);							
					}
				}
			}
		

	}
	
	function createShareLink(e) {
		var col_id = getDisplayCookie(curr_leaf);
		var normalize = getNormalizeCookie(curr_leaf) ? getNormalizeCookie(curr_leaf) : 0;
		var index = '';
		if (curr_leaf.length == 0)
			index = 'index.php';
		
		var share_url = window.location.origin  + window.location.pathname + index + "?col_id=" + col_id + "&normalize=" + normalize;
		console.log(share_url);
		copyValToClipboard(share_url);
		
		
		
		var link_btn = document.getElementById("share");
		link_btn.setAttribute("data-balloon" ,ui_strings['link_copied']);
		link_btn.setAttribute("data-balloon-pos" ,balloon_hor_pos_control);
		var share_timer = setTimeout(function() {
			link_btn.setAttribute("data-balloon" ,ui_strings['get_link']);
			clearTimeout(share_timer);
		}, 1500);			
	}

	function copyValToClipboard(val) {
		var dummy = document.createElement("input");			  
		document.body.appendChild(dummy);			  
		dummy.setAttribute("id", "dummy_id");			  
		document.getElementById("dummy_id").value=val;  			  
		dummy.select();			  
		document.execCommand("copy");
		document.body.removeChild(dummy);
	}
	
	function getCurrentHeaderAlias() {
		var result = header_name_to_alias.filter(function( obj ) {
			return obj.name === current_comn_name;
		});
		return display_name = (typeof(result[0]) != "undefined") ? result[0].alias : current_comn_name;
	}
	
	function getCurrentHeaderArray(c_col = current_comn_name) {
		var result = header_name_to_alias.filter(function( obj ) {
			return obj.name === c_col;
		});
		return result[0];
	}		
	
	function shortColumnTitle(title) {
		return title.substring(0,150);
	}

	function changeBrewColor(ev) {
		//console.log(ev.target);
		var colors_container = document.getElementById('colors_container');
		var colors_div = document.getElementById("colors");

		if (colors_div.style.display == "" &&  ev.target.parentElement.id != 'color_num') {							
			colors_div.style.display = "none";
			colors_container.setAttribute('data-balloon-pos', balloon_hor_pos_edit);				
		}
		// If the button is clicked and the colors are hidden.
		else {
			// Add event listeners.
			createColorsListeners();	
			document.getElementById('classy_sel').addEventListener('change', changeBrewNum);
			document.getElementById('brew_method_sel').addEventListener('change', changeBrewMethod);	
			colors_div.style.display = "";
			colors_container.setAttribute('data-balloon-pos', 'none');				
		}
	}
	
	function buildBrewNumSelect() {
		var brew_num_sel = '<option disabled selected value="initial" selected="selected">' + ui_strings['choose_classify_num'] + '</option>';			
		for (var i = min_brew_select; i <= max_brew_select ; i++) {
			brew_num_sel += '<option value="' + i + '">' + i + '</option>';
		}
		return brew_num_sel;			
	}

	function buildBrewMethodSelect() {						 				
			var options = '<option disabled selected>' + ui_strings['classybrew_methods'] + '</option>'
			+ '<option value="jenks">' + ui_strings['jenks_name'] + '</option>'
			+ '<option value="equal_interval">' + ui_strings['equal_interval'] + '</option>'
			+ '<option value="quantile">' + ui_strings['quantile'] + '</option>';
			return options;						
	}
	
	function buildColorsSelectTable() {
			var cb = new classyBrew();				
			var colors = cb.getColorCodes();
			cb.setSeries(brew_data_array);
			cb.setNumClasses(brew_max_num);
			cb.classify(classy_method);
			breaks = cb.getBreaks();
			// TODO: Extract createColorsTable function.
			var brew_color_div = '<table id="brew_colors">';
			for( var c = 0; c < colors.length ; c++ ) {
					cb.setColorCode(colors[c]);
				//if (cb.getColorInRange(breaks[brew_max_num])) {
					try  {
						if (cb.getColorInRange(breaks[brew_max_num])) {
							brew_color_div += "<tr class='color_pick' data-color_code='" + colors[c] + "'>";
							for (var i = 1; i < breaks.length ; i++) {
								brew_color_div += "<td style='background-color:" + cb.getColorInRange(breaks[i]) + "'></td>";
							}
							brew_color_div += "</tr>";
						}
					} catch (e) {
					}
				//}
			}
							
			brew_color_div += "</table>";
			return brew_color_div;
	}
	
	function showSelectedData() {
		var parent = document.getElementById('showTable');
		if (!document.getElementById('dataTable')) {
			e = document.createElement('div');
			e.id = 'dataTable';			
			e.innerHTML = createDataTable();					
			if (e.innerHTML.length > 0) {
				parent.appendChild(e);						
				var table_e = document.getElementById('selected_features_table');										
				var table_c = document.getElementById('table_container');						
				makeSortable(table_e, 1, 1);									
				table_e.addEventListener("mousedown", emptyDoubleClick);
				table_e.addEventListener("click", dataTableClick);						
				//console.log(table_e.clientWidth);
				if (table_e.clientWidth > 230 && !isMobile) {
					$('#table_container').resizable( { handles: 'e, w', maxWidth: document.getElementById('selected_features_table').clientWidth /*, maxHeight:'300px', minHeight: "200px"*/ });																																							
					table_c.classList.add('blue-border');
				}
				var table_body = document.querySelector('tbody.overflow');
				var table_header = table_e.querySelector('thead');
				var body_height = document.getElementsByTagName('body')[0].clientHeight;
				//console.log(body_height);
				if (!isMobile) {
					$('tbody.overflow').resizable( { handles: 's', maxHeight: document.getElementById('map').clientHeight /*, maxHeight:'300px', minHeight: "200px"*/ });			
					
					if (body_height < '800') {
						if (table_header.clientHeight < 50) {
							table_body.style.height =  table_body.clientHeight > 150 ? '150px' : 'auto';
						} else 	{
							table_body.style.height =  table_body.clientHeight > 100 ? '100px' : 'auto';
						}
					} else {
						table_body.style.height =  table_body.clientHeight > 200 ? '200px' : 'auto';
					}
					table_c.style.width = table_e.clientWidth > 300 ? '300px' : table_e.clientWidth + 10 +'px';
					document.getElementById("showTable").style.bottom = table_c.offsetHeight + 80 + 'px';										
					//$('#showTable').draggable({ containment: "#map" });
				} else {
					console.log(table_header.clientHeight);
					table_c.style.width = table_e.clientWidth > 200 ? '220px' : table_e.clientWidth + 10 +'px';
					
					// Change table height by body height;
					if (body_height > '750') {
						if (table_header.clientHeight < 50) {
							table_body.style.height =  table_body.clientHeight > 150 ? '150px' : 'auto';
						} else 	{
							table_body.style.height =  table_body.clientHeight > 100 ? '100px' : 'auto';
						}
					} else if (body_height > 420 && table_header.clientHeight < 50){
						table_body.style.height =  table_body.clientHeight > 100 ? '100px' : 'auto';
					} else {
						table_body.style.height =  table_body.clientHeight > 50 ? '50px' : 'auto';
					}
					
						document.getElementById("showTable").style.bottom = table_c.offsetHeight + 70 + 'px';									
						
				}
				document.getElementById("selected_table_header").style.width =  table_c.style.width;
				document.getElementById("selected_table_header").style.display =  '';
				//console.log(table_e.clientWidth);
				
									
				//var legend_height = document.getElementById("legend").clientHeight;
				//console.log(table_c.offsetHeight);
				
				
				var empty_table = document.getElementById('emptySelection');					
				if (empty_table)
					empty_table.addEventListener("click", emptySelection);											
				//console.log(table_body.clientHeight);	
						
			}
		} else {
			var table_div = document.getElementById('dataTable');
			table_div.parentNode.removeChild(table_div);						
			document.getElementById("selected_table_header").style.display =  'none';
			document.getElementById("showTable").style.bottom =  40 + 'px';				
		}
		displayTableBubble();
	}
			
	function createDataTable() {
		var is_normalized = document.getElementsByClassName('normalizedLeg').length;
		var table = "";
		var z = 1;
		//var table += "<table id='selected_features_table'>";
		geojsonLayer.eachLayer(function (layer) { 				
			if (layer.feature.selected == 1 && layer.feature.style == 1 && layer.filtered == 0) {
				table += table.length > 0 ? '' : "<tbody class='overflow'>";
				// Create the table row and the name column.
				var props = layer.feature.properties;	
				var select_type = layer.feature.manual_selected > 0 ? 'manual-select' : '';
				table += "<tr class='user_action " + select_type + "' data-id='" 
					//+ layer.feature.properties[getCurrentHeaderArray(unique_id_col_name).name] + "'" 
					+ layer._leaflet_id + "'" 
					+ " title='" + props[name_prop] + "'"+">";
				table += "<td class='index-col'>" + z + "</td>";
				table += "<td>" + props[name_prop] + "</td>";
				// Add display column value.
				
				var displayed_value = parseFloat(eliminateStringsInNumbers(props[current_comn_name]))
						? formatNumberToDisplay(eliminateStringsInNumbers(props[current_comn_name])) 
						: props[current_comn_name];
					//	console.log(parseFloat(props[current_comn_name]));
					//	console.log(props[current_comn_name]);
				displayed_value = !displayed_value && displayed_value != 0 ? '-' : displayed_value;		
				
				table += '<td>' + displayed_value + '</td>';
				if (is_normalized > 0) {						
					displayed_value = formatNumberToDisplay(eliminateStringsInNumbers(props[current_comn_name]) / props[normalize_col], 2) 
						? formatNumberToDisplay(eliminateStringsInNumbers(props[current_comn_name]) / props[normalize_col], 2) : '-';
					table += '<td>' + displayed_value + '</td>';
				}
				
				// Add the filter columns values.
				for (var i=0; i < active_filter_array.length; i++) {
					var displayed_value = parseFloat(props[active_filter_array[i].prop_name])
						? formatNumberToDisplay(props[active_filter_array[i].prop_name]) 
						: props[active_filter_array[i].prop_name];
					//displayed_value = displayed_value ? displayed_value : '-';
					displayed_value = !displayed_value && displayed_value != 0 ? '-' : displayed_value;
					table += "<td>" + displayed_value + "</td>";						
				}
				table += "</tr>";
				z++;
			}			
		})
		if (table.length > 0) {
			// Create the table headers
			var table_hdr = "<div id='emptySelection' title='"+ ui_objects_titles['emptySelection'] +"' class='emptySelection refocus'>&#9746</div>"
				+ "<div id='table_container'><table id='selected_features_table' class='data-table'>";
			table_hdr += "<thead><th class='index-col'><div class='loading-th'></div></th>"
				+"<th class='user_action' data-num=0><div> " + ui_strings['muni_name'] + " </div></th>" 
				+ "<th class='user_action' data-num=1><div title='" + getCurrentHeaderAlias() + "' >" + getCurrentHeaderAlias() + "</div></th>";				
			if (is_normalized > 0 ) {
				table_hdr += "<th class='user_action' data-num=2><div title='" + getCurrentHeaderAlias() + "' >" + getCurrentHeaderAlias() + " " + ui_strings['normalize_title'] + "</div></th>" ;
			}				
			for (var i=0; i < active_filter_array.length; i++) {
				table_hdr += "<th class='user_action' data-num=" + (i + 2) + "><div title='" + active_filter_array[i].name + "'>" + active_filter_array[i].name + "</div></th>"
			}				
			table += "</tbody></table>";			
			document.getElementById("selected_table_header").innerHTML = (z - 1) + " " + ui_strings['selected_features_table_header'];
			return table_hdr + "</thead>" + table + "</div>";
		}
		else
			return null;			
	}
	
	function dataTableClick(e, par = 1) {			
		var data_id = (par == 1) ? e.target.parentElement.getAttribute('data-id') : e.target.parentElement.parentElement.getAttribute('data-id');			
		if (geojsonLayer.getLayer(data_id)) {
			map.flyToBounds(
				geojsonLayer.getLayer(data_id).getBounds(), 
				{duration: 0.6});	
		} 
	}
	
	function destroyDataTable() {
		if (document.getElementById('dataTable'))
			showSelectedData();
		document.getElementById('colors').style.display = "none";
		
	}
	
	function changeCategory(new_cat = null) {
		//console.log(this.value);
		var chosen_category = (new_cat > 0 ) ? new_cat : this.value;		
		changeColSelectOptions(chosen_category);

		var option_to_choose = document.getElementById('col_select').getElementsByTagName('option')[1];
		// console.log(option_to_choose);
		// Select the first option in the newly populated select box widget.
		// TODO: Problem in category match 
		$("#col_select").combobox("select", option_to_choose);
	}
	
	function categoryClick(e) {
		if (document.getElementById('ui-id-1').style.display != 'none') {
			document.getElementById('info_header').style.display = '';	
			document.getElementById('columns_container').style.display = 'none';	
			document.getElementById('ui-id-1').style.display = 'none';	
		}
	}	

	function registerVisit() {
		//console.log("ajax");
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {					
				console.log("Visit registered");
		   }
		};
		xhttp.open("GET", "register_visit.php", true);
		xhttp.send(); 
	}
				
	function disableMapPanAndZoom(div_id) {
		// TODO: y like this?
		var div = L.DomUtil.get(div_id);
		L.DomEvent.disableClickPropagation(div);
		L.DomEvent.on(div, 'mousewheel', L.DomEvent.stopPropagation);
		L.DomEvent.on(div, 'drag', L.DomEvent.stopPropagation);	
	}							
			
	function removeClassFromAll(className) {			
		var elements = document.getElementsByClassName('selectedLegend');			
		while (elements.length > 0) {
			elements[0].classList.remove(className);
		}
	}

	function emptySelection() {
		geojsonLayer.eachLayer(function (layer) {
			layer.feature.selected = 0;
			layer.feature.manual_selected = 0;
			selection_ind = 0;				
			manual_selection_ind = 0;				
		})			
		toggleShowTableContainer();
		normalize = document.getElementsByClassName('normalizedLeg').length > 0 ? normalize_col : undefined;
		changeColorByAttr(geojsonLayer, current_comn_name, undefined, normalize);
		destroyDataTable();
		removeClassFromAll('selectedLegend');			
	}		
	
	function getNormalStyle(str, selected) {			
		if (selected > 0){					
			return	{				
				selected_style,			
				fillColor: getColor(str)			
			}
		} else {
			//console.log(getColor(str) + " " + getColor(str).length);
			//var line_color = getColor(str) != no_data_color  ? 'grey' : 'lightgrey';
			return {
				type: "Feature",
				weight: 0.7,
				opacity: 1,
				color: "grey",
				dashArray: '1',
				fillOpacity: 0.7,
				//default_style,
				fillColor: getColor(str)					
			}				
		}
	}
	
	function getGeoLayer() {
		return geojsonLayer;
	}
	
	function getMap() {
		return map;
	}
			
	// Expose internal functions for external listeners.
	return {
		changeColumn: changeColumn,
		createFilter: createFilter,						
		getGeoLayer: getGeoLayer,
		dataTableClick: dataTableClick,
		getMap: getMap,						
		changeCategory: changeCategory,						
		copyValToClipboard: copyValToClipboard,						
		changeBrewNum: changeBrewNum,						
	}		
}

// Auto complete widget function and initiation.
$( function() {
    $.widget( "custom.combobox", {
      _create: function() {
        this.wrapper = $( "<span>" )
          .addClass( "custom-combobox" )
          .attr('id', this.element.attr('id') + "_custom-combobox" )
          .insertAfter( this.element );
 
        this.element.hide();
        this._createAutocomplete();       
      },
 
      _createAutocomplete: function() {
        var selected = this.element.children( ":selected" ),
          //value = selected.val() ? selected.text() : "";
          value = "",
		  input = this.input;
 
        this.input = $( "<input>" )
          .appendTo( this.wrapper )
          .val( '' )
          .attr( "title", ui_objects_titles['col_sel_input_title'] )
          .addClass( "custom-combobox-input ui-widget ui-widget-content ui-state-default ui-corner-left" )          
          .autocomplete({
            delay: 0,
            minLength: 0,
            source: $.proxy( this, "_source" ),
			select: function (event, ui) {                    
               ui.item.value = "";  // it will clear field 
                return false;
            },
			keydown: function (event, ui) {                    
              console.log('click');
            },
			/*close: function (event, ui) {                    
				console.log(ui);
				this.value = '';
				//.input.value = "";  // it will clear field 
               // return false;
            }*/
          })
          /*.tooltip({
            classes: {
              "ui-tooltip": "ui-state-highlight"
            }
          })*/
		  .on( "click", function() {
			
			this.value =  "";			
			//console.log('click');		
			$(this).autocomplete('search','');
		  })

		  ;
 
        this._on( this.input, {
          autocompleteselect: "_autocompleteselect",
		  
          //autocompletechange: "_removeIfInvalid"
        });
      },
	  
	  _autocompleteselect: function( event, ui, external_val ) {
	

			if (this.element.attr("id") === 'col_select') {
				lgb.changeColumn(event, ui, external_val);
		    } else if (this.element.attr("id") === 'col_filter_select') {
				lgb.createFilter(event, ui);
			} else if (this.element.attr("id") === 'data_col_select0') {
				/*this._trigger( "select", event, {
				  item: ui.item.option
				});*/
				changeDataCol(event, ui);
				
				//console.log(this.input);
				//this.input.value = '';
				
			}

			//this.input.val("");
			if (ui && event) {
				ui.item.option.selected = true;			
				event.stopPropagation();
			}
			else {
				external_val.selected = true;
			}
			//event.preventDefault();
          },
	  
 
      _source: function( request, response ) {		 
       /* var matcher = new RegExp( $.ui.autocomplete.escapeRegex(request.term), "i" );
        response( this.element.children( "option" ).map(function() {
		  //console.log(this)	;
          var text = $( this ).text();		  
		  var cat_id = $(this).attr('data-cat_id');
		  // Check if the input text is like a select value or matches a value's category header.
          if ( this.value && ( !request.term || matcher.test(text) || matcher.test(cat_headers[cat_id]))) {
			  // console.log("matched %s %s %s $s", request.term, this, text, cat_id);
            return {
              label: text,
              value: text,
              option: this
            };
		  }
        }) );*/
		//console.log("in source");
			var matcher = new RegExp( $.ui.autocomplete.escapeRegex(request.term), "i" );
			var select_el = this.element.get(0); // get dom element	
			
			var rep = new Array(); // response array
			// simple loop for the options
			for (var i = 0; i < select_el.length; i++) {
				var cat_id = select_el.options[i].getAttribute('data-cat_id');
				//console.log(cat_id);
				var text = select_el.options[i].text;
				if ( select_el.options[i].value && ( !request.term || matcher.test(text) || matcher.test(categories_table_array[cat_id]) ) )
					// add element to result array
					rep.push({
						label: text, // no more bold
						value: text,
						option: select_el.options[i]
					});
			
				}
				// send response
			response( rep );
		},
 

 
      _destroy: function() {
        this.wrapper.remove();
		console.log("destroy");
        this.element.show();
      },
	  select: function(val) {
		 // console.log(val);
		  this._autocompleteselect(undefined,undefined, val);
		  
	  },       
    });
	// Initiate the display column selector combobox.
	$("#col_select").combobox();
	// Initiate the filter selector combobox.
	$("#col_filter_select").combobox();
	$("#data_col_select0").combobox(
		/*{_autocompleteselect: function(el) {
			console.log(el);
			el.target.value = '';
		}}*/
		);
	$("#data_col_select0_custom-combobox").addClass('data_col_select');
	document.querySelector("#data_col_select0_custom-combobox > input").setAttribute('placeholder',  ui_strings['choose_data_proc_col']);
	//document.querySelector("#data_col_select0_custom-combobox input").addEventListener("change", chnageDataCol);						

	
});

/*******************************************************************************************	
 Interface strings.
********************************************************************************************/
var ui_objects_titles = 
	{
		'emptySelection' : 'איפוס בחירה',
		//'colors_container' : 'שינוי צבע',
		'colors_container' : 'הגדרות',
		'showTable' : 'רשויות נבחרות',
		'refocus' : 'לחץ להתמקדות',
		'normalize' : 'נרמול לפי אוכלוסיה',
		'unnormalize' : 'חזרה לנתונים טבעיים',
		//'col_sel_input_title' : "לחץ לצפיה בסוגי הנתונים",
		'col_sel_input_title' : "בחר נתון",
		'next_data' : "הנתון הבא",
		'prev_data' : "הנתון הקודם",
		'category_select' : "בחירת קטגוריה",
		'column_select' : "בחירת טור להצגה",
	};
var ui_strings = 
	{
		"select_muni" : 'הצג פרופיל',
		"classybrew_methods" : 'שיטת סיווג נתונים',
		"quantile" : 'אחוזים',
		"equal_interval" : 'מרווחים שווים',
		"jenks_name" : 'חלוקה טבעית',
		"choose_classify_num" : 'מספר קבוצות מקרא',
		"data_proc_control" : 'עיבוד נתונים',
		"data_proc_header" : '<center class="data_proc_header">עיבוד נתונים</center>',
		"choose_data_proc_col" : 'בחר נתון',
		"system_name" : 'שם משתנה',
		"table_col_name" : 'שם נתון',
		"computed_cat" : 'נתונים מחושבים',
		"computed_alias" : 'נתון מחושב',
		"compute_and_display": "חשב והצג",
		"create_computed_data" : "יצירת נתון מחושב",
		"legend_toggle" : 'הצג/הראה',
		"legend_hint" : 'לחץ להצגה בטבלה',
		"paging_bubble" : 'דפדוף בין הנתונים',
		"link_copied" : "הקישור הועתק בהצלחה",
		"get_link": "לחץ להעתקת קישור למפה",
		"about" : "אודות",
		"external_cat"	: "נתונים נוספים",
		"normalize_title" : "לאלף איש",
		"population": "אוכלוסיה",
		"thousand_pop" : "אלף איש",
		"displayed_pop_str" : "אוכלוסיית היישוב היא",
		"from_displayed_pop" : "מהאוכלוסיה המוצגת",
		"pop_col_display" : "אלף איש מעודכן לסוף 2015",
		"total_population_str" : "סך האוכלוסיה ברשויות המוצגות",
		"create_filters" : "מסננים",
		"range" : "טווח",
		"muni_name" : "שם הרשות",
		//"empty_info_sub_title" : 'התמקד בעיר להצגת נתונים, ניתן לבחור עיר ע"י קליק כפול',
		//"empty_info_sub_title" : 'התמקד בעיר להצגת נתונים<br> ניתן לבחור ערים להשוואה בקליק כפול <br> או לבחור קבוצת נתונים מהמקרא',
		"empty_info_sub_title" : 'ניתן לבחור ערים להשוואה בקליק כפול <br> או לבחור קבוצת נתונים מהמקרא',
		"empty_info_sub_title_mobile" : 'ניתן לבחור ערים להשוואה בלחיצה<br> או לבחור קבוצת נתונים מהמקרא',
		"choose_display_col" : " בחר נתון להצגה",
		"choose_filter_col" : "סנן נתונים לפי",
		"greater" : "גדול מ-",
		"smaller" : "קטן מ-",
		"greater_e" : "גדול שווה ל-",
		"smaller_e" : "קטן שווה ל-",
		"equals" : "שווה ל-",
		"cbs_attribution" : "קובץ הרשויות המקומיות 2015, נתוני בחירות 2015 ונתונים ממפקד 2008",
		"selected_features_table_header" : "רשויות מסומנות",
		"selected_data_bubble" : "קיימות רשויות מסומנות",
		"user_normalize_action" : "ניתן להציג נתון זה ביחס לגודל האוכלוסייה",
		"increase_opacity" : "שקיפות שכבת רקע",
		"decrease_opacity" : "שקיפות שכבת רקע",
		"external_info" : '<b>נתוני בריאות הציבור</b><br> הנתונים נאספו ע"י גיא זומר<br>',
		"external_info_array" : {"בריאות" : '<b>נתוני בריאות הציבור</b><br> הנתונים נאספו ע"י גיא זומר<br>', 'בינוי' : '<b>נתוני משרד הבינוי</b><br> הנתונים נאספו ע"י גיא זומר<br>'
			, 'פשיעה' : '<b>המפה מבוססת על כמות אירועים שנפתחו במשטרת ישראל בשנים 2012-2015, על בסיס בקשת מידע שנענתה, ביחס לכמות התושבים ברשות המקומית בהתאם לנתוני הלמ"ס </b><br> הנתונים נאספו ע"י גיא זומר<br>'},
	};
var ui_strings_w_yarok = 
	{		
		"external_info" : '<b>המפה מבוססת על כמות אירועים שנפתחו במשטרת ישראל בשנים 2012-2015, על בסיס בקשת מידע שנענתה, ביחס לכמות התושבים ברשות המקומית בהתאם לנתוני הלמ"ס </b><br> הנתונים נאספו ע"י גיא זומר<br>',		
	};
var ui_objects_titles_w_yarok = {};
var ui_objects_titles_ta = 
	{		
		'showTable' : 'אזורים נבחרים',		
	};
var ui_strings_ta = 
	{		
		"displayed_pop_str" : "אוכלוסיית האזור הסטטיסטי היא",		
		"pop_col_display" : "",
		"total_population_str" : "סך האוכלוסיה באזורים המוצגים ",		
		"muni_name" : "מספר האזור",		
		"cbs_attribution" : "נתונים ממפקד 2008",
		"selected_features_table_header" : "אזורים מסומנים",	
		"selected_data_bubble" : "קיימים אזורים מסומנים"
	};
	
		var ui_objects_titles_us = 
	{		
		'emptySelection' : 'Clear selection',
		'colors_container' : 'Change color',
		'showTable' : 'Selected states',
		//'refocus' : 'לחץ להתמקדות',
		'refocus' : 'Default zoom',
		'normalize' : 'Normalize by population',
		'unnormalize' : 'Original data',
		//'col_sel_input_title' : "לחץ לצפיה בסוגי הנתונים",
		'col_sel_input_title' : "Variable to display",
		'next_data' : "Next variable",
		'prev_data' : "Prev variable",
		'category_select' : "Category picker",
		'column_select' : "Variable to display",	
	};
var ui_strings_us = 
	{		
		"legend_toggle" : 'Show/Hide',
		"legend_hint" : 'Click for table display',
		"paging_bubble" : 'Next/Previous variable',
		"link_copied" : "Link copied",
		"get_link": "Click to get a direct link",
		"about" : "about",
		//"external_cat"	: "נתונים נוספים",
		"normalize_title" : "Per thousand",
		"population": "Population",
		"thousand_pop" : "Thousand people",
		"displayed_pop_str" : "The stats's population is: ",
		"from_displayed_pop" : "From the displayed population",
		"pop_col_display" : "Thousand people",
		"total_population_str" : "Total populaion in the displayed states",
		"create_filters" : "Filters",
		"range" : "range",
		"muni_name" : "State name",
		//"empty_info_sub_title" : 'התמקד בעיר להצגת נתונים, ניתן לבחור עיר ע"י קליק כפול',
		"empty_info_sub_title" : 'Hover on a state for details<br> Select a state with double click <br> Or select a legend group from the legend ',
		"empty_info_sub_title_mobile" : 'Select a state with a mouse click<br> Or use the legend to select groups',
		"choose_display_col" : "Choose data to display",
		"choose_filter_col" : "Create a filter",
		"greater" : "Greater than",
		"smaller" : "Smaller than",
		"greater_e" : "Greater or Equal to",
		"smaller_e" : "Smaller or equal to",
		"equals" : "Equal to",
		"cbs_attribution" : "US 2010 Census data",
		"selected_features_table_header" : "Selected states",
		"selected_data_bubble" : "There is an active selection",
		"user_normalize_action" : "This variable can be normalized by population",
		"increase_opacity" : "Base layer opacity",
		"decrease_opacity" : "Base layer opacity",
		"external_info" : '',
	};	