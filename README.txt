## Mind The Map
## This project aim is to be an infrastructure for displaying vast amounts of spatial statistical data for a polygon group.
   The data is stored in geojson file, displayed on leaflet and classified by classybrew.

   Files   
## js_func.js
## function leafletGeoBrew
	filename: geojson file 
	current_comn_name: the first column (data series) to display
	default_color: default color scheme
	name_prop: geojson attribute that holds the entities names	
	normalize_col: geojson attribute that holds the entities poplulation 
	unique_id_col_name: geojson attribute with unique values to each entity
	first_visit: (interface - cookies) 
	ui_name = null : Customized ui strings suffix
	type_muni = null : Extra display data for the info div
	reg_muni_file = null: Extra polygon file
	curr_leaf = null : (interface) 
	papa = null : External file
	normalize_link = 0 : Initiate normalized by poplulation
	csv_object = null : External CSV object (Output of parseCSVByObject)
	show_extra = null : (Interface : show data processing utility)
	rtl=0 : Interface direction
## ex_js_func.js
   General functions
## style_data.css
   Main CSS
## style_mobile_data.css
   Mobile CSS
## Dependencies
	css/jquery-ui.css
	https://code.jquery.com/jquery-1.10.1.min.js
	https://code.jquery.com/ui/1.10.1/jquery-ui.min.js
	https://unpkg.com/leaflet@1.0.3/dist/leaflet.css
	https://unpkg.com/leaflet@1.0.3/dist/leaflet.js
	Control.Geocoder.css
	Control.Geocoder.js
	Control.Opacity.css
	Control.Opacity.js		
	leaflet.ajax.js	
	classybrew.js
	dist/papaparse.min.js
	js.cookie.js
    
## How To:
 INITIATE:
 CREATE FILES:
 CREATE TABLES:
 
 
 
 
		