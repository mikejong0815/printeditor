var grid;
function startPreview(template_id, img_src) {
	$.featherlight(img_src);
}
function chooseTemplate(template_id) {
	var data = {
		'action': 'change_template',
		'template_id': template_id,
	}
	$.post(ajax_object.ajax_url, data, function(response) {
		data = JSON.parse(response);
		window.location = data.redirect;
	});
}
$(document).ready(function(){
	grid = $(".grid_template_container").isotope({
		itemSelector: '.template_preview_wrapper',
	});
	$("#grid_filter").change(function() {
		if($(this).val()==-1)
			grid.isotope({ filter: '*' });
		else if($(this).val()==-2)
			grid.isotope({ filter: '.other' });
		else
			grid.isotope({ filter: '.grid_'+$(this).val() });
	});
})