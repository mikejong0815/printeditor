//initailize Canvas
canvas = new fabric.Canvas('canvas');
var canvas_width_org, canvas_height_org, actual_width, actual_height;
var selectedItem;
var zoom_control;
var min_stroke;
var boundingRect;
var selectedGrid;
var serialNumber;
var intervalId;
var canvas_bg = '';
var working_grid_id;

//Clear Canvas
function clearCanvas(){
	var obj_list = canvas.getObjects();
	for(i=obj_list.length-1; i>=0;i--){
		canvas.remove(obj_list[i]);
	}
}

//Show Loading Blanket
function showLoader(){
	$("div.loading_blanket").fadeIn(500);
}

//Hide Loading Blanket
function hideLoader(){
	$("div.loading_blanket").fadeOut(500);
}

//add bounding rect for the grids
function addBoundingRect(){
	/*boundingRect = {
		left: 50 * canvas_height_org/1106,
		top: 50 * canvas_height_org/1106,
		bottom: canvas_height_org - 50 * canvas_height_org/1106,
		right: canvas_width_org - 50 * canvas_height_org/1106,
	};*/
	boundingRect = {
		left: 0,
		top: 0,
		bottom: canvas_height_org,
		right: canvas_width_org,
	};
	canvas.on("object:moving",function() {
		var top = selectedItem.top;
		var bottom = top + selectedItem.height * selectedItem.scaleY;
		var left = selectedItem.left;
		var right = left + selectedItem.width * selectedItem.scaleX;

		selectedItem.setLeft(Math.min(Math.max(left, boundingRect.left), boundingRect.right - selectedItem.width * selectedItem.scaleX));
		selectedItem.setTop(Math.min(Math.max(top, boundingRect.top), boundingRect.bottom - selectedItem.height * selectedItem.scaleY));
	})
}

canvas.createSVGFontFacesMarkup = function() {
	var markup = '', font_import = '', fontList = { }, obj, fontFamily,
		style, row, rowIndex, _char, charIndex,
		fontPaths = fabric.fontPaths, objects = this.getObjects();

	for (var i = 0, len = objects.length; i < len; i++) {
		obj = objects[i];
		fontFamily = obj.fontFamily;
		if (obj.type.indexOf('text') === -1 || fontList[fontFamily] || !fontPaths[fontFamily]) {
			continue;
		}
		fontList[fontFamily] = true;
		if (!obj.styles) {
			continue;
		}
		style = obj.styles;
		for (rowIndex in style) {
			row = style[rowIndex];
				for (charIndex in row) {
				_char = row[charIndex];
				fontFamily = _char.fontFamily;
				if (!fontList[fontFamily] && fontPaths[fontFamily]) {
					fontList[fontFamily] = true;
				}
			}
		}
	}

	for (var j in fontList) {
		markup += [
			'\t\t@font-face {\n',
			'\t\t\tfont-family: \'', j, '\';\n',
			'\t\t}\n'
			].join('');
	}

	for (var j in fontList) {
		font_import += ['\t\t@import url(\'', fontPaths[j], '\');\n'].join('');
	}

	if (markup) {
		markup = [
			'\t<style type="text/css">',
			font_import,
			'<![CDATA[\n',
			markup,
			']]>',
			'</style>\n'
			].join('');
	}

	return markup;
}

//Show Image Selector Popup
function imageSelector() {
	$(".list_item").removeClass("loaded");
	var data = {
		'action': 'get_main_cateogry',
	};
	$.post(ajax_object.ajax_url, data, function(response) {
		var terms = JSON.parse(response);
		var str = '<ul class="image_category_list main">';
		if(terms.length > 0){
			for(i=0;i<terms.length;i++)
				str += '<li class="list_item" cat_id="'+terms[i].term_id+'" onclick="getSubCategories(' + terms[i].term_id + ')" >' + terms[i].name + '</li>';
		} else {
			str += '<li>No Images</li>';
		}
		str += '</ul>';
		$("#imageButton").popover({
			title: 'Select an Image <a href="javascript:;" onclick="$(\'#imageButton\').popover(\'dispose\');"></a>',
			html: true,
			trigger: 'manual',
			content: str,
		});
		$("#imageButton").popover('toggle');
	});
}

// Populates the Main Category on click
function getSubCategories(catID) {
	if($(".list_item[cat_id='" + catID + "']").hasClass('loaded'))
		return;
	var data = {
		'action': 'get_images_category',
		'cat_id': catID
	};
	$.post(ajax_object.ajax_url, data, function(response) {
		var cats=JSON.parse(response);
		var cat_id = cats.cat_id;
		var result = cats.result;
		var str = "";
		if(result.length > 0){
			str = '<ul class="image_category_list sub">';
			for(i = 0; i < result.length; i ++){
				str += '<li class="list_item" cat_id="' + result[i][0] + '" onclick="loadCategoryImages(' + result[i][0] + ')">';
				str += result[i][1];
				str += '</li>';
			}
			str += '</ul>';
		}
		$(".list_item[cat_id='" + cat_id + "']").append(str);
		$(".list_item[cat_id='" + cat_id + "']").addClass('loaded');
	});
}

//Populate the Sub Category on click
function loadCategoryImages(catID) {
	if($(".list_item[cat_id='" + catID + "']").hasClass('loaded')){
		return;
	}
	var data = {
		'action': 'get_images',
		'cat_id': catID,
	};
	$.post(ajax_object.ajax_url, data, function(response) {
		var images=JSON.parse(response);
		var cat_id = images.cat_id;
		var result = images.result;
		var str = "";
		if(result.length > 0) {
			str = '<ul class="category_images sub">';
			for(i = 0; i < result.length; i ++){
				str += '<li class="image_item" onclick="drawImage(\'' + result[i].image_url + '\',' + result[i].minimum_image_width + ', ' + result[i].minimum_image_height + ')">';
				str += '<img src="' + result[i].thumb_url + '" /><label>' + result[i].title + '</label>';
				str += '</li>';
			}
			str += '</ul>';
		}
		$(".list_item[cat_id='" + cat_id + "']").append(str);
		$(".list_item[cat_id='" + cat_id + "']").addClass('loaded');
	});
}

const toDataURL = url => fetch(url)
  .then(response => response.blob())
  .then(blob => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  }))

// Draw Image to the Canvas
function drawImage(url, min_width, min_height) {
	$("#imageButton").popover('dispose');
	fabric.Image.fromURL(url, function(oImg) {
		var minScaleX = parseFloat(min_width) / parseFloat(oImg.width);
		var minScaleY = parseFloat(min_height) / parseFloat(oImg.height);
		var minScale = 0.5;
		if(minScaleX >= minScaleY)
			minScale = minScaleX;
		else
			minScale = minScaleY;
		oImg.minScaleLimit = minScale;
		oImg.on('selected', function(){
			doSelectedAction(this);
		});
		oImg.on('deselected', function(){
			doDeselectAction(this);
		});
		oImg.setScaleX(minScale);
		oImg.setScaleY(minScale);
		oImg.setOriginX('left');
		oImg.setOriginY('top');
		oImg.setLeft((boundingRect.left + boundingRect.right)/2 - oImg.width/2*minScale);
		oImg.setTop((boundingRect.top + boundingRect.bottom)/2 - oImg.height/2*minScale);
		canvas.add(oImg);
	});
}

// Draw Text to the Canvas
function drawText() {
	var font_family = $(".font_options:first-child").attr('value');
	var min_font_size = $(".font_options:first-child").attr('min_font_size');
	var text = new fabric.Text('Your Text');
	text.setFontSize(min_font_size);
	text.setFontFamily(font_family);
	text.minScaleLimit = 1;
	text.on('selected', function(){
		doSelectedAction(this);
	});
	text.on('deselected', function(){
		doDeselectAction(this);
	});
	canvas.add(text);
}

//Event Handler for Grid changing
function gridOptionChanged() {
	var grid_id = $('#grid_selector').val();
	updateGrid(grid_id);
}

//Refresh Canvas
function refreshCanvas() {
	var grid_id = $('#grid_selector').val();
	if(!grid_id) {
		grid_id = $("#grid_selector option:first-child").val();
	}
	var data = {
		'action': 'get_grid_info',
		'grid_id': grid_id,
	};
	$.post(ajax_object.ajax_url, data, function(response) {
		grid_info = JSON.parse(response);
		canvas.clear();
		canvas.setHeight(grid_info.height);
		canvas.setWidth(grid_info.width);
		canvas_height_org = parseInt(grid_info.height);
		canvas_width_org = parseInt(grid_info.width);
		actual_width = grid_info.actual_width;
		actual_height = grid_info.actual_height;
		canvas.setBackgroundImage(grid_info.image_url,canvas.renderAll.bind(canvas), {
		    backgroundImageOpacity: 1,
		    backgroundImageStretch: true,
		    width: parseInt(canvas.width),
		    height: parseInt(canvas.height),
		    originX: 'left',
  			originY: 'top'
		});
		addBoundingRect();
		zoomCanvas(25);
		zoom_control.setPercentage(25);
	});
}

//Update Grid with new Grid Pattern
function updateGrid(grid_id) {
	working_grid_id = grid_id;
	var data = {
		'action': 'get_grid_info',
		'grid_id': grid_id,
	};
	selectedGrid = grid_id;
	$.post(ajax_object.ajax_url, data, function(response) {
		grid_info = JSON.parse(response);
		canvas.setHeight(grid_info.height);
		canvas.setWidth(grid_info.width);
		canvas_height_org = parseInt(canvas.height);
		canvas_width_org = parseInt(canvas.width);
		actual_width = canvas.actual_width;
		actual_height = canvas.actual_height;
		$("#grid-title-holder").html(grid_info.grid_title);
		canvas.setBackgroundImage(grid_info.image_url,canvas.renderAll.bind(canvas), {
		    backgroundImageOpacity: 1,
		    backgroundImageStretch: true,
		    width: parseInt(canvas.width),
		    height: parseInt(canvas.height),
		    originX: 'left',
  			originY: 'top'
		});
		addBoundingRect();
	});
}


//Event Handler for Selecting Canvas Objects Event
function doSelectedAction(fObj) {
	selectedItem = fObj;
	switch(selectedItem.type){
		case 'image': //Handles Selected Event for image objects
			break;
		case 'line': //Handles Selected Event for line objects
			$(".stroke_width").val(selectedItem.strokeWidth);
			$(".line-customizer").fadeIn(500);
			break;
		case 'text': //Handles Selected Event for text objects
			$("#text_content").val(selectedItem.text);
			$("#font_selector").val(selectedItem.fontFamily);
			$(".text-customizer").fadeIn(500);
			break;
		default: //Handles Selected Event for rectangle, triangle and circle objects
			if( selectedItem.fill == 'transparent' )
				document.getElementById('fill_objects').checked = false;
			else
				document.getElementById('fill_objects').checked = true;
			if(selectedItem.strokeWidth >= min_stroke)
				$(".stroke_width").val(selectedItem.strokeWidth);
			else
				$(".stroke_width").val(min_stroke);
			$(".default-customizer").fadeIn(500);
			break;
	}
}

//Event Handler for Deselecting Canvas Objects Event
function doDeselectAction(fObj) {
	switch(fObj.type){
		case 'image': //Handles Event for image objects
			break;
		case 'line': //Handles Event for line objects
			$(".line-customizer").fadeOut(500);
			break;
		case 'text': //Handles Event for text objects
			$(".text-customizer").fadeOut(500);
			break;
		default: //Handles Event for rectangle, triangle and circle objects
			$(".default-customizer").fadeOut(500);
			break;
	}
}

//Event Handler for Auto Saving
function onAutoSave(callback = null){
	var json = JSON.stringify(canvas.toJSON());
	var png = canvas.toDataURL({
		format: 'png',
		multiplier: 0.5,
	});
	var data = {
		'action': 'autosave',
		'canvas_data': json,
		'origin_width': canvas_width_org,
		'origin_height': canvas_height_org,
		'actual_width': actual_width,
		'actual_height': actual_height,
		'grid_id': working_grid_id,
		'preview_image': png,
	};
	$.post(ajax_object.ajax_url, data, callback);
}

//Event Handler for Click Template Saving button
function showTemplateSaveDlg() {
	$("#chooseTemplateName").modal('show');
}

//Save Canvas As a Template
function saveAsTemplate(){
	$("#chooseTemplateName").modal('hide');
	var templateName = $("#template-name").val();
	$("#template-name").val('');
	removeSerialNumberImage();
	var json = JSON.stringify(canvas.toJSON());
	var png = canvas.toDataURL({
		format: 'png',
		multiplier: 0.5,
	});
	var data = {
		'action': 'templatesave',
		'canvas_data': json,
		'origin_width': canvas_width_org,
		'origin_height': canvas_height_org,
		'actual_width': actual_width,
		'actual_height': actual_height,
		'grid_id': $("#grid_selector").val(),
		'template_name': templateName,
		'png': png,
	};
	$.post(ajax_object.ajax_url, data, function(response) {

	});	
}

//Event Handler for new Print

function newPrint() {
	onAutoSave();
	var data = {
		'action': 'new_print',
	};
	$.post(ajax_object.ajax_url, data, function(response) {
		loadSavedData();
	});
}

//Event Handler for Print Loading
function loadSavedData(){
	var data = {
		'action': 'load_print',
	};
	showLoader();
	$.post(ajax_object.ajax_url, data, function(response) {
		data = JSON.parse(response);
		min_stroke = data.min_stroke;
		serialNumber = data.sn;
		clearCanvas();
		zoomCanvas(100);
		if(data.new_one==true){
			canvas.setWidth(data.origin_width);
			canvas.setHeight(data.origin_height);
			canvas_height_org = data.origin_height;
			canvas_width_org = data.origin_width;
			actual_width = data.actual_width;
			actual_height = data.actual_height;
			grid_id = data.grid_id;
			working_grid_id = grid_id;
			$("#grid-title-holder").html(data.grid_title);
			updateGrid(grid_id);
			canvas.renderAll();
			intervalID = setInterval(onAutoSave, 60000);
			canvas.renderAll();
			zoomCanvas(25);
			zoom_control.setPercentage(25);
			hideLoader();
		}else {
			for(i = 0; i < $(".font_options").length; i++) {
				fabric.fontPaths[$($(".font_options")[i]).attr('value')] = $($(".font_options")[i]).attr('font_url');
			}
			canvas.setWidth(data.origin_width);
			canvas.setHeight(data.origin_height);
			canvas_height_org = data.origin_height;
			canvas_width_org = data.origin_width;
			actual_width = data.actual_width;
			actual_height = data.actual_height;
			grid_id = data.grid_id;
			working_grid_id = grid_id;
			$("#grid-title-holder").html(data.grid_title);
			$("#grid_selector").val(grid_id);
			canvas.loadFromJSON(data.data,function(){
				if(data.finished=='1'){
					publishPrint();
				}else {
					canvas.forEachObject(function(obj){
						if(obj && obj.type == 'i-text'){
							canvas.remove(obj);
						}else {
							if(obj){
								obj.on('selected', function(){
									doSelectedAction(this);
								})
								obj.on('deselected', function(){
									doDeselectAction(this);
								});
								if(obj.type == "text"){
									if(obj.serial_number || obj.getText().indexOf('Ruzel Pty Ltd')>=0){
										obj.selectable = false;
									}
								}else{
									obj.setStrokeWidth(min_stroke);
								}
							}
						}
					});
				}
				zoomCanvas(25);
				zoom_control.setPercentage(25);
				addBoundingRect();
				addSerialNumberImage(serialNumber);
			});
			if(!data.finished){
				hideLoader();
				intervalID = setInterval(onAutoSave, 60000);
			}
		}
	});
}

function loadFromTemplate(template_id){
	$("#selectTemplateModal").modal('hide');
	var data = {
		'action': 'load_template',
		'template_id': template_id,
	};
	showLoader();
	$.post(ajax_object.ajax_url, data, function(response) {
		data = JSON.parse(response);
		min_stroke = data.min_stroke;
		for(i = 0; i < $(".font_options").length; i++) {
			fabric.fontPaths[$($(".font_options")[i]).attr('value')] = $($(".font_options")[i]).attr('font_url');
		}
		canvas.setWidth(data.origin_width);
		canvas.setHeight(data.origin_height);
		canvas_height_org = data.origin_height;
		canvas_width_org = data.origin_width;
		actual_width = data.actual_width;
		actual_height = data.actual_height;
		grid_id = data.grid_id;
		$("#grid_selector").val(grid_id);
		clearCanvas();
		canvas.renderAll();
		canvas.loadFromJSON(data.data,function(){
			zoomCanvas(25);
			zoom_control.setPercentage(25);
			canvas.forEachObject(function(obj){
				if(obj.type != "text"){
					obj.setStrokeWidth(min_stroke);
				}
				obj.on('selected', function(){
					doSelectedAction(this);
				})
				obj.on('deselected', function(){
					doDeselectAction(this);
				});
			});
		});
		addBoundingRect();
		addSerialNumberImage(serialNumber);
		hideLoader();
	});
}

function addSerialNumberImage(serialNumber) {
	removeSerialNumberImage();
	var serialNumberImage = new fabric.IText('Ruzel Pty Ltd  S/N:' + serialNumber,{
		left: 30 * canvas_height_org/1106,
		top: canvas_height_org - 40 * canvas_height_org/1106,
		fontSize: 20 * canvas_height_org/1106,
		fontFamily: 'PoorRichards',
		fill: 'rgb(255,255,255)',
		selectable: false,
		styles: {
			0: {
				0: {
					fontSize: 30 * canvas_height_org/1106,
				},
				1: {
					fontSize: 30 * canvas_height_org/1106,
				},
				2: {
					fontSize: 30 * canvas_height_org/1106,
				},
				3: {
					fontSize: 30 * canvas_height_org/1106,
				},
				4: {
					fontSize: 30 * canvas_height_org/1106,
				},
				5: {
					fontSize: 30 * canvas_height_org/1106,
				},
				6: {
					fontSize: 30 * canvas_height_org/1106,
				},
				7: {
					fontSize: 30 * canvas_height_org/1106,
				},
				8: {
					fontSize: 30 * canvas_height_org/1106,
				},
				9: {
					fontSize: 30 * canvas_height_org/1106,
				},
				10: {
					fontSize: 30 * canvas_height_org/1106,
				},
				11: {
					fontSize: 30 * canvas_height_org/1106,
				},
				12: {
					fontSize: 30 * canvas_height_org/1106,
				}
			}
		}
	});
	serialNumberImage.setControlsVisibility({
		mt: false,
		mb: false,
		ml: false,
		mr: false,
		bl: false,
		br: false, 
		tl: false, 
		tr: false,
		mtr: false,
	});
	serialNumberImage.serial_number = true;
	canvas.add(serialNumberImage);
}

function removeSerialNumberImage() {
	canvas.forEachObject(function(obj){
		if(obj)
			if(obj.type=='i-text'){
				canvas.remove(obj);
				canvas.renderAll();
			}
	});
}

function getTemplateList(adminFlg = false) {
	var data = {
		'action': 'get_template_list',
	}
	if(adminFlg){
		$.post(ajax_object.ajax_url, data, function(response) {
			$("#template_list_holder").html('');
			var data = JSON.parse(response);
			for(i = 0; i < data.length; i ++){
				var str = '<div class="template_info_container">';
				str += '<div class="template_info_part">';
				str += '<div class="template_info">'+data[i].title +'</div>';
				str += '<div class="grid_info">'+data[i].grid_name +' ('+data[i].grid_width+'mm X '+data[i].grid_height+'mm)</div>';
				str += '<div class="load_template_button_holder"><button type="button" class="btn btn-primary" onclick="loadSavedGrid('+data[i].id+')">Load Saved Grid</button></div>';
				str += '</div>';
				str += '<div class="template_preview_image">';
				str += '<img src="'+data[i].preview+'">';
				str += '</div>';
				str += '</div>';
				$("#template_list_holder").append(str);
			}
			$("#selectTemplateModal").modal('show');
		});
	}else {
		$.post(ajax_object.ajax_url, data, function(response) {
			$("#template_list_holder").html('');
			var data = JSON.parse(response);
			for(i = 0; i < data.length; i ++){
				var str = '<div class="template_info_container">';
				str += '<div class="template_info_part">';
				str += '<div class="template_info">'+data[i].title +'</div>';
				str += '<div class="grid_info">'+data[i].grid_name +' ('+data[i].grid_width+'mm X '+data[i].grid_height+'mm)</div>';
				str += '<div class="load_template_button_holder"><button type="button" class="btn btn-primary" onclick="loadFromTemplate('+data[i].id+')">Load Saved Grid</button></div>';
				str += '</div>';
				str += '<div class="template_preview_image">';
				str += '<img src="'+data[i].preview+'">';
				str += '</div>';
				str += '</div>';
				$("#template_list_holder").append(str);
			}
			$("#selectTemplateModal").modal('show');
		});
	}
}

//Event Handler for Load List of Saved Grids by User

function getSavedGrids() {
	var data = {
		'action': 'get_saved_grids',
	};
	$.post(ajax_object.ajax_url, data, function(response) {
		$("#savedGridPreview").html('');
		var data = JSON.parse(response);
		for(i = 0; i < data.length; i ++){
			var str = '<div class="template_info_container">';
			str += '<div class="template_info_part">';
			str += '<div class="grid_info">'+data[i].grid_name +' ('+data[i].grid_width+'mm X '+data[i].grid_height+'mm)</div>';
			str += '<div class="template_info">'+data[i].date +'</div>';
			str += '<div class="load_template_button_holder"><button type="button" class="btn btn-primary" onclick="loadSavedGrid('+data[i].id+')">Load Design</button></div>';
			str += '</div>';
			str += '<div class="template_preview_image">';
			str += '<img src="'+data[i].preview+'">';
			str += '</div>';
			str += '</div>';
			$("#savedGridPreview").append(str);
		}
		$("#chosePastGrid").modal('show');
	})
}

//Load Saved Grid

function loadSavedGrid(print_id){
	$("#chosePastGrid").modal('hide');
	$("#selectTemplateModal").modal('hide');

	var data = {
		'action': 'load_saved_grid',
		'grid_id': print_id,
	};
	showLoader();
	$.post(ajax_object.ajax_url, data, function(response) {
		data = JSON.parse(response);
		min_stroke = data.min_stroke;
		for(i = 0; i < $(".font_options").length; i++) {
			fabric.fontPaths[$($(".font_options")[i]).attr('value')] = $($(".font_options")[i]).attr('font_url');
		}
		canvas.setWidth(data.origin_width);
		canvas.setHeight(data.origin_height);
		canvas_height_org = data.origin_height;
		canvas_width_org = data.origin_width;
		actual_width = data.actual_width;
		actual_height = data.actual_height;
		grid_id = data.grid_id;
		sn = data.sn;
		$("#grid_selector").val(grid_id);
		canvas.loadFromJSON(data.data,function(){
			zoomCanvas(25);
			zoom_control.setPercentage(25);
			canvas.forEachObject(function(obj){
				obj.on('selected', function(){
					doSelectedAction(this);
				})
				obj.on('deselected', function(){
					doDeselectAction(this);
				});
			});
		});
		addBoundingRect();
		if(data.finished == 1)
			$("#order_now_btn").fadeOut(200);
		else
			$("#order_now_btn").fadeIn(200);
		hideLoader();
	});
}

//Event Handler for new Template

function newTemplate() {
	clearInterval(intervalID);
	var data ={
		action: 'new_template',
	};
	$.post(ajax_object.ajax_url, data, function(response){
		loadSavedData();
	});
}

function get_pickup_location() {
	var tmp = $("#wpsl-stores ul li.active .wpsl-store-location p")[0].innerText;
	var str = tmp.trim().replace(/(?:\r\n|\r|\n)/g, ',').split(',');
	var location = "";
	for(i=0; i<str.length; i++) {
		if(str[i].trim() != '')
		location += str[i].trim() + '\n';
	}
	return location;
}

function publishPrint() {
	var data = {
		'action': 'get_store',
	};
	
	$.post(ajax_object.ajax_url, data, function(response) {
		var store_info = JSON.parse(response);
		var logo_img = 'data:image/jpeg;base64,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';
		var watermark = 'data:image/jpeg;base64,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AE5ndHZib29sAAAAAABFbWxEYm9vbAAAAAAASW50cmJvb2wAAAAAAEJja2dPYmpjAAAAAQAAAAAAAFJHQkMAAAADAAAAAFJkICBkb3ViQG/gAAAAAAAAAAAAR3JuIGRvdWJAb+AAAAAAAAAAAABCbCAgZG91YkBv4AAAAAAAAAAAAEJyZFRVbnRGI1JsdAAAAAAAAAAAAAAAAEJsZCBVbnRGI1JsdAAAAAAAAAAAAAAAAFJzbHRVbnRGI1B4bEBywAAAAAAAAAAACnZlY3RvckRhdGFib29sAQAAAABQZ1BzZW51bQAAAABQZ1BzAAAAAFBnUEMAAAAAU2NsIFVudEYjUHJjQFkAAAAAAAA4QklNA+0AAAAAABABLAAAAAEAAgEsAAAAAQACOEJJTQQmAAAAAAAOAAAAAAAAAAAAAD+AAAA4QklNA/IAAAAAAAoAAP///////wAAOEJJTQQNAAAAAAAEAAAAeDhCSU0EGQAAAAAABAAAAB44QklNA/MAAAAAAAkAAAAAAAAAAAEAOEJJTScQAAAAAAAKAAEAAAAAAAAAAjhCSU0D9QAAAAAASAAvZmYAAQBsZmYABgAAAAAAAQAvZmYAAQChmZoABgAAAAAAAQAyAAAAAQBaAAAABgAAAAAAAQA1AAAAAQAtAAAABgAAAAAAAThCSU0D+AAAAAAAcAAA/////////////////////////////wPoAAAAAP////////////////////////////8D6AAAAAD/////////////////////////////A+gAAAAA/////////////////////////////wPoAAA4QklNBAAAAAAAAAIAADhCSU0EAgAAAAAAAgAAOEJJTQQwAAAAAAABAQA4QklNBC0AAAAAAAYAAQAAAAM4QklNBAgAAAAAABAAAAABAAACQAAAAkAAAAAAOEJJTQQeAAAAAAAEAAAAADhCSU0EGgAAAAADTQAAAAYAAAAAAAAAAAAAAbMAAAKoAAAADAB3AGEAdABlAHIAbQBhAHIAawBpAG4AZwAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAACqAAAAbMAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAQAAAAAAAG51bGwAAAACAAAABmJvdW5kc09i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czp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSAoMTIuMHgyMDEwMDExNSBbMjAxMDAxMTUubS45OTggMjAxMC8wMS8xNTowMjowMDowMCBjdXRvZmY7IG0gYnJhbmNoXSkgIFdpbmRvd3MiIHhtcDpDcmVhdGVEYXRlPSIyMDE3LTA1LTA4VDA5OjA4OjU5KzA4OjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDE3LTA1LTA4VDA5OjE3OjM1KzA4OjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAxNy0wNS0wOFQwOToxNzozNSswODowMCIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9InNSR0IgSUVDNjE5NjYtMi4xIiBkYzpmb3JtYXQ9ImltYWdlL2pwZWciIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MUJEOEYzRUE4QTMzRTcxMTk1MzdENDY4RjQwQ0EwRDkiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MTNEOEYzRUE4QTMzRTcxMTk1MzdENDY4RjQwQ0EwRDkiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDoxM0Q4RjNFQThBMzNFNzExOTUzN0Q0NjhGNDBDQTBEOSI+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNyZWF0ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6MTNEOEYzRUE4QTMzRTcxMTk1MzdENDY4RjQwQ0EwRDkiIHN0RXZ0OndoZW49IjIwMTctMDUtMDhUMDk6MDg6NTkrMDg6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDUzUgKDEyLjB4MjAxMDAxMTUgWzIwMTAwMTE1Lm0uOTk4IDIwMTAvMDEvMTU6MDI6MDA6MDAgY3V0b2ZmOyBtIGJyYW5jaF0pICBXaW5kb3dzIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDoxQUQ4RjNFQThBMzNFNzExOTUzN0Q0NjhGNDBDQTBEOSIgc3RFdnQ6d2hlbj0iMjAxNy0wNS0wOFQwOToxNzozNSswODowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENTNSAoMTIuMHgyMDEwMDExNSBbMjAxMDAxMTUubS45OTggMjAxMC8wMS8xNTowMjowMDowMCBjdXRvZmY7IG0gYnJhbmNoXSkgIFdpbmRvd3MiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNvbnZlcnRlZCIgc3RFdnQ6cGFyYW1ldGVycz0iZnJvbSBhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wIHRvIGltYWdlL2pwZWciLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImRlcml2ZWQiIHN0RXZ0OnBhcmFtZXRlcnM9ImNvbnZlcnRlZCBmcm9tIGFwcGxpY2F0aW9uL3ZuZC5hZG9iZS5waG90b3Nob3AgdG8gaW1hZ2UvanBlZyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6MUJEOEYzRUE4QTMzRTcxMTk1MzdENDY4RjQwQ0EwRDkiIHN0RXZ0OndoZW49IjIwMTctMDUtMDhUMDk6MTc6MzUrMDg6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDUzUgKDEyLjB4MjAxMDAxMTUgWzIwMTAwMTE1Lm0uOTk4IDIwMTAvMDEvMTU6MDI6MDA6MDAgY3V0b2ZmOyBtIGJyYW5jaF0pICBXaW5kb3dzIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDwvcmRmOlNlcT4gPC94bXBNTTpIaXN0b3J5PiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDoxQUQ4RjNFQThBMzNFNzExOTUzN0Q0NjhGNDBDQTBEOSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDoxM0Q4RjNFQThBMzNFNzExOTUzN0Q0NjhGNDBDQTBEOSIgc3RSZWY6b3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjEzRDhGM0VBOEEzM0U3MTE5NTM3RDQ2OEY0MENBMEQ5Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDw/eHBhY2tldCBlbmQ9InciPz7/4gxYSUNDX1BST0ZJTEUAAQEAAAxITGlubwIQAABtbnRyUkdCIFhZWiAHzgACAAkABgAxAABhY3NwTVNGVAAAAABJRUMgc1JHQgAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLUhQICAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABFjcHJ0AAABUAAAADNkZXNjAAABhAAAAGx3dHB0AAAB8AAAABRia3B0AAACBAAAABRyWFlaAAACGAAAABRnWFlaAAACLAAAABRiWFlaAAACQAAAABRkbW5kAAACVAAAAHBkbWRkAAACxAAAAIh2dWVkAAADTAAAAIZ2aWV3AAAD1AAAACRsdW1pAAAD+AAAABRtZWFzAAAEDAAAACR0ZWNoAAAEMAAAAAxyVFJDAAAEPAAACAxnVFJDAAAEPAAACAxiVFJDAAAEPAAACAx0ZXh0AAAAAENvcHlyaWdodCAoYykgMTk5OCBIZXdsZXR0LVBhY2thcmQgQ29tcGFueQAAZGVzYwAAAAAAAAASc1JHQiBJRUM2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7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq//0ff2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2Kv/9L39irsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdiqyRmRCyipGKoUSvzDk1IxVGAhgCOhxVvFXYq7FXYq7FXYq7FX/9P39irsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdiruuxxVBSJwcr27fLFVW3f9g/MYqiMVdirsVdirsVdirsVf//U9/Yq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FVKdOaVH2lxVCglSCOoxVGowdQw74quxV2KuxV2KuxV2Kv/9X39irsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdi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q7FXYq7FXYq7FXYq7FXYq7FXYq7FX//T9/Yq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq//1Pf2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2Kv/9X39irsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdir//Z';
		for(i = 0; i < $(".font_options").length; i++) {
			fabric.fontPaths[$($(".font_options")[i]).attr('value')] = $($(".font_options")[i]).attr('font_url');
		}
		svg = canvas.toSVG();
		var doc = new jsPDF({
			orientation: 'landscape',
			unit: 'pt'
		});
		var pickup_location = store_info.address+', '+store_info.city+',\n'+store_info.state+', '+store_info.zip+', \n'+store_info.country+', \n'+store_info.phone;
		doc.addImage(watermark, 'JPG', 80, 80, 680, 435);
		doc.addImage(logo_img, 'JPG', 80, 20, 237, 81);
		doc.text('SN: '+serialNumber, 80, 140);
		doc.text('Frame Size: '+store_info.actual_width+'x'+store_info.actual_height+'mm', 300, 140);
		doc.text('Price: ' + store_info.price, 80, 170);
		doc.text('Pickup Location: \n'+pickup_location, 520, 80);
		var canvas_as_image = canvas.toDataURL();
		sRatio = 680/parseFloat(canvas_width_org);
		doc.addImage(canvas_as_image, 'PNG', 80, 200, canvas_width_org*sRatio, canvas_height_org*sRatio,'img','fast');
		var pdf = doc.output();
		var data = {
			'action': 'publish_print',
			'svg': svg,
			'pdf': pdf,
		};
		hideLoader();
		refreshCanvas();
		$.post(ajax_object.ajax_url, data, function(response){
			doc.save(serialNumber+'.pdf');
			intervalID = setInterval(onAutoSave, 60000);
		});
	});
}

function beforePayment() {
	$('#wpsl-stores ul>li').removeClass('active');
	$('#wpsl-stores ul>li:first-child').addClass('active');
	onAutoSave();
	var data = {
		'action': 'set_store',
		'store_id': $('#wpsl-stores ul>li:first-child').attr('data-store-id'),
	};
	$.post(ajax_object.ajax_url, data, function(response){
		$("#centralModalSuccess").modal('show');
		$("#centralModalSuccess").on("shown.bs.modal", function () {
		    google.maps.event.trigger(map, "resize");
		    map.setCenter(mapOptions.center);
		    map.setZoom(maxZoom);
		});
	});
}

function storeSelected(store_id) {
	var data = {
		'action': 'set_store',
		'store_id': store_id,
	};
	$('#wpsl-stores ul>li').removeClass('active');
	$('li[data-store-id="' + store_id + '"]').addClass('active');
	$.post(ajax_object.ajax_url, data, function(response){
	});
}

function loadImageTemplate() {
	$("#load_design_button").attr('disabled','disabled');
	$("#designDetails").modal('show');
	canvas_bg = null;
}

function loadNewDesign() {
	var aw, ah, cw, ch;
	aw = $("#actual_width").val();
	ah = $("#actual_height").val();
	cw = $("#canvas_width").val();
	ch = $("#canvas_height").val();
	price = $("#canvas_price").val();
	if(canvas_bg && aw && ah && cw && ch){
		canvas_height_org = ch;
		canvas_width_org = cw;
		actual_height = ah;
		actual_width = aw;
		var temp = canvas_bg.split(';')[0];
		var img_type = temp.split('/')[1];
		var data = {
			action: 'import_design',
			canvas_height_org,
			canvas_width_org,
			actual_height,
			actual_width,
			canvas_bg,
			price,
			img_type,
		};
		$.post(ajax_object.ajax_url, data, function(response){
			data = JSON.parse(response);
			clearCanvas();
			updateGrid(data.grid_id);
		});
		$("#designDetails").modal('hide');
	}else {
		alert('Please fill all the fields');
	}
}

function design_selected() {
	var file    = document.querySelector('input[type=file]').files[0];
	var reader  = new FileReader();
	canvas_bg = '';

	reader.addEventListener("load", function () {
		canvas_bg = reader.result;
		$("#image_previewer").attr('src', canvas_bg);
		$("#load_design_button").removeAttr('disabled');
	}, false);

	if (file) {
		reader.readAsDataURL(file);
	}
}

function showGridSelector() {
	$("#selectGrid").modal("show");
}

$(document).ready(function() {

	//Event Handler for chaning Fill option for Rectangle, Circle and Triangle
	$("#fill_objects").change(function(){
		if(this.checked)
			selectedItem.setFill('black');	
		else
			selectedItem.setFill('transparent');
		canvas.renderAll();
	});

	//Event Handler for changing Stroke with for Geometry Objects (Rectangle, Circle, Triangle and Line)
	$(".stroke_width").keyup(function(){
		storke_width = min_stroke;
		if(parseInt($(this).val())>min_stroke)
			stroke_width = parseInt($(this).val());
		selectedItem.setStrokeWidth(stroke_width);
		canvas.renderAll();
	});

	//Event Handler for chaning Text Content for Text Objects
	$("#text_content").keyup(function(){
		selectedItem.setText($(this).val());
		canvas.renderAll();
	})

	//Event Handler for changing font for Text Objects
	$("#font_selector").change(function(){
		selectedItem.setFontFamily($(this).val());
		canvas.renderAll();
	})

	zoom_control = new RangeSlider($("#zoom-slider"), {
		size: 1,
		borderSize: 0.4,
		percentage: 100,
		onMove: function(e, percentage) {
			zoomCanvas(percentage);
		},
	});

	$('.dropdown-toggle').dropdown();

	loadSavedData();
});

//Zooming the Canvas

function zoomCanvas(percentage) {
	if(percentage > 10){
		var zoomLevel = parseFloat(percentage)/100;
		if( canvas_width_org * zoomLevel > 200 && canvas_height_org * zoomLevel > 200) {
			canvas.setZoom(zoomLevel);
			canvas.setWidth(parseInt(canvas_width_org*zoomLevel));
			canvas.setHeight(parseInt(canvas_height_org*zoomLevel));
		}
	}
}

//Event Handler for Delete or Backspace keypressed (Delete Selected Object from Canvas)
$(document).bind('keydown',function(e){
	if(e.currentTarget.activeElement.nodeName!="INPUT"){ //Check if event is not fired from INPUT boxes. Deleting Object only happens when this event is not fired from INPUT.
		var keyCode = e.keyCode || e.which;
		if(keyCode == 46 || keyCode == 8){
				if(selectedItem){
					selectedItem.remove();
			}
		}
	}
});


//Event Handler for Choose Grid Button

function setGrid(grid_id) {
	$("#selectGrid").modal('hide');
	updateGrid(grid_id);
}

//Event Handler for Checkout Product
function beforeCheckout(){
	var data = {
		'action': 'before_checkout',
	};
	$.post(ajax_object.ajax_url, data, function(response){
		window.location.href=response;
	});
}

function checkoutProduct() {
	onAutoSave(beforeCheckout);
}

function print_canvas() {
	var logo_img = 'data:image/jpeg;base64,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';
	var watermark = 'data:image/jpeg;base64,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AE5ndHZib29sAAAAAABFbWxEYm9vbAAAAAAASW50cmJvb2wAAAAAAEJja2dPYmpjAAAAAQAAAAAAAFJHQkMAAAADAAAAAFJkICBkb3ViQG/gAAAAAAAAAAAAR3JuIGRvdWJAb+AAAAAAAAAAAABCbCAgZG91YkBv4AAAAAAAAAAAAEJyZFRVbnRGI1JsdAAAAAAAAAAAAAAAAEJsZCBVbnRGI1JsdAAAAAAAAAAAAAAAAFJzbHRVbnRGI1B4bEBywAAAAAAAAAAACnZlY3RvckRhdGFib29sAQAAAABQZ1BzZW51bQAAAABQZ1BzAAAAAFBnUEMAAAAAU2NsIFVudEYjUHJjQFkAAAAAAAA4QklNA+0AAAAAABABLAAAAAEAAgEsAAAAAQACOEJJTQQmAAAAAAAOAAAAAAAAAAAAAD+AAAA4QklNA/IAAAAAAAoAAP///////wAAOEJJTQQNAAAAAAAEAAAAeDhCSU0EGQAAAAAABAAAAB44QklNA/MAAAAAAAkAAAAAAAAAAAEAOEJJTScQAAAAAAAKAAEAAAAAAAAAAjhCSU0D9QAAAAAASAAvZmYAAQBsZmYABgAAAAAAAQAvZmYAAQChmZoABgAAAAAAAQAyAAAAAQBaAAAABgAAAAAAAQA1AAAAAQAtAAAABgAAAAAAAThCSU0D+AAAAAAAcAAA/////////////////////////////wPoAAAAAP////////////////////////////8D6AAAAAD/////////////////////////////A+gAAAAA/////////////////////////////wPoAAA4QklNBAAAAAAAAAIAADhCSU0EAgAAAAAAAgAAOEJJTQQwAAAAAAABAQA4QklNBC0AAAAAAAYAAQAAAAM4QklNBAgAAAAAABAAAAABAAACQAAAAkAAAAAAOEJJTQQeAAAAAAAEAAAAADhCSU0EGgAAAAADTQAAAAYAAAAAAAAAAAAAAbMAAAKoAAAADAB3AGEAdABlAHIAbQBhAHIAawBpAG4AZwAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAACqAAAAbMAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAQAAAAAAAG51bGwAAAACAAAABmJvdW5kc09i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czp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSAoMTIuMHgyMDEwMDExNSBbMjAxMDAxMTUubS45OTggMjAxMC8wMS8xNTowMjowMDowMCBjdXRvZmY7IG0gYnJhbmNoXSkgIFdpbmRvd3MiIHhtcDpDcmVhdGVEYXRlPSIyMDE3LTA1LTA4VDA5OjA4OjU5KzA4OjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDE3LTA1LTA4VDA5OjE3OjM1KzA4OjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAxNy0wNS0wOFQwOToxNzozNSswODowMCIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9InNSR0IgSUVDNjE5NjYtMi4xIiBkYzpmb3JtYXQ9ImltYWdlL2pwZWciIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MUJEOEYzRUE4QTMzRTcxMTk1MzdENDY4RjQwQ0EwRDkiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MTNEOEYzRUE4QTMzRTcxMTk1MzdENDY4RjQwQ0EwRDkiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDoxM0Q4RjNFQThBMzNFNzExOTUzN0Q0NjhGNDBDQTBEOSI+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNyZWF0ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6MTNEOEYzRUE4QTMzRTcxMTk1MzdENDY4RjQwQ0EwRDkiIHN0RXZ0OndoZW49IjIwMTctMDUtMDhUMDk6MDg6NTkrMDg6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDUzUgKDEyLjB4MjAxMDAxMTUgWzIwMTAwMTE1Lm0uOTk4IDIwMTAvMDEvMTU6MDI6MDA6MDAgY3V0b2ZmOyBtIGJyYW5jaF0pICBXaW5kb3dzIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDoxQUQ4RjNFQThBMzNFNzExOTUzN0Q0NjhGNDBDQTBEOSIgc3RFdnQ6d2hlbj0iMjAxNy0wNS0wOFQwOToxNzozNSswODowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENTNSAoMTIuMHgyMDEwMDExNSBbMjAxMDAxMTUubS45OTggMjAxMC8wMS8xNTowMjowMDowMCBjdXRvZmY7IG0gYnJhbmNoXSkgIFdpbmRvd3MiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNvbnZlcnRlZCIgc3RFdnQ6cGFyYW1ldGVycz0iZnJvbSBhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wIHRvIGltYWdlL2pwZWciLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImRlcml2ZWQiIHN0RXZ0OnBhcmFtZXRlcnM9ImNvbnZlcnRlZCBmcm9tIGFwcGxpY2F0aW9uL3ZuZC5hZG9iZS5waG90b3Nob3AgdG8gaW1hZ2UvanBlZyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6MUJEOEYzRUE4QTMzRTcxMTk1MzdENDY4RjQwQ0EwRDkiIHN0RXZ0OndoZW49IjIwMTctMDUtMDhUMDk6MTc6MzUrMDg6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDUzUgKDEyLjB4MjAxMDAxMTUgWzIwMTAwMTE1Lm0uOTk4IDIwMTAvMDEvMTU6MDI6MDA6MDAgY3V0b2ZmOyBtIGJyYW5jaF0pICBXaW5kb3dzIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDwvcmRmOlNlcT4gPC94bXBNTTpIaXN0b3J5PiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDoxQUQ4RjNFQThBMzNFNzExOTUzN0Q0NjhGNDBDQTBEOSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDoxM0Q4RjNFQThBMzNFNzExOTUzN0Q0NjhGNDBDQTBEOSIgc3RSZWY6b3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjEzRDhGM0VBOEEzM0U3MTE5NTM3RDQ2OEY0MENBMEQ5Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDw/eHBhY2tldCBlbmQ9InciPz7/4gxYSUNDX1BST0ZJTEUAAQEAAAxITGlubwIQAABtbnRyUkdCIFhZWiAHzgACAAkABgAxAABhY3NwTVNGVAAAAABJRUMgc1JHQgAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLUhQICAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABFjcHJ0AAABUAAAADNkZXNjAAABhAAAAGx3dHB0AAAB8AAAABRia3B0AAACBAAAABRyWFlaAAACGAAAABRnWFlaAAACLAAAABRiWFlaAAACQAAAABRkbW5kAAACVAAAAHBkbWRkAAACxAAAAIh2dWVkAAADTAAAAIZ2aWV3AAAD1AAAACRsdW1pAAAD+AAAABRtZWFzAAAEDAAAACR0ZWNoAAAEMAAAAAxyVFJDAAAEPAAACAxnVFJDAAAEPAAACAxiVFJDAAAEPAAACAx0ZXh0AAAAAENvcHlyaWdodCAoYykgMTk5OCBIZXdsZXR0LVBhY2thcmQgQ29tcGFueQAAZGVzYwAAAAAAAAASc1JHQiBJRUM2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7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq//0ff2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2Kv/9L39irsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdiqyRmRCyipGKoUSvzDk1IxVGAhgCOhxVvFXYq7FXYq7FXYq7FX/9P39irsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdiruuxxVBSJwcr27fLFVW3f9g/MYqiMVdirsVdirsVdirsVf//U9/Yq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FVKdOaVH2lxVCglSCOoxVGowdQw74quxV2KuxV2KuxV2Kv/9X39irsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdi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q7FXYq7FXYq7FXYq7FXYq7FXYq7FX//T9/Yq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq7FXYq//1Pf2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2KuxV2Kv/9X39irsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdirsVdir//Z';
	for(i = 0; i < $(".font_options").length; i++) {
		fabric.fontPaths[$($(".font_options")[i]).attr('value')] = $($(".font_options")[i]).attr('font_url');
	}
	svg = canvas.toSVG();
	var doc = new jsPDF({
		orientation: 'landscape',
		unit: 'pt'
	});
	doc.addImage(watermark, 'JPG', 80, 80, 680, 435);
	doc.addImage(logo_img, 'JPG', 80, 20, 237, 81);
	doc.text('SN: '+serialNumber, 80, 140);
	var canvas_as_image = canvas.toDataURL();
	sRatio = 680/parseFloat(canvas_width_org);
	doc.addImage(canvas_as_image, 'PNG', 80, 200, canvas_width_org*sRatio, canvas_height_org*sRatio,'img','fast');
	doc.save(serialNumber+'.pdf');
}