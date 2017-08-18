<?php
/**
 * Template Name: Editor Page Template
 *
 * @link https://codex.wordpress.org/Template_Hierarchy
 *
 * @package WordPress
 * @subpackage Twenty_Seventeen
 * @since 1.0
 * @version 1.0
 */

$fonts = query_posts(array('post_type' => 'fonts', 'posts_per_page' => -1));
$u_id = get_current_user_id();
$print_id = get_user_meta($u_id, 'working_print', true);
$grid_id = get_post_meta($print_id, 'grid_id', true);
$price = get_post_meta($grid_id, 'wp_grids_price', true);
$grids = query_posts(array('post_type'=> 'grids', 'posts_per_page' => -1));
get_header(); ?>
<div class="drawContainer">
	<div class="toolbox card">
		<ul class="tools">
			<li>
				<a href="javascript:;" id="imageButton" onclick="imageSelector()"><i class="fa fa-image fa-2x" aria-hidden="true"></i></a>
			</li>
			<li>
				<a href="javascript:;" id="textButton" onclick="drawText()"><i class="fa fa-font fa-2x" aria-hidden="true"></i></a>
			</li>
			<li>
				<a href="javascript:;" id="triangleButton" onclick="drawTriangle()"><i class="fa fa-sort-up fa-2x" aria-hidden="true"></i></a>
			</li>
			<li>
				<a href="javascript:;" id="rectButton" onclick="drawRectangle()"><i class="fa fa-square fa-2x" aria-hidden="true"></i></a>
			</li>
			<li>
				<a href="javascript:;"  id="circleButton" onclick="drawCircle()"><i class="fa fa-circle fa-2x" aria-hidden="true"></i></a>
			</li>
			<li>
				<a href="javascript:;" id="lineButton" onclick="drawLine()"><i class="fa fa-pencil fa-2x" aria-hidden="true"></i></a>
			</li>
		</ul>
	</div>
    <div id="grid-title-holder">
    </div>
	<div id="zoom-slider" style="width: 200px;">
	</div>
	<div class="drawboard">
		<canvas id="canvas" width="1000" height="400">
		</canvas>
	</div>
	<div class="card object-customizer default-customizer" style="display:none;">
		<div class="card-block">
			<fieldset class="form-group">
				<input type="checkbox" id="fill_objects">
				<label for="fill_objects">Fill</label>
			</fieldset>
			<div class="md-form">
				<input type="text"  placeholder="Stroke Width in Pixel" class="stroke_width" id="object-stroke" />
				<label for="object-stroke">Stroke Width</label>
			</div>
		</div>
	</div>
	<div class="card object-customizer line-customizer" style="display:none;">
		<div class="card-block">
			<div class="md-form">
	            <input type="text" placeholder="Stroke Width in Pixel" class="form-control stroke_width" id="line-stroke">
	            <label for="line-stroke">Stroke Width</label>
	        </div>
	    </div>
	</div>
	<div class="card object-customizer text-customizer" style="display:none;">
		<div class="card-block">
			<div class="md-form">
				<input type="text" placeholder="Your Text" class="form-control" id="text_content"/>
				<label for="text_content">Text</label>
			</div>
			<div class="md-form">
				<select id="font_selector">
					<?php
						if(count($fonts) > 0){
							foreach($fonts as $key => $font){
								$meta = get_post_meta($font->ID);
								$min_font_size = $meta['wp_fonts_min_font_size'][0];
								$font_url = $meta['wp_fonts_source'][0];
					?>
					<option class="font_options" <?php echo $key==0 ? 'selected="selected"' : ''; ?> value="<?php echo $font->post_title;?>" min_font_size="<?php echo $min_font_size;?>" font_url="<?php echo $font_url; ?>">
						<?php echo $font->post_title;?>
					</option>
					<?php	}
						}
					?>
				</select>
			</div>
		</div>
	</div>
</div><!-- .wrap -->


<div class="modal fade" id="centralModalSuccess" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-notify modal-success" role="document" style="max-width: 1000px !important; width: 80% !important;">
        <!--Content-->
        <div class="modal-content">
            <!--Header-->
            <div class="modal-header">
                <p class="heading lead">Select Your Pick Up Location and Finalize Your Order</p>

                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true" class="white-text">&times;</span>
                </button>
            </div>

            <!--Body-->
            <div class="modal-body" style="position:relative !important;">
                <?php echo do_shortcode('[wpsl]'); ?>
            </div>

            <!--Footer-->
            <div class="modal-footer flex-center">
                <div id="payment_button_container">
                    <button class="btn btn-primary" onclick="checkoutProduct()">Checkout Product</button>
                </div>
            </div>
        </div>
        <!--/.Content-->
    </div>
</div>

<div class="modal fade" id="selectTemplateModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-notify modal-success" role="document" style="max-width: 1000px !important; width: 80% !important;">
        <!--Content-->
        <div class="modal-content">
            <!--Header-->
            <div class="modal-header">
                <p class="heading lead">Select a Template</p>

                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true" class="white-text">&times;</span>
                </button>
            </div>

            <!--Body-->
            <div class="modal-body" style="position:relative !important;">
            	<div id="template_list_holder">
            	</div>
            </div>

            <!--Footer-->
            <div class="modal-footer flex-center">
                
            </div>
        </div>
        <!--/.Content-->
    </div>
</div>

<div class="modal fade" id="chooseTemplateName" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-notify modal-success" role="document" style="max-width: 1000px !important; width: 80% !important;">
        <!--Content-->
        <div class="modal-content">
            <!--Header-->
            <div class="modal-header">
                <p class="heading lead">Choose Name for a Template</p>

                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true" class="white-text">&times;</span>
                </button>
            </div>

            <!--Body-->
            <div class="modal-body" style="position:relative !important;">
            	<div class="md-form">
		            <input type="text" placeholder="Template Name" class="form-control template_name" id="template-name">
		            <label for="template-name">Template Name</label>
		        </div>
            </div>

            <!--Footer-->
            <div class="modal-footer flex-center">
                <button type="button" class="btn btn-default" onclick="saveAsTemplate()">Save Template</button>
            </div>
        </div>
        <!--/.Content-->
    </div>
</div>

<div class="modal fade" id="chosePastGrid" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-notify modal-success" role="document" style="max-width: 1000px !important; width: 80% !important;">
        <!--Content-->
        <div class="modal-content">
            <!--Header-->
            <div class="modal-header">
                <p class="heading lead">Choose A Saved Grid to See</p>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true" class="white-text">&times;</span>
                </button>
            </div>

            <!--Body-->
            <div class="modal-body" style="position:relative !important;">
            	<div id="savedGridPreview">
		            
		        </div>
            </div>
        </div>
        <!--/.Content-->
    </div>
</div>

<div class="modal fade" id="designDetails" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-notify modal-success" role="document" style="max-width: 1000px !important; width: 80% !important;">
        <!--Content-->
        <div class="modal-content">
            <!--Header-->
            <div class="modal-header">
                <p class="heading lead">Upload the new Design in PNG format</p>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true" class="white-text">&times;</span>
                </button>
            </div>

            <!--Body-->
            <div class="modal-body" style="position:relative !important;">
                <div class="md-form">
                    <input type="text" placeholder="Actual Width" class="form-control actual_width" id="actual_width">
                    <label for="actual_width">Actual Width</label>
                </div>
                <div class="md-form">
                    <input type="text" placeholder="Actual Height" class="form-control actual_height" id="actual_height">
                    <label for="actual_height">Actual Height</label>
                </div>
                <div class="md-form">
                    <input type="text" placeholder="Canvas Width" class="form-control canvas_width" id="canvas_width">
                    <label for="canvas_width">Canvas Width</label>
                </div>
                <div class="md-form">
                    <input type="text" placeholder="Canvas Height" class="form-control canvas_height" id="canvas_height">
                    <label for="canvas_height">Canvas Height</label>
                </div>
                <div class="md-form">
                    <input type="text" placeholder="Canvas Price" class="form-control canvas_price" id="canvas_price">
                    <label for="canvas_price">Canvas Price</label>
                </div>
                <div class="file-field">
                    <div class="btn btn-primary btn-sm">
                        <span>Choose file</span>
                        <input type="file" id="design_selector" onchange="design_selected()">
                    </div>
                    <div class="preview_container">
                        <img id="image_previewer"/>
                    </div>
                </div>
            </div>
            <div class="modal-footer flex-center">
                <button type="button" class="btn btn-default" id="load_design_button" onclick="loadNewDesign()">Load Image</button>
            </div>
        </div>
        <!--/.Content-->
    </div>
</div>

<div class="modal fade" id="selectGrid" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-notify modal-success" role="document" style="max-width: 1000px !important; width: 80% !important;">
        <!--Content-->
        <div class="modal-content">
            <!--Header-->
            <div class="modal-header">
                <p class="heading lead">Select A Grid</p>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true" class="white-text">&times;</span>
                </button>
            </div>

            <!--Body-->
            <div class="modal-body" style="position:relative !important;">
                <?php
                    foreach($grids as $grid_info) {
                        $meta_keys = get_post_meta($grid_info->ID);
                        $a_width = $meta_keys['wp_grids_actual_width'][0];
                        $a_height = $meta_keys['wp_grids_actual_height'][0];
                        $grid_price = $meta_keys['wp_grids_price'][0];
                        $image_id = $meta_keys['wp_grids_source'][0];
                        $grid_title = $grid_info->post_title;
                        $preview_img_url = wp_get_attachment_image_src($image_id, 'medium')[0];
                        if($preview_img_url):
                    ?>
                        <div class="col-md-4 grid_info_wrapper">
                            <div class="grid_title_holder">
                                <?php echo $grid_title;?>
                            </div>
                            <img src="<?php echo $preview_img_url;?>"/>
                            <div class="grid_info_content">
                                <label>Grid Size:</label> <?php echo $a_width.' X '.$a_height.' mm';?>
                            </div>
                            <div class="grid_info_content">
                                <label>Grid Price:</label> <?php echo '$'.$grid_price;?>
                            </div>
                            <div class="gird_selector_btn_wrapper">
                                <button class="btn btn-primary" onclick="setGrid(<?php echo $grid_info->ID;?>)">Choose Grid</button>
                            </div>
                        </div>
                    <?php
                        endif;
                    }
                ?>
            </div>
            <div class="modal-footer flex-center">
                
            </div>
        </div>
        <!--/.Content-->
    </div>
</div>

<?php get_footer();?>
