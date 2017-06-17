function createDataTable1() {
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
			console.log(createDataTable1());
			return table_hdr + "</thead>" + table + "</div>";
		}
		else
			return null;
		
		
	}

	function createDataTable2() {
		var is_normalized = document.getElementsByClassName('normalizedLeg').length;
		var table = "";
		var right_table = "";
		var z = 1;
		//var table += "<table id='selected_features_table'>";
		geojsonLayer.eachLayer(function (layer) {
			if (layer.feature.selected == 1 && layer.feature.style == 1 && layer.filtered == 0) {
				table += table.length > 0 ? '' : "<tbody class='overflow'>";
				right_table += right_table.length > 0 ? '' : "<tbody class='overflow'>";
				// Create the table row and the name column.
				var props = layer.feature.properties;
				var select_type = layer.feature.manual_selected > 0 ? 'manual-select' : '';
				right_table += "<tr class='action " + select_type + "' data-id='"
					//+ layer.feature.properties[getCurrentHeaderArray(unique_id_col_name).name] + "'"
					+ layer._leaflet_id + "'"
					+ " title='" + props[name_prop] + "'"+">";
				right_table += "<td class='index-col'>" + z + "</td>";
				right_table += "<td class='muni_table_name'>" + props[name_prop] + "</td>";
				// Add display column value.

				var displayed_value = parseFloat(eliminateStringsInNumbers(props[current_comn_name]))
						? formatNumberToDisplay(eliminateStringsInNumbers(props[current_comn_name]))
						: props[current_comn_name];
					//	console.log(parseFloat(props[current_comn_name]));
					//	console.log(props[current_comn_name]);
				displayed_value = !displayed_value && displayed_value != 0 ? '-' : displayed_value;

				table += "<tr class='action " + select_type + "' data-id='"
					//+ layer.feature.properties[getCurrentHeaderArray(unique_id_col_name).name] + "'"
					+ layer._leaflet_id + "'"
					+ " title='" + props[name_prop] + "'"+">" + 
					'<td>' + displayed_value + '</td>';
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
				right_table += "</tr>";
				table += "</tr>";
				z++;
			}
		})
		if (table.length > 0) {
			// Create the table headers
			var right_table_hdr = "<div id='emptySelection' title='"+ ui_objects_titles['emptySelection'] +"' class='emptySelection refocus'>&#9746</div>"
				+ "<div id='table_container'><div id='freeze_container'><table id='selected_features_table_right' class='data-table freeze_table'>";
			var table_hdr =  "<table id='selected_features_table' class='data-table'><thead><tr class='tblTitle'>";
			right_table_hdr += "<thead><tr class='tblTitle'><th class='index-col'><div class='loading-th'></div></th>"
				+"<th class='user_action' data-num=0><div> " + ui_strings['muni_name'] + " </div></th>";
			table_hdr += "<th class='user_action' data-num=1><div title='" + getCurrentHeaderAlias() + "' >" + getCurrentHeaderAlias() + "</div></th>";
			if (is_normalized > 0 ) {
				table_hdr += "<th class='user_action' data-num=2><div title='" + getCurrentHeaderAlias() + "' >" + getCurrentHeaderAlias() + " " + ui_strings['normalize_title'] + "</div></th>" ;
			}
			for (var i=0; i < active_filter_array.length; i++) {
				table_hdr += "<th class='user_action' data-num=" + (i + 2) + "><div title='" + active_filter_array[i].name + "'>" + active_filter_array[i].name + "</div></th>"
			}
			table += "</tbody></table>";
			table = "<div id='horizontal_scrolling_div'>" + table_hdr + "</tr></thead>" + table + '</div>';
			right_table += "</tbody></table></div>";
			right_table = right_table_hdr +  "</tr></thead>" + right_table;
			//document.getElementById("selected_table_header").innerHTML = (z - 1) + " " + ui_strings['selected_features_table_header'];
			//console.log(createCleanDataTable());
			return right_table + table + "</div>";			
		}
		else
			return null;
	}