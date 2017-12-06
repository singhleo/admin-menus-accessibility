<?php
/*
Plugin Name: Admin Menus Accessibility
Description: A wordpress plugin which adds extra accessibility feature into backend admin menus.
Version: 1.0.3
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
    * [__construct description]
    */
   public function __construct() {

	      $this->plugin_version = '1.0.3';
        $this->plugin_dir = plugin_dir_path( __FILE__ );
        $this->plugin_url = plugin_dir_url( __FILE__ );
        $this->plugin_prefix = "am_accessibility";
        $this->domain = "admin-menus-accessibility";

        spl_autoload_register( array($this,"autoload") );

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

        add_action( 'plugins_loaded', array($this,"load_textdomain") );
	      register_activation_hook( __FILE__, array($this,'on_plugin_activate') );

        // Assets
        add_action( 'admin_enqueue_scripts', array($this,"admin_enqueue_assets") );

        // Add Settings link
        add_filter( 'plugin_action_links_'.plugin_basename( __FILE__ ), array($this, "settings_link") );
        add_action( 'admin_menu', array($this, "settings_page_link") );
    }

    function settings_link( $links ) {
      $settings_link = '<a href="'.admin_url('plugins.php?page=admin-menus-accessibility').'">'.__('Settings', 'admin-menus-accessibility').'</a>';
      array_unshift( $links, $settings_link );
      return $links;
    }

    function settings_page_link() {
      add_submenu_page( null, 'cetiri', 'tri', 'manage_options', 'admin-menus-accessibility', array($this, 'settings_page'));
    }

    function settings_page() {

      // save Settings
      if (isset($_POST['SaveSettings'])) {
        if (isset($_POST['favoritesenabled'])) {
          $this->favoritesenabled = true;
        } else {
          $this->favoritesenabled = false;
        }

        update_option('admin_menus_accessibility_favoritesenabled', $this->favoritesenabled);

        // refresh page to get new settings active
        ?><script>window.location = window.location.href;</script><?php
        return;
      }

      ?>
      <form method="post">
        <h2>Admin Menus Accessibility Settings:</h2>
        <?php
          $this->favoritesenabled = get_option( 'admin_menus_accessibility_favoritesenabled' );
        ?>
            <input type='checkbox' name='favoritesenabled' <?php checked( $this->favoritesenabled, 1 ); ?> value='1'>enable favorites</input><br><br>
            <input type='submit' name='SaveSettings' value='Save Settings' class='button button-primary'></input>
      </form>
      <?php
    }

    /*
    * load all core style and js files for backend.
    */
    function admin_enqueue_assets() {

        wp_enqueue_style( 'font-awesome', "//maxcdn.bootstrapcdn.com/font-awesome/4.6.3/css/font-awesome.min.css" );
        wp_enqueue_style( 'jquery.growl', $this->plugin_url . "asset/jquery.growl.css" );
        wp_enqueue_style( $this->plugin_prefix.'style', $this->plugin_url . "asset/style-admin.css" );
        wp_enqueue_script( $this->plugin_prefix.'action', $this->plugin_url . "asset/action-admin.js", array('jquery'), '1.0.0', true );

        $translation_array = array(
          'fav_added' => __( '<b>{{ITEM}}</b> menu added to your fav.', 'admin-menus-accessibility' ),
          'fav_removed' => __( '<b>{{ITEM}}</b> menu removed from your fav.', 'admin-menus-accessibility' ),
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
	 * [on_plugin_activate description]
	 * @return [type] [description]
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
 * @return void Object
 */
function admin_menu_accessibility() {
    global $admin_menu_accessibility;
    return $admin_menu_accessibility;
}
