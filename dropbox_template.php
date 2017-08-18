<?php
/**
 * Template Name: Design Template Page Template
 *
 * @link https://codex.wordpress.org/Template_Hierarchy
 *
 * @package WordPress
 * @subpackage Twenty_Seventeen
 * @since 1.0
 * @version 1.0
 */

$templates = get_posts(array(
    'post_type' => 'prints',
    'meta_key' => 'template',
    'meta_value' => true,
    'post_status' => 'any',
));
$user_templates = get_posts(array(
    'post_type' => 'prints',
    'author' => $uid,
    'post_status' => 'any',
));
$templates = array_merge($templates, $user_templates);

get_header(); ?>
<div class="grid_template_container col-md-12">
    <?php
    foreach($templates as $template) {
        $preview_image = get_post_meta($template->ID,'template_preview', true);
        $grid = get_post_meta($template->ID, 'grid_id', true);
        $grid_width = get_post_meta($grid, 'wp_grids_actual_width', true);
        $grid_height = get_post_meta($grid, 'wp_grids_actual_height', true);
        $grid_title = get_the_title($grid);
        $price = get_post_meta($grid, 'wp_grids_price', true);
        if($grid){
            $class = 'grid_'.$grid;
        }else 
            $class = 'other';
    ?>
        <div class="template_preview_wrapper <?php echo $class;?>">
            <div class="template_preview_container">
                <img class="" src="<?php echo $preview_image;?>"  onclick="startPreview(<?php echo $template->ID;?>,'<?php echo $preview_image;?>')">
                <div class="template_title_container">
                    <?php echo $template->post_title;?>
                </div>
                <div class="template_info_container">
                    <div class="template_info_parts col-md-6">
                        <div class="template_info">
                            <label>Grid:</label> <?php echo $grid_title;?>
                        </div>
                        <div class="template_info">
                            <label>Price:</label> <?php echo $price;?>
                        </div>
                        <div class="template_info">
                            <label>Grid Size:</label> <?php echo $grid_width.' X '.$grid_height.'mm';?>
                        </div>
                    </div>
                    <div class="template_info_parts col-md-6">
                        <button type="button" class="btn btn-primary" onclick="chooseTemplate(<?php echo $template->ID;?>)">Choose Template</button>
                    </div>
                </div>
            </div>
        </div>
    <?php
    }
    ?>
</div>

<?php get_footer();?>
