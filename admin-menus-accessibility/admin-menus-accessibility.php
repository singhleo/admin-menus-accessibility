<?php
/*
Plugin Name: Admin Menus Accessibility
Description: A wordpress plugin which adds extra accessibility feature into backend admin menus.
Version: 1.0.4
Author: Ayush
Author URI: #
*/
/**
 * The Admin Menus Accessibility Plugin
 *
 * Admin Menus Accessibility is a wordpress plugin which adds extra accessibility feature into admin menu.
 *
 **/

// Make sure we don't expose any info if called directly
if ( !function_exists( 'add_action' ) ) {
	echo 'I\'m just a plugin, don\'t call me directly.';
	exit;
}
/**
 * Class admin_menu_accessibility
 */
class admin_menu_accessibility {

	public $plugin_url;
	public $plugin_dir;
	public $plugin_prefix;
	public $plugin_version;
	public $domain;

	/**
	 * admin_menu_accessibility constructor.
	 */
	public function __construct() {

		$this->plugin_version = '1.0.3';
		$this->plugin_dir     = plugin_dir_path( __FILE__ );
		$this->plugin_url     = plugin_dir_url( __FILE__ );
		$this->plugin_prefix  = "am_accessibility";
		$this->domain         = "admin-menus-accessibility";

		spl_autoload_register( array( $this, "autoload" ) );

		//register all hooks.
		$this->hooks();

		// Load Main Class
		am_accessibility_main::instance();
	}

   /**
    * Magic auto load class method
    * @param  classname $class_name
    * @return void
    */
   function autoload($class_name) {
       $class_name = strtolower($class_name);

       // Only include class which are related to this plugin.
       if(strpos($class_name,$this->plugin_prefix) !== false) {

         $path  = dirname(__FILE__)."/include/class.{$class_name}.php";
         if (file_exists($path)) {
             require_once($path);
         } else {
             die("The file {$class_name}.php could not be found!");
         }
      }
    }

   /**
    * Register all hooks
    * @since 1.0,0
    * @return void
    */
    function hooks() {

	    add_action( 'plugins_loaded', array( $this, "load_textdomain" ) );
	    register_activation_hook( __FILE__, array( $this, 'on_plugin_activate' ) );
	    // Assets
	    add_action( 'admin_enqueue_scripts', array( $this, "admin_enqueue_assets" ) );

    }

	/**
	 * Loads js & css
	 */
    function admin_enqueue_assets() {

        wp_enqueue_style( 'jquery.growl', $this->plugin_url . "asset/jquery.growl.css" );
        wp_enqueue_style( $this->plugin_prefix.'style', $this->plugin_url . "asset/style-admin.css" );
        wp_enqueue_script( $this->plugin_prefix.'action', $this->plugin_url . "asset/action-admin.js", array('jquery'), '1.0.0', true );

        $translation_array = array(
          'fav_added' => __( '<b>{{ITEM}}</b> menu added to your fav.', 'admin-menus-accessibility' ),
          'fav_removed' => __( '<b>{{ITEM}}</b> menu removed from your fav.', 'admin-menus-accessibility' ),
          'do_unfav' => __( 'Remove from fav..', 'admin-menus-accessibility' ),
          'do_fav' => __( 'Add to fav.', 'admin-menus-accessibility' ),
        );
        wp_localize_script( $this->plugin_prefix.'action', 'ama_translate', $translation_array );

        wp_enqueue_script( 'jquery.growl', $this->plugin_url."asset/jquery.growl.js", array('jquery'), '1.0.0', true );
    }

   /**
    * Loads text domain
    * @since 1.0.0
    * @return void
    */
   function load_textdomain() {
        load_plugin_textdomain( $this->domain, false, dirname( plugin_basename( __FILE__ ) ) . '/langs/' );
   }

	/**
	 * triggers on plugin activate
	 */
   function on_plugin_activate() {
  	   do_action("{$this->plugin_prefix}_on_plugin_activate");
   }
}

/**
 * Define global variable
 */

global $admin_menu_accessibility;

/**
 * [$admin_menu_accessibility description]
 * @var admin_menu_accessibility
 */

$admin_menu_accessibility = new admin_menu_accessibility();

/**
 * Will be a quick get helper.
 *
 * @return void Object
 */
function admin_menu_accessibility() {
	global $admin_menu_accessibility;

	return $admin_menu_accessibility;
}
