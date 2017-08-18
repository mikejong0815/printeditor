<?php
	/**
	* Add Custom Post Types for Images, Prints, Grids, and Fonts.
	*/

	add_action( 'init', 'create_post_type' );

	function create_post_type() {

		// Custom Post Type for Images
	  register_post_type( 'images',
	    array(
	      'labels' => array(
	        'name' => __( 'Images' ),
	        'singular_name' => __( 'Image' )
	      ),
	      'supports' => array( 'title' ),
	      'public' => true,
	      'has_archive' => true,
	      'taxonomies' => array('category'),
	    )
	  );

	  // Custom Post Type for Prints
	  register_post_type( 'prints',
	    array(
	      'labels' => array(
	        'name' => __( 'Prints' ),
	        'singular_name' => __( 'Print' )
	      ),
	      'supports' => array( 'title' ),
	      'public' => true,
	      'has_archive' => true,
	    )
	  );

	  // Custom Post Type for Fonts
	  register_post_type( 'fonts',
	    array(
	      'labels' => array(
	        'name' => __( 'Fonts' ),
	        'singular_name' => __( 'Font' )
	      ),
	      'supports' => array( 'title' ),
	      'public' => true,
	      'has_archive' => true,
	    )
	  );

	  // Custom Post Type for Grids
	  register_post_type( 'grids',
	    array(
	      'labels' => array(
	        'name' => __( 'Grids' ),
	        'singular_name' => __( 'Grid' )
	      ),
	      'supports' => array( 'title' ),
	      'public' => true,
	      'has_archive' => true,
	    )
	  );
	}

	/**
	* Add Custom Meta Boxes for Images
	* Requires Meta-Box plugin version 4.11
	*/
	add_filter( 'rwmb_meta_boxes', 'wp_images_meta_boxes' );
	function wp_images_meta_boxes( $meta_boxes ) {
		$prefix = "wp_images_";
	    $meta_boxes[] = array(
	      'title'      => __( 'Large Image', 'textdomain' ),
	      'post_types' => 'images',
	      'fields'     => array(
	        array(
	          'id'   				=> $prefix.'image_source',
	          'name' 				=> __( 'Upload Large Image', 'textdomain' ),
	          'type' 				=> 'image_advanced',
	          'force_delete' 		=> false,
	          'max_file_uploads' 	=> 1,
	          'max_status' 			=> false,
	        ),
	        array(
	          'id'      => $prefix.'minimum_image_width',
	          'name'    => __( 'Minimum Scale Width', 'textdomain' ),
	          'type'    => 'text',
	        ),
	        array(
	          'id'      => $prefix.'minimum_image_height',
	          'name'    => __( 'Minimum Scale Height', 'textdomain' ),
	          'type'    => 'text',
	        ),
	      ),
	    );
    	return $meta_boxes;
	}

	/**
	* Add Custom Meta Boxes for Fonts
	* Requires Meta-Box plugin version 4.11
	*/

	add_filter( 'rwmb_meta_boxes', 'wp_fonts_meta_boxes' );
	function wp_fonts_meta_boxes( $meta_boxes ) {
		$prefix = "wp_fonts_";
    $meta_boxes[] = array(
      'title'      => __( 'Font', 'textdomain' ),
      'post_types' => 'fonts',
      'fields'     => array(
        array(
          'id'   	=> $prefix.'source',
          'name' 	=> __( 'Google Font URL', 'textdomain' ),
          'type' 	=> 'url',
        ),
        array(
        	'id'	=> $prefix.'type',
        	'name'	=> __( 'Font Type', 'textdomain' ),
        	'type'	=> 'text',
        ),
        array(
        	'id'	=> $prefix.'min_font_size',
        	'name'	=> __( 'Minimum Font Size', 'textdomain' ),
        	'type'	=> 'text'
        ),
      ),
    );
    return $meta_boxes;
	}

	/**
	* Add Custom Meta Boxes for Grids
	* Requires Meta-Box plugin version 4.11
	*/

	add_filter( 'rwmb_meta_boxes', 'wp_grids_meta_boxes' );
	function wp_grids_meta_boxes( $meta_boxes ) {
		$prefix = "wp_grids_";
    $meta_boxes[] = array(
      'title'      => __( 'Grid', 'textdomain' ),
      'post_types' => 'grids',
      'fields'     => array(
        array(
          'id'   							=> $prefix.'source',
          'name' 							=> __( 'Upload Grid File', 'textdomain' ),
          'type' 							=> 'image_advanced',
          'max_file_uploads' 	=> 1,
          'max_status' 				=> false,
        ),
        array(
			'name' => esc_html__( 'Grid Width(px)', 'your-prefix' ),
			'id'   => $prefix."width",
			'type' => 'text',
		),
		array(
			'name' => esc_html__( 'Grid Height(px)', 'your-prefix' ),
			'id'   => $prefix."height",
			'type' => 'text',
		),
		array(
			'name' => esc_html__( 'Grid Width(mm)', 'your-prefix' ),
			'id'   => $prefix."actual_width",
			'type' => 'text',
		),
		array(
			'name' => esc_html__( 'Grid Height(mm)', 'your-prefix' ),
			'id'   => $prefix."actual_height",
			'type' => 'text',
		),
        array(
			'name' => esc_html__( 'Grid Description', 'your-prefix' ),
			'id'   => $prefix."description",
			'type' => 'textarea',
			'cols' => 20,
			'rows' => 3,
		),
		array(
			'name' => esc_html__( 'Grid Price', 'your-prefix' ),
			'id'   => $prefix."price",
			'type' => 'text',
		),
      ),
    );
    return $meta_boxes;
	}

	/**
	* Add Global Option Page
	*/

	add_action( 'admin_menu', 'wp__add_admin_menu' );
	add_action( 'admin_init', 'wp__settings_init' );


	function wp__add_admin_menu(  ) { 

		add_menu_page( 'Editor Settings', 'Editor', 'manage_options', 'editor', 'wp__options_page' );

	}


	function wp__settings_init(  ) { 

		register_setting( 'pluginPage', 'wp__settings' );

		add_settings_section(
			'wp__pluginPage_section', 
			__( 'Editor Settings', 'textdomain' ), 
			'wp__settings_section_callback', 
			'pluginPage'
		);

		add_settings_field( 
			'wp__product_color', 
			__( 'Product Color', 'textdomain' ), 
			'wp__product_color_render', 
			'pluginPage', 
			'wp__pluginPage_section' 
		);

		add_settings_field( 
			'wp__font_sizes', 
			__( 'Font Sizes', 'textdomain' ), 
			'wp__font_sizes_render', 
			'pluginPage', 
			'wp__pluginPage_section' 
		);

		add_settings_field( 
			'wp__stroke_width',
			__( 'Minimum Stroke Width', 'textdomain' ), 
			'wp__stroke_width_render', 
			'pluginPage', 
			'wp__pluginPage_section' 
		);

	}


	function wp__product_color_render(  ) { 

		$options = get_option( 'wp__settings' );
		?>
			<textarea cols='40' rows='5' name='wp__settings[wp__product_color]'><?php echo esc_html__($options['wp__product_color']); ?></textarea>
		<?php

	}


	function wp__font_sizes_render(  ) { 

		$options = get_option( 'wp__settings' );
		?>
		<input type='text' name='wp__settings[wp__font_sizes]' value='<?php echo $options['wp__font_sizes']; ?>'>
		<?php

	}

	function wp__stroke_width_render(  ) { 

		$options = get_option( 'wp__settings' );
		?>
		<input type='text' name='wp__settings[wp__stroke_width]' value='<?php echo $options['wp__stroke_width']; ?>'>
		<?php

	}


	function wp__settings_section_callback(  ) { 

		echo __( 'This section description', 'textdomain' );

	}


	function wp__options_page(  ) { 

		?>
		<form action='options.php' method='post'>

			<h2>Editor</h2>

			<?php
			settings_fields( 'pluginPage' );
			do_settings_sections( 'pluginPage' );
			submit_button();
			?>

		</form>
		<?php

	}
?>