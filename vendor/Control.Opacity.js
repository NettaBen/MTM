/*
        Leaflet.OpacityControls, a plugin for adjusting the opacity of a Leaflet map.
        (c) 2013, Jared Dominguez
        (c) 2013, LizardTech

        https://github.com/lizardtechblog/Leaflet.OpacityControls
*/

//Declare global variables
var opacity_layer;
var opacity_layers = [];

//Create a control to increase the opacity value. This makes the image more opaque.
L.Control.higherOpacity = L.Control.extend({
    options: {
        position: 'topright'
    },
    setOpacityLayer: function (layer) {	            
			var curr_num = this._container.id.slice(-1);		
            opacity_layers[curr_num] = layer;
			
    },
    onAdd: function () {
        
        var higher_opacity_div = L.DomUtil.create('div', 'higher_opacity_control');
		higher_opacity_div.id = document.getElementsByClassName('higher_opacity_control').length > 0 
			? 'h_opacity' + document.getElementsByClassName('higher_opacity_control').length : 'h_opacity0';	
		
        L.DomEvent.addListener(higher_opacity_div, 'click', L.DomEvent.stopPropagation)
            .addListener(higher_opacity_div, 'click', L.DomEvent.preventDefault)
            .addListener(higher_opacity_div, 'click',  onClickHigherOpacity );
        //opacity_layer = streets;
        return higher_opacity_div;
    }
});

//Create a control to decrease the opacity value. This makes the image more transparent.
L.Control.lowerOpacity = L.Control.extend({
    options: {
        position: 'topright'
    },
    setOpacityLayer: function (layer) {        
		var curr_num = this._container.id.slice(-1);
        opacity_layers[curr_num] = layer;
    },
    //},
    onAdd: function (map) {
        
        var lower_opacity_div = L.DomUtil.create('div', 'lower_opacity_control');
				lower_opacity_div.id = document.getElementsByClassName('lower_opacity_control').length > 0 
			? 'l_opacity' + document.getElementsByClassName('lower_opacity_control').length : 'l_opacity0';		

        L.DomEvent.addListener(lower_opacity_div, 'click', L.DomEvent.stopPropagation)
            .addListener(lower_opacity_div, 'click', L.DomEvent.preventDefault)
            .addListener(lower_opacity_div, 'click', onClickLowerOpacity);        
        return lower_opacity_div;
    }
});

//Create a jquery-ui slider with values from 0 to 100. Match the opacity value to the slider value divided by 100.
L.Control.opacitySlider = L.Control.extend({
    options: {
        position: 'topright'
    },
    setOpacityLayer: function (layer) {
            opacity_layer = layer;
    },
    onAdd: function (map) {
        var opacity_slider_div = L.DomUtil.create('div', 'opacity_slider_control');
        
        $(opacity_slider_div).slider({
          orientation: "vertical",
          range: "min",
          min: 0,
          max: 100,
          value: 60,
          step: 10,
          start: function ( event, ui) {
            //When moving the slider, disable panning.
            map.dragging.disable();
            map.once('mousedown', function (e) { 
              map.dragging.enable();
            });
          },
          slide: function ( event, ui ) {
            var slider_value = ui.value / 100;
            opacity_layer.setOpacity(slider_value);
          }
        });
        
        return opacity_slider_div;
    }
});


function onClickHigherOpacity(e) {	
	var num = e.target.id.replace('h_opacity', '');	
	var curr_layer = opacity_layers[num];    
	curr_layer.options.opacity =  curr_layer.options.opacity ?  curr_layer.options.opacity : 0.7;
    var opacity_value = curr_layer.options.opacity ;
    if (opacity_value > 1) {
        return;
    } else {
        curr_layer.setOpacity(opacity_value + 0.1);
        //When you double-click on the control, do not zoom.
        /*map.doubleClickZoom.disable();
        map.once('click', function (e) { 
            map.doubleClickZoom.enable();
        });*/
    }

}

function onClickLowerOpacity(e) {
	var num = e.target.id.replace('l_opacity', '');	
	var curr_layer = opacity_layers[num];    
    var opacity_value = curr_layer.options.opacity ? curr_layer.options.opacity : 0.7;    
    if (opacity_value < 0) {
        return;
    } else {
        curr_layer.setOpacity(opacity_value - 0.1);
        //When you double-click on the control, do not zoom.
        /*map.doubleClickZoom.disable();
        map.once('click', function (e) { 
            map.doubleClickZoom.enable();
        });*/
    }
      
}

