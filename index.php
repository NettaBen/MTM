<html>
<head>
	
	<title>רשויות מקומיות 2015</title>

	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=0.8">
	<link rel="icon" type="image/ico" href="favicon.ico">
	<link rel="shortcut icon" type="image/x-icon" href="docs/images/favicon.ico" />
	<link rel="stylesheet" href="style_data.css?v=1.1" />
	<link rel='stylesheet' media='screen and (max-device-width: 800px)' href='style_mobile_data.css?v=1.11'>
	<link rel='stylesheet'  href='balloon.css'>
	<link rel="stylesheet" href="css/jquery-ui.css" />
	<script src="https://code.jquery.com/jquery-1.10.1.min.js"></script>
	<script src="https://code.jquery.com/ui/1.10.1/jquery-ui.min.js"></script>
	<script type="text/javascript" src="table_vars.js?v=1.2"></script>	
	<script type="text/javascript" src="js_func_data.js?v=1.2"></script>	
	<script type="text/javascript" src="ex_js_func.js?v=1.2"></script>	
	<link rel="stylesheet" href="https://unpkg.com/leaflet@1.0.3/dist/leaflet.css" />
	<!--<link rel="stylesheet" href="leaflet.css" />-->
	<script src="https://unpkg.com/leaflet@1.0.3/dist/leaflet.js"></script>
	<link rel="stylesheet" href="Control.Geocoder.css" />
	<script src="Control.Geocoder.js"></script>
	<link rel="stylesheet" href="Control.Opacity.css" />
	<script src="Control.Opacity.js"></script>
	<!--<script src="leaflet.js"></script>-->
	<!--<script src="proj4.js"></script>
	<script src="proj4leaflet.js"></script>
	<script src="EPSG2039.js"></script>-->
	<script src="leaflet.ajax.js"></script>
	<!--<script src="classybrew_c_min.js"></script>-->
	<script src="classybrew.js"></script>
	<script src="dist/papaparse.min.js"></script>
	<script src="js.cookie.js"></script>
	<style>
	</style>
	 <script>  </script>
	
</head>
<body>

<!--[if IE]>
    <p>Notice: This page is not supported in your current browser, the recommended browser for this page is Google Chrome.</p>
        <![endif]-->
<!--<div id="loading">
	<img id="loading-image" src="instructions.gif" alt="Loading..." />
</div>-->
<!--<div id="map_header"> נתוני רשויות בישראל - למ"ס 2015  , נתוני בחירות 2015 ונתונים נבחרים ממפקד 2008-->
<!--[if !IE]>-->
<div id="fb-root"></div>
<script>(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.9&appId=1868872366719384";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));</script>
<span id="map_header"> רשויות מוניציפליות - ישראל
	<div id='open_help' data-balloon="אודות" data-balloon-pos='right' onclick='openModal()' class='help' readonly='true' title='About'></div>
	<div class="fb-like" data-href="https://www.facebook.com/MindTheMapIsrael/" data-layout="button" data-action="like" data-size="small" data-show-faces="false" data-share="false"></div>
	<!--<div id='reclassify' class='next reclassify' readonly='true' title='Next Map...'>☛</div>
	<div id='reclassifyb' class='prev reclassify' readonly='true' title='Prev Map...'>☚</div>-->
</span>
<!--<div data-tap-disabled="true">-->
<div id='content-wrapper'>
	<div id='map' class='map_class wide_map double_pane'></div>
	<div id='data_proc' class='data_proc' style='display:none;'>
		<span> <script>document.write(ui_strings['data_proc_header']);</script><center><div id='select_wrapper' class='select_wrapper' style="display:inline-block;">
			<select id='data_col_select0' class='data_col_select' ></select>
		</div></center><div id='data_col_alias0'></div></span>
		<div id='data_proc_table_wrapper'></div>
	</div>
</div><!--</div>-->
<select id='col_select' display='none'  class='col_select' ></select>
<select id='col_filter_select' display='none' class='col_select' ></select>


<div id="info_modal" class="modal">
  <!-- Modal content -->
  
  <div class="modal-content">
	<span class="close_modal" onclick="closeModal()">&times;</span>   
	
	<div id='modal-text'>		
		<div id="loading_div"></div>
		<p><h3>Mind The Map</h3></p>
		<p><h3>אטלס אינטראקטיבי למידע על רשויות בישראל</h3></p>
		<p>מפה דינמית זו מאפשרת צפיה ביותר מ800 סוגי נתונים על רשויות בישראל</p>
		<p>בין סוגי המידע: נתונים פיזיים ופיננסיים, נתוני בחירות, נתוני בריאות, פשיעה, מחירי דיור ועוד</p>
		<p>מפות אלה מספרות סיפורים שונים על הישובים במדינת ישראל</p>
		<p>מתי הישוב נוסד? מהי ההתנהלות התקציבית שלו? כמה תושביו מרוויחים? מהי רמת הפשיעה בישוב? באיזה גיל עוזבים את הישוב?</p>
		<p>ב-Mind The Map תוכלו למצוא תשובות לשאלות אלה ורבות אחרות </p>
		<p>המפה מאפשרת סימון ישובים, דפדוף מהיר בין הנתונים, סינון נתונים ועוד</p>
		<!--<p>ב-2015 גרו בישראל 8463.4 אלפי אנשים ב-255 רשויות<p>
		<p>76 עיריות, 125 מועצות מקומיות ו-54 מועצות אזוריות</p>
		<p>74.8% מהאוכלוסייה גר בערים, 15.1% גר במועצות מקומיות ו-10.2% במועצות האזוריות</p>		-->
		
		<div id="instructions-image"></div>
		<p class='info_header'>הצגת נתונים</p>
		<p>לחיצה על שם הנתון תפתח את רשימת הנתונים בקטגוריה</p>
		<p>ניתן לדפדף בין הנתונים בעזרת החיצים ליד שם הנתון</p>
		<p class='info_header'>סינון נתונים</p>
		<p>בחירת נתון בתיבת הבחירה תייצר מסנן אינטראקטיבי</p>
		<p>התמקדות ברשות תציג נתונים על הרשות לפי הנתון הראשי והמסננים</p>
		<p class='info_header'>מקרא</p>
		<p>לחיצה על שורת מקרא תסמן את הרשויות להצגה בטבלה</p>
		<p>ניתן לסנן את התצוגה בעזרת המקרא בעזרת כפתור Hide</p>				
		<p>כאשר מופיע ℕ במקרא, ניתן לשנות את צורת ההצגה לפי גודל האוכלוסיה</p>					
		<p class='info_header'>טבלת נתונים</p>
		<p>לחיצה כפולה על ישוב תסמנו להצגה בטבלה</p>
		<p>ניתן לסמן ישובים להצגה מהמקרא</p>
		<p>ניתן למיין את טבלת הנתונים ע"י לחיצה על כותרת הטור למיון</p>
		<p class='info_header'>פעולות כלליות</p>
		<p>שינוי צבעי הצגה, מדרגות צבע וצורת פילוח נתונים</p>
		<p>החלפת שכבת רקע</p>
		<p>חיפוש כתובת או ישוב</p>
		<p> &nbsp </p>
		<p>המידע נאסף מהמקורות הבאים</p>
		<p><a href='http://www.cbs.gov.il/reader/?MIval=cw_usr_view_SHTML&ID=357' target=_'blank'>- קובץ היישובים לעיבוד למ"ס 2015</p>
		<p><a href='http://votes20.gov.il/'  target=_'blank'>- נתוני בחירות 2015 - ועדת הבחירות המרכזית לכנסת ה-20</a></p>
		<p><a href='http://www.cbs.gov.il/census/census/pnimi_page.html?id_topic=12' target=_'blank'>- לוח מסכם 3א של מפקד 2008</a></p>
		<p>המידע על מצב הפשיעה, נתוני הבריאות ונתוני הדיור בישראל נאספו ע"י גיא זומר</p>
		<p> הנתונים הוקטוריים של יישובי ישראל <a href='http://iplan.gov.il/Pages/Professional%20Tools/GeographicInformation/GeographicInformation/new-geo/gvul-shiput.aspx' target=_'blank'> ממנהל התכנון</a></p>
		<p> נתונים וקטוריים על רשויות חסרות הושלמו <a href='https://github.com/idoivri/israel-municipalities-polygons' target=_'blank'> בעזרת עידו עברי </a></p>
		<p>Designed and developed by <a href=mailto:beninson@gmail.com?Subject=MindTheMap> Netta Beninson</a></p>
		<p style='direction: ltr'>✧<a href='http://leafletjs.com/' target='_blank' >Leaflet</a> is amazing✧</p>
	</div>
</div>


<script type="text/javascript">
	var lgb;
	var header_options = '';	
	for (var header_option_cat in header_options_by_cat) {
		if 	(header_option_cat > 0)
			header_options += header_options_by_cat[header_option_cat];		
	}
	//console.log(header_options);
	header_options += header_options_by_cat[0];
	
	document.getElementById("col_select").innerHTML = "<option></option>" + header_options;
	document.getElementById("col_filter_select").innerHTML = "<option></option>" + header_options;	
	document.getElementById("data_col_select0").innerHTML = "<option></option>" + header_options;
	
	var external_data_def = {"external_filename" : "all_external_fixed.csv", "name_column" : 0, "id_column" : -1, "header_line" : 4, 
		"cat_line" : 0, "column_action_line" : 3, 'start_col' : 3, 'start_line' : 5, 'source_line' : 1};
	//var external_data_def = {"external_filename" : "israel_health_new.csv", "name_column" : 0, "id_column" : -1, "header_line" : 1, "cat_line" : '', "column_action_line" : 0, 'start_col' : 5, 'start_line' : 2};
	//var external_data_def = {"external_filename" : "wages_new.csv", "name_column" : -1, "id_column" : 2, "header_line" : 1, "cat_line" : '', "column_action_line" : 0, 'start_col' : 5, 'start_line' : 2};
	//var external_data_def = {"external_filename" : "health_israel_semel.csv", "name_column" : -1, "id_column" : 0, "header_line" : 0, "cat_line" : '', "column_action_line" : '', 'start_col' : 1, 'start_line' : 1};
	//var external_data_def = {"external_filename" : "edu_data - Copy.csv", "name_column" : '', "id_column" : 0, "header_line" : 0, "cat_line" : '', "column_action_line" : ''};
	//var external_data_def = {"external_filename" : "crime_data_after_proc_.csv", "name_column" : 0, "id_column" : -1, "header_line" : 0, "cat_line" : '', "column_action_line" : '', 'start_col' : 2, 'start_line' : 1};
	//var external_data_def = {"external_filename" : "security.csv", "name_column" : 0, "id_column" : -1, "header_line" : 0, "cat_line" : '', "column_action_line" : '', 'start_col' : 1, 'start_line' : 1};

	var csv_object = parseCSVByObject(external_data_def);
	//console.log(csv_object);
	
	var header_alias_count = header_name_to_alias.length;
	
	var csvInterval = setInterval(function() { 
		if (header_name_to_alias.length > header_alias_count) {
			clearInterval(csvInterval);
			var url_col_name = getUrlParam('col_id', null);
	
			var url = window.location.pathname;	
			var curr_leaf = url.substring(url.lastIndexOf('/')+1);
			//console.log(curr_leaf);
			//console.log(window.location.pathname);
			//window.location.origin  + window.location.pathname + index
			
			var normalize_link = getUrlParam('normalize', 0);
			if (normalize_link ) {		
				setNormalizeCookie(normalize_link, curr_leaf);
			} else {
				normalize_link = 0;
			}
			
			var last_attr = getDisplayCookie(curr_leaf);
			//console.log(getDisplayCookie());
			var res_param = header_name_to_alias.filter(function( obj ) {
				return obj.name === last_attr;
			});	
			last_attr = (res_param.length > 0 ) ? last_attr : "";
			// console.log(url_col_name);
			var result = header_name_to_alias.filter(function( obj ) {
				return obj.name === url_col_name;
			});	
			url_col_name =  (result.length > 0) ? url_col_name : last_attr;			
			url_col_name = url_col_name.length > 0 ?  url_col_name : "a14";
			
			var first_visit = (!getDisplayCookie(curr_leaf) || getDisplayCookie(curr_leaf) === "a14") ? true : false;
			
			
			//console.log(first_visit, normalize_link);
			//console.log(url_col_name);
			// Initialize geojson in leaflet with color brew.
			lgb = leafletGeoBrew("israel_201_muni.json", url_col_name, "YlRPu", 'muni_heb', "a14" , "semel", undefined,"", "a4"
					,"israel_reg_muni_53.geojson" , curr_leaf, "crime_data_after_proc_.csv", normalize_link, csv_object, 1);						
		}
	}, 10)
	
	
	// "muni_reg_2015_1.json"
	
	//console.log(csv_object);

		
</script>
<!-- <![endif]-->
</body>
</html>