<?php
/**
 * Displays header site branding
 *
 * @package WordPress
 * @subpackage Twenty_Seventeen
 * @since 1.0
 * @version 1.0
 */
$grids = query_posts(array('post_type' => 'grids'));
?>
<div class="loading_blanket">
</div>
<div class="site-branding">
	<?php the_custom_logo(); ?>

	<div class="site-branding-text">
		<?php if ( is_front_page() ) : ?>
			<h1 class="site-title"><a href="<?php echo esc_url( home_url( '/' ) ); ?>" rel="home"><?php bloginfo( 'name' ); ?></a></h1>
		<?php else : ?>
			<p class="site-title"><a href="<?php echo esc_url( home_url( '/' ) ); ?>" rel="home"><?php bloginfo( 'name' ); ?></a></p>
		<?php endif; ?>

		<?php $description = get_bloginfo( 'description', 'display' );
			if ( $description || is_customize_preview() ) : ?>
				<p class="site-description"><?php echo $description; ?></p>
			<?php endif; ?>
	</div><!-- .site-branding-text -->
	<?php if(is_user_logged_in() && count($grids) > 0 && get_page_template_slug() == 'editor_template.php'):?>
		<div class="header-control">
			<a class="btn btn-default" onclick="print_canvas()">Print</a>
			<a class="btn btn-default" onclick="showGridSelector()">Choose A Grid</a>
			<?php if(current_user_can('administrator')): ?>
				<div class="dropdown">
				    <button class="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" id="dropdownMenu">Actions</button>

				    <div class="dropdown-menu" aria-labelledby="dropdownMenu">
				        <a class="dropdown-item" href="javascript:;" onclick="showTemplateSaveDlg()">Save Template</a>
				        <a class="dropdown-item" href="javascript:;" onclick="newTemplate()">New Template</a>
				        <a class="dropdown-item" href="javascript:;" onclick="getTemplateList(true)">Load Saved Template</a>
				        <a class="dropdown-item" href="javascript:;" onclick="loadImageTemplate()">Load from Image</a>
				    </div>
				</div>
			<?php else: ?>
				<?php
					$pages = query_posts(array(
						'post_type' => 'page',
						'meta_key'  => '_wp_page_template',
						'meta_value'=> 'dropbox_template.php'
					));
					$dropbox_url = null;
					if(isset($pages[0])) {
						$dropbox_url = get_page_link($pages[0]->ID);
					}
				?>
				<div class="dropdown">
				    <button class="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" id="dropdownMenu">Actions</button>

				    <div class="dropdown-menu" aria-labelledby="dropdownMenu">
				        <a class="dropdown-item" href="javascript:;" onclick="onAutoSave()">Save Design</a>
				        
				        <a id="order_now_btn" class="dropdown-item" href="javascript:;" onclick="beforePayment()">Order Now</a>
				        <!-- <a class="dropdown-item" href="javascript:;" onclick="getTemplateList()">Ruzel Templates</a> -->
				        <a class="dropdown-item" href="<?php echo $dropbox_url;?>">User Templates</a>
				    </div>
				</div>
			<?php endif;?>
		</div>
	<?php endif;?>
	<?php if (get_page_template_slug()=='dropbox_template.php'):?>
		<div class="header-control">
			<select class="mdb-select" id="grid_filter">
				<option value="-1">Show All</option>
				<?php
					foreach($grids as $grid):
						$meta = get_post_meta($grid->ID);
						$width = $meta['wp_grids_width'][0];
						$height = $meta['wp_grids_height'][0];
				?>
			    	<option value="<?php echo $grid->ID;?>"><?php echo $grid->post_title;?> (<?php echo $width.' X '.$height;?>)</option>
			    <?php
			    	endforeach;
			    ?>
			    <option value="-2">Other</option>
			</select>
		</div>
	<?php endif;?>
	<?php if ( ( twentyseventeen_is_frontpage() || ( is_home() && is_front_page() ) ) && ! has_nav_menu( 'top' ) ) : ?>
	<a href="#content" class="menu-scroll-down"><?php echo twentyseventeen_get_svg( array( 'icon' => 'arrow-right' ) ); ?><span class="screen-reader-text"><?php _e( 'Scroll down to content', 'twentyseventeen' ); ?></span></a>
	<?php endif; ?>
</div><!-- .site-branding -->
