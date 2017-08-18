<?php
function generate_sn(){
	$chars = array(1,2,3,5,7,'C','E','F','G','H','I','J','K','L','M','N','S','T','U','V','W','X','Y','Z');
	$serial = '';
	$max = count($chars)-1;
	for($i=0;$i<8;$i++){
	    $serial .= $chars[rand(0, $max)];
	}
	return $serial;
}

// Ajax Function for Get Main Category of Images
add_action( 'wp_ajax_get_main_cateogry', 'get_images_main_category' );
function get_images_main_category() {
	$terms = get_terms('category', array('hierarchical' => false, 'parent' => 0));
	$result = array();
	if(count($terms) > 0) {
		foreach($terms as $term){
			$result[] = array(
				'term_id' => $term->term_id,
				'name' => $term->name,
			);
		}
	}
	echo json_encode($result);
	wp_die();
}

// Ajax Function for Get Sub Category of Main Images Category
add_action( 'wp_ajax_get_images_category', 'get_images_category' );
function get_images_category() {
	global $wpdb;
	$cat_id = intval( $_POST['cat_id'] );
	$terms = get_terms('category', array('hierarchical' => false, 'parent' => $cat_id));
	$result = [];
	if(count($terms))
		for($i = 0; $i < count($terms); $i ++){
			$result[] = [$terms[$i]->term_id, $terms[$i]->name];
		}
	$result_obj->cat_id = $cat_id;
	$result_obj->result = $result;
	echo json_encode($result_obj);
	wp_die();
}

// Ajax Function for Get Images for Sub Imags Category

add_action( 'wp_ajax_get_images', 'get_images' );
function get_images() {
	global $wpdb;
	$cat_id = intval( $_POST['cat_id'] );
	$images = query_posts(array('cat' => $cat_id, 'post_type' => 'images'));
	$result = [];
	if(count($images)>0){
		for($i = 0; $i < count($images); $i ++){
			$meta = get_post_meta($images[$i]->ID);
			$image_id = $meta['wp_images_image_source'][0];
			$minimum_image_width = $meta['wp_images_minimum_image_width'][0];
			$minimum_image_height = $meta['wp_images_minimum_image_height'][0];
			$image_url = wp_get_attachment_url($image_id);
			$image_thumb_url = wp_get_attachment_thumb_url($image_id);
			$result[]= array(
				'title'						=> $images[$i]->post_title,
				'minimum_image_width'		=> $minimum_image_width,
				'minimum_image_height'		=> $minimum_image_height,
				'image_url'					=> $image_url,
				'thumb_url'					=> $image_thumb_url,
			);
		}
	}
	$result_obj->cat_id = $cat_id;
	$result_obj->result = $result;
	echo json_encode($result_obj);
	wp_die();
}

// Ajax Function for Get Grid Information

add_action( 'wp_ajax_get_grid_info', 'get_grid_info' );
function get_grid_info() {
	global $wpdb;
	$grid_id = intval( $_POST['grid_id'] );
	$grid_title = get_the_title($grid_id);
	$meta = get_post_meta($grid_id);
	$width = $meta['wp_grids_width'][0];
	$height = $meta['wp_grids_height'][0];
	$price = $meta['wp_grids_price'][0];
	$actual_width = $meta['wp_grids_actual_width'][0];
	$actual_height = $meta['wp_grids_actual_height'][0];
	$image_url = get_the_guid($meta['wp_grids_source'][0]);
	$result_obj->width = $width;
	$result_obj->height = $height;
	$result_obj->image_url = $image_url;
	$result_obj->price = $price;
	$result_obj->grid_title = $grid_title;
	$result_obj->actual_width = $actual_width;
	$result_obj->actual_height = $actual_height;
	$result_obj->grid_id=$meta['wp_grids_source'][0];
	echo json_encode($result_obj);
	wp_die();
}

// Ajax Function for Auto Saving

add_action( 'wp_ajax_autosave', 'autosave' );
function autosave() {
	global $wpdb;
	$uid = get_current_user_id();
	$content = $_POST['canvas_data'];
	$width = $_POST['origin_width'];
	$height = $_POST['origin_height'];
	$actual_width = $_POST['actual_width'];
	$actual_height = $_POST['actual_height'];
	$grid_id = $_POST['grid_id'];
	$working_print = get_user_meta($uid, 'working_print', true);
	$finished = false;
	if($working_print != ''){
		$post = array(
			'ID'			=> $working_print,
			'post_content'	=> $content,
		);
		wp_update_post($post);
		update_post_meta($working_print, 'origin_width', $width );
		update_post_meta($working_print, 'origin_height', $height );
		update_post_meta($working_print, 'actual_width', $actual_width);
		update_post_meta($working_print, 'actual_height', $actual_height);
		update_post_meta($working_print, 'grid_id', $grid_id );
	}else {
		$post = array(
			'post_type'		=> 'prints',
			'post_content'	=> $content,
		);
		$working_print = wp_insert_post($post);
		update_user_meta($uid, 'working_print', $working_print);
		add_post_meta($working_print, 'origin_width', $width );
		add_post_meta($working_print, 'origin_height', $height );
		add_post_meta($working_print, 'actual_width', $actual_width);
		add_post_meta($working_print, 'actual_height', $actual_height);
		add_post_meta($working_print, 'grid_id', $grid_id );
	}
	$result_obj->working_print = $working_print;
	$preview_file_url = get_post_meta($working_print, 'preview', true);
	$real_path = get_post_meta($working_print, 'preview_path', true);
	unlink($real_path);
	$dataUrl = $_POST['preview_image'];
	list($meta, $content) = explode(',', $dataUrl);
	$content = base64_decode($content);

	$filename = $working_print.'_preview.png';
	$deprecated = null;
	$time = current_time('mysql');
	$upload = wp_upload_bits($filename, $deprecated, $content, $time);
	update_post_meta($working_print, 'preview', $upload['url']);
	update_post_meta($working_print, 'preview_path', $upload['file']);
	update_post_meta($working_print, 'template_preview', $upload['url']);
	update_post_meta($working_print, 'template_preview_path', $upload['file']);

	wp_die();
}

// Ajax Function for Template Saving

add_action( 'wp_ajax_templatesave', 'saveAsTemplate' );
function saveAsTemplate() {
	global $wpdb;
	$uid = get_current_user_id();
	$content = $_POST['canvas_data'];
	$width = $_POST['origin_width'];
	$height = $_POST['origin_height'];
	$actual_width = $_POST['actual_width'];
	$actual_height = $_POST['actual_height'];
	$title = $_POST['template_name'];
	$svg = $_POST['svg'];
	$grid_id = $_POST['grid_id'];
	$working_print = get_user_meta($uid, 'working_print', true);
	$finished = false;
	if($working_print != ''){
		$post = array(
			'ID'			=> $working_print,
			'post_content'	=> $content,
			'post_title' 		=> $title,
		);
		wp_update_post($post);
		update_post_meta($working_print, 'origin_width', $width );
		update_post_meta($working_print, 'origin_height', $height );
		update_post_meta($working_print, 'actual_width', $actual_width);
		update_post_meta($working_print, 'actual_height', $actual_height);
		update_post_meta($working_print, 'grid_id', $grid_id );
		update_post_meta($working_print, 'template',true);
	}else {
		$post = array(
			'post_type'		=> 'prints',
			'post_content'	=> $content,
			'post_title'	=> $title,
		);
		$working_print = wp_insert_post($post);
		update_user_meta($uid, 'working_print', $working_print);
		add_post_meta($working_print, 'origin_width', $width );
		add_post_meta($working_print, 'origin_height', $height );
		add_post_meta($working_print, 'actual_width', $actual_width);
		add_post_meta($working_print, 'actual_height', $actual_height);
		add_post_meta($working_print, 'grid_id', $grid_id );
		add_post_meta($working_print, 'template', true );
	}
	$result_obj->working_print = $working_print;
	$real_path = get_post_meta($working_print, 'template_preview_path', true);
	unlink($real_path);
	$dataUrl = $_POST['png'];
	list($meta, $content) = explode(',', $dataUrl);
	$content = base64_decode($content);

	$filename = $working_print.'_template_preview.png';
	$deprecated = null;
	$time = current_time('mysql');
	$upload = wp_upload_bits($filename, $deprecated, $content, $time);
	update_post_meta($working_print, 'template_preview', $upload['url']);
	update_post_meta($working_print, 'template_preview_path', $upload['file']);
	echo json_encode($result_obj);
	wp_die();
}

// Ajax Function for New Grid
add_action( 'wp_ajax_new_print', 'new_print' );
function new_print() {
	global $wpdb;
	$uid = get_current_user_id();
	update_post_meta($uid, 'working_print', '');
	wp_die();
}

// Ajax Function for Load Saved Data

add_action( 'wp_ajax_load_print', 'load_print' );
function load_print() {
	global $wpdb;
	$uid = get_current_user_id();
	$working_print = get_user_meta($uid, 'working_print', true);
	$saved_content = '';
	$options = get_option( 'wp__settings' );
	$grid_id = 1;
	if($working_print != ''){
		$post = get_post($working_print);
		$saved_content = $post->post_content;
		$origin_width = get_post_meta($working_print, 'origin_width', true);
		$origin_height = get_post_meta($working_print, 'origin_height', true);
		$actual_width = get_post_meta($working_print, 'actual_width', true);
		$actual_height = get_post_meta($working_print, 'actual_height', true);
		$grid_id = get_post_meta($working_print, 'grid_id', true);
		$grid_title = get_the_title($grid_id);
		$finished = get_post_meta($working_print, 'finished', true);
		$sn = get_post_meta($working_print, 'sn', true);
		if(!$sn){
			$sn = generate_sn();
			update_post_meta($working_print, 'sn', $sn);
		}
		$result_obj->new_one = false;
	}else {
		$sn = generate_sn();
		$result_obj->new_one = true;
		$grids = query_posts(array('post_type' => 'grids'));
		$grid = $grids[0];
		$grid_title = $grid->post_title;
		$origin_width = get_post_meta($grid->ID, 'wp_grids_width', true);
		$origin_height = get_post_meta($grid->ID, 'wp_grids_height', true);
		$actual_width = get_post_meta($grid->ID, 'wp_grids_actual_width', true);
		$actual_height = get_post_meta($grid->ID, 'wp_grids_actual_height', true);
		$grid_id = $grid->ID;
	}
	$result_obj->data = $saved_content;
	$result_obj->origin_width = $origin_width;
	$result_obj->origin_height = $origin_height;
	$result_obj->actual_width = $actual_width;
	$result_obj->actual_height = $actual_height;
	$result_obj->grid_id = $grid_id;
	$result_obj->grid_title = $grid_title;
	$result_obj->finished = $finished;
	$result_obj->min_stroke = $options['wp__stroke_width'];
	$result_obj->sn = $sn;
	echo json_encode($result_obj);
	wp_die();
}

// Ajax function for Load Template

add_action( 'wp_ajax_load_template', 'load_grid_template' );
function load_grid_template() {
	global $wpdb;
	$uid = get_current_user_id();
	$working_print = $_POST['template_id'];
	$template = get_post($_POST['template_id']);
	$saved_content = $template->post_content;
	$options = get_option( 'wp__settings' );
	$post = get_post($working_print);
	$origin_width = get_post_meta($working_print, 'origin_width', true);
	$origin_height = get_post_meta($working_print, 'origin_height', true);
	$actual_width = get_post_meta($working_print, 'actual_width', true);
	$actual_height = get_post_meta($working_print, 'actual_height', true);
	$grid_id = get_post_meta($working_print, 'grid_id', true);
	$sn = get_post_meta($working_print, 'sn', true);
	if(!$sn){
		$sn = generate_sn();
		update_post_meta($working_print, 'sn', $sn);
	}
	$result_obj->data = $saved_content;
	$result_obj->origin_width = $origin_width;
	$result_obj->origin_height = $origin_height;
	$result_obj->actual_width = $actual_width;
	$result_obj->actual_height = $actual_height;
	$result_obj->grid_id = $grid_id;
	$result_obj->min_stroke = $options['wp__stroke_width'];
	echo json_encode($result_obj);
	wp_die();
}


// Ajax function for Load Saved Grid

add_action( 'wp_ajax_load_saved_grid', 'load_saved_grid' );
function load_saved_grid() {
	global $wpdb;
	$uid = get_current_user_id();
	$working_print = $_POST['grid_id'];
	$template = get_post($_POST['grid_id']);
	$saved_content = $template->post_content;
	$options = get_option( 'wp__settings' );
	$origin_width = get_post_meta($working_print, 'origin_width', true);
	$origin_height = get_post_meta($working_print, 'origin_height', true);
	$actual_width = get_post_meta($working_print, 'actual_width', true);
	$actual_height = get_post_meta($working_print, 'actual_height', true);
	$grid_id = get_post_meta($working_print, 'grid_id', true);
	$finished = get_post_meta($working_print, 'finished', true);
	$sn = get_post_meta($working_print, 'sn', true);
	$result_obj->id = $working_print;
	$result_obj->data = $saved_content;
	$result_obj->origin_width = $origin_width;
	$result_obj->origin_height = $origin_height;
	$result_obj->actual_width = $actual_width;
	$result_obj->actual_height = $actual_height;
	$result_obj->grid_id = $grid_id;
	$result_obj->finished = $finished;
	$result_obj->min_stroke = $options['wp__stroke_width'];
	$result_obj->sn = $sn;
	if($finished!=1)
		update_user_meta($uid, 'working_print', $working_print);
	echo json_encode($result_obj);
	wp_die();
}

// Ajax Function for get Template List

add_action( 'wp_ajax_get_template_list', 'get_template_list' );
function get_template_list() {
	global $wpdb;
	$uid = get_current_user_id();
	$templates = get_posts(array(
		'post_type' => 'prints',
		'meta_key' => 'template',
		'meta_value' => true,
		'post_status' => 'any',
	));
	$results=[];
	foreach($templates as $template){
		$preview_image = get_post_meta($template->ID,'template_preview', true);
		$grid = get_post_meta($template->ID, 'grid_id', true);
		$grid_width = get_post_meta($grid, 'wp_grids_actual_width', true);
		$grid_height = get_post_meta($grid, 'wp_grids_actual_height', true);
		$grid_title = get_the_title($grid);
		$results[] = array(
			'id'			=> $template->ID,
			'title'			=> $template->post_title,
			'preview'		=> $preview_image,
			'grid_name'		=> $grid_title,
			'grid_width'	=> $grid_width,
			'grid_height'	=> $grid_height,
		);
	}
	$templates = get_posts(array(
		'post_type' => 'prints',
		'author' => $uid,
		'post_status' => 'any',
	));
	foreach($templates as $template){
		$preview_image = get_post_meta($template->ID,'template_preview', true);
		$grid = get_post_meta($template->ID, 'grid_id', true);
		$grid_width = get_post_meta($grid, 'wp_grids_actual_width', true);
		$grid_height = get_post_meta($grid, 'wp_grids_actual_height', true);
		$grid_title = get_the_title($grid);
		$results[] = array(
			'id'			=> $template->ID,
			'title'			=> $template->post_title,
			'preview'		=> $preview_image,
			'grid_name'		=> $grid_title,
			'grid_width'	=> $grid_width,
			'grid_height'	=> $grid_height,
		);
	}
	echo json_encode($results);
	wp_die();
}

function my_custom_email_content_type() {
    return 'text/html';
}
// Ajax Function for Save Canvas to SVG File

add_action( 'wp_ajax_publish_print', 'publish_print' );
function publish_print() {
	global $wpdb;

	$uid = get_current_user_id();
	/**
	* Saving design as SVG.
	**/

	$working_print = get_user_meta($uid, 'working_print', true);
	$content = $_POST['svg'];
	$content = str_replace('\\', '', $content);
	$filename = $working_print.'.svg';
	$deprecated = null;
	$time = current_time('mysql');
	$upload = wp_upload_bits($filename, $deprecated, $content, $time);
	update_post_meta($working_print, 'svg_file', $upload['url']);
	$svg_file = $upload['file'];

	$pdf_content = $_POST['pdf'];
	$filename = $working_print.'.pdf';
	$deprecated = null;
	$time = current_time('mysql');
	$upload = wp_upload_bits($filename, $deprecated, $pdf_content, $time);
	update_post_meta($working_print, 'pdf_file', $upload['url']);
	$pdf_file = $upload['file'];
	$user_info = get_userdata($uid);
	$user_mail = get_admin_url();
	$user_name = $user_info->first_name.' '.$user_info->last_name;
	$attachments = array($svg_file, $pdf_file);
	wp_mail($user_mail, $user_name.',s Order', $user_name.' has ordered our product', '', $attachments);

	update_post_meta($working_print, 'finished', '1');
	update_post_meta($working_print, 'pdf_file', $upload['url']);
	update_user_meta($uid, 'working_print', '');

	wp_die();
}

// Ajax Function for Set Pickup Store

add_action( 'wp_ajax_set_store', 'set_store' );
function set_store() {
	global $wpdb;
	$uid = get_current_user_id();
	$working_print = get_user_meta($uid, 'working_print', true);
	$grid = get_post_meta($working_print, 'grid_id',true);
	$price = get_post_meta($grid, 'wp_grids_price', true);
	update_post_meta($working_print, 'pickup_store', $_POST['store_id']);
	wp_die();
}

//Ajax Function for Get Picup Store

add_action( 'wp_ajax_get_store', 'get_store' );
function get_store() {
	global $wpdb;
	$uid = get_current_user_id();
	$working_print = get_user_meta($uid, 'working_print', true);
	$store_id = get_post_meta($working_print, 'pickup_store', true);
	$grid_id = get_post_meta($working_print, 'grid_id', true);
	$actual_width = get_post_meta($grid_id, 'wp_grids_actual_width', true);
	$actual_height = get_post_meta($grid_id, 'wp_grids_actual_height', true);
	$grid_price = get_post_meta($grid_id, 'wp_grids_price', true);
	$shipping_price = get_post_meta($store_id, 'wpsl_shiping_fee', true);
	$store_info = get_post_meta($store_id);
	$result_obj->address = $store_info['wpsl_address'][0];
	$result_obj->city = $store_info['wpsl_city'][0];
	$result_obj->state = $store_info['wpsl_state'][0];
	$result_obj->zip = $store_info['wpsl_zip'][0];
	$result_obj->country = $store_info['wpsl_country'][0];
	$result_obj->phone = $store_info['wpsl_phone'][0];
	$result_obj->actual_width = $actual_width;
	$result_obj->actual_height = $actual_height;
	$result_obj->price = '$'.$grid_price.'+ $'.$shipping_price.'(For Shipping)';
	echo json_encode($result_obj);
	wp_die();
}

//Ajax Function for Get List of Saved Grids by User
add_action( 'wp_ajax_get_saved_grids', 'get_saved_grids' );
function get_saved_grids() {
	global $wpdb;
	$uid = get_current_user_id();
	$prints = get_posts(array(
		'post_type'		=> 'prints',
		'author'		=> $uid,
		'post_status'	=> 'any',
	));
	$results=[];
	foreach($prints as $print){
		$template_flg = get_post_meta($print->ID, 'template', true);
		if(!$template_flg){
			$preview_image = get_post_meta($print->ID,'preview', true);
			$grid = get_post_meta($print->ID, 'grid_id', true);
			$grid_width = get_post_meta($grid, 'wp_grids_actual_width', true);
			$grid_height = get_post_meta($grid, 'wp_grids_actual_height', true);
			$grid_title = get_the_title($grid);
			$results[] = array(
				'id'			=> $print->ID,
				'date'			=> $print->post_modified,
				'preview'		=> $preview_image,
				'grid_name'		=> $grid_title,
				'grid_width'	=> $grid_width,
				'grid_height'	=> $grid_height,
			);
		}
	}
	echo json_encode($results);
	wp_die();
}

//Ajax Function for New Template
add_action( 'wp_ajax_new_template', 'new_template');
function new_template() {
	global $wpdb;
	$uid = get_current_user_id();
	update_user_meta($uid, 'working_print', '');
	wp_die();
}

//Ajax Function for Import Design
add_action( 'wp_ajax_import_design', 'import_design' );
function import_design() {
	global $wpdb;
	$design = wp_insert_post(array(
		'post_type'		=> 'grids',
	));
	$cw = $_POST['canvas_width_org'];
	$ch = $_POST['canvas_height_org'];
	$aw = $_POST['actual_width'];
	$ah = $_POST['actual_height'];
	$price = $_POST['price'];
	$img_type = $_POST['img_type'];
	$uid = get_current_user_id();
	$working_print = get_user_meta($uid, 'working_print', true);
	update_post_meta($working_print, 'grid_id', $design);
	update_post_meta($design, 'wp_grids_width', $cw);
	update_post_meta($design, 'wp_grids_height', $ch);
	update_post_meta($design, 'wp_grids_actual_width', $aw);
	update_post_meta($design, 'wp_grids_actual_height', $ah);
	update_post_meta($design, 'wp_grids_price', $price);

	$dataUrl = $_POST['canvas_bg'];
	list($meta, $content) = explode(',', $dataUrl);
	$content = base64_decode($content);

	$filename = $design.'_design.'.$img_type;
	$deprecated = null;
	$time = current_time('mysql');
	$upload = wp_upload_bits($filename, $deprecated, $content, $time);

	$attachment = array(
		'guid'           => $upload['url'], 
		'post_mime_type' => $upload['type'],
		'post_title'     => 'grids_'.$design,
		'post_content'   => '',
		'post_status'    => 'inherit'
	);
	$attach_id = wp_insert_attachment( $attachment, $filename, 0 );
	update_post_meta($design, 'wp_grids_source', $attach_id);
	update_post_meta($design, 'not_showing', 1);

	$result_obj->grid_id = $design;
	echo json_encode($result_obj);
	wp_die();
}

//Ajax Function for Set Template
add_action('wp_ajax_change_template', 'change_template');
function change_template() {
	$template_id = $_POST['template_id'];
	$uid = get_current_user_id();
	$working_print = get_user_meta($uid, 'working_print', true);
	$template = get_post($template_id);
	$origin_width = get_post_meta($template_id, 'origin_width', true);
	$origin_height = get_post_meta($template_id, 'origin_height', true);
	$actual_width = get_post_meta($template_id, 'actual_width', true);
	$actual_height = get_post_meta($template_id, 'actual_height', true);
	$grid_id = get_post_meta($template_id, 'grid_id', true);
	$template_content = $template->post_content;
	if($working_print != '' && $working_print != '0'){
		$print = array(
			'ID'			=> $working_print,
			'post_content'	=> $template_content
		);

		wp_update_post($print);
	}else {
		$print = array(
			'post_content'	=> $template_content,
			'post_type'		=> 'prints'
		);
		$working_print = wp_insert_post($print);
		update_user_meta($uid, 'working_print', $working_print);
	}

	update_post_meta($working_print, 'origin_width', $origin_width );
	update_post_meta($working_print, 'origin_height', $origin_height );
	update_post_meta($working_print, 'actual_width', $actual_width);
	update_post_meta($working_print, 'actual_height', $actual_height);
	update_post_meta($working_print, 'grid_id', $grid_id );

	$pages = query_posts(array(
		'post_type' => 'page',
		'meta_key'  => '_wp_page_template',
		'meta_value'=> 'editor_template.php'
	));

	$url = null;
	if(isset($pages[0])) {
		$url = get_page_link($pages[0]->ID);
	}
	echo json_encode(array(
		'result'			=> true,
		'redirect'			=> $url,
	));
	wp_die();
}

//Ajanx Function for Setting product
add_action('wp_ajax_before_checkout', 'before_checkout');
function before_checkout() {
	global $woocommerce;
	$uid = get_current_user_id();
	$working_print = get_user_meta($uid, 'working_print', true);
	$grid_id = get_post_meta($working_print, 'grid_id', true);
	$grid_price = get_post_meta($grid_id, 'wp_grids_price', true);
	$a_width = get_post_meta($grid_id, 'wp_grids_actual_width', true);
	$a_height = get_post_meta($grid_id, 'wp_grids_actual_height', true);
	$pickup_store = get_post_meta($working_print, 'pickup_store', true);
	$shipping_price = get_post_meta($pickup_store, 'wpsl_shiping_fee', true);
	$address = get_post_meta($pickup_store, 'wpsl_address', true);
	$city = get_post_meta($pickup_store, 'wpsl_city', true);
	$state = get_post_meta($pickup_store, 'wpsl_state', true);
	$zip = get_post_meta($pickup_store, 'wpsl_zip', true);
	$country = get_post_meta($pickup_store, 'wpsl_country', true);
	$grid_title = get_the_title($grid_id);

	$post_id = wp_insert_post( array(
	    'post_title' => $grid_title,
	    'post_content' => '',
	    'post_status' => 'publish',
	    'post_type' => "product",
	) );
	wp_set_object_terms( $post_id, 'simple', 'product_type' );
	update_post_meta( $post_id, '_visibility', 'visible' );
	update_post_meta( $post_id, '_stock_status', 'instock');
	update_post_meta( $post_id, 'total_sales', '0' );
	update_post_meta( $post_id, '_downloadable', 'no' );
	update_post_meta( $post_id, '_virtual', 'no' );
	update_post_meta( $post_id, '_regular_price', '' );
	update_post_meta( $post_id, '_sale_price', '' );
	update_post_meta( $post_id, '_purchase_note', '' );
	update_post_meta( $post_id, '_featured', 'no' );
	update_post_meta( $post_id, '_weight', '' );
	update_post_meta( $post_id, '_length', '' );
	update_post_meta( $post_id, '_width', '' );
	update_post_meta( $post_id, '_height', '' );
	update_post_meta( $post_id, '_sku', '' );
	update_post_meta( $post_id, '_product_attributes', array() );
	update_post_meta( $post_id, '_sale_price_dates_from', '' );
	update_post_meta( $post_id, '_sale_price_dates_to', '' );
	update_post_meta( $post_id, '_price', $grid_price + $shipping_price );
	update_post_meta( $post_id, '_sold_individually', '' );
	update_post_meta( $post_id, '_manage_stock', 'no' );
	update_post_meta( $post_id, '_backorders', 'no' );
	update_post_meta( $post_id, '_stock', '' );
	update_post_meta( $post_id, '_selected_print', $working_print);
	$woocommerce->cart->add_to_cart($post_id);
	$cart_url = $woocommerce->cart->get_cart_url();
	echo $cart_url;
	wp_die();
}
?>