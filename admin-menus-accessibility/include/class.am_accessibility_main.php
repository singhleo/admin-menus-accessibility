<?php
/**
 * Admin Menus Accessibility Main Functionality
 *
 * Init the plugin and load other feature into wordpress.
 *
 **/

class am_accessibility_main {

    private static $instance;

	function __construct() {
	}

    public static function instance()
    {
        if (!isset(self::$instance)) {
            $class = __CLASS__;
            self::$instance = new $class;
            self::$instance->hooks(); // run the hooks.
        }
        return self::$instance;
    }

    function domain() {
        return admin_menu_accessibility()->domain;
    }

	function hooks() {
        // output all necessary UI needed
        add_filter("adminmenu", array($this,"search_ui"));

        // ajax functionality for fav btn
        add_action( 'wp_ajax_ama_fav', array($this,"fav_ajax") );
        add_action( 'wp_ajax_nopriv_ama_fav', array($this,"fav_ajax") );
	}

    /**
     * Output the necessary UI above admin menu.
     * @return void
     */
    function search_ui() {
        ob_start();

        echo '<div class="ama_adminmenu">'; // this container will be move above using js.

        echo '<ul class="tabs">';
        echo '<li class="wp-menu-arrow all">'.__("All",$this->domain()).'</li>';
        echo '<li class="fav"><i class="fa fa-heart"></i> '.__("Fav",$this->domain()).'</li>';
        echo '</ul>';

        $fav = get_user_meta(get_current_user_id(),"ama_fav",true);
        if(!is_array($fav))
            $fav = array();

        // Search Input
        echo '
            <script>
            window.ama_fav = '.json_encode( $fav ).';
            </script>
            <input type="text" id="ama_search" placeholder="'.__("Filter Menus",$this->domain()).'"/>
        ';

        echo '</div>';

        $content = ob_get_contents();

        ob_clean();

        echo $content;

    }

    function fav_ajax(){

        if(!is_user_logged_in()){
            return '0';
        }

        $href = trim(@$_POST["href"]);
        $remove = trim(@$_POST["remove"]);

        $ama_get_fav = get_user_meta(get_current_user_id(),"ama_fav",true);

        if(!empty($remove)) {
            unset($ama_get_fav[$href]);
        } else {
            $ama_get_fav[$href] = $href;
        }

        update_user_meta( get_current_user_id(), "ama_fav", $ama_get_fav );

        echo json_encode($ama_get_fav);
        exit;
    }

}

// End of class
