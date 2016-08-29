/**
 * Admin Menus Accessibility Javascript
 */

jQuery(document).ready(function(){

    window.ama_is_fav = false;

    jQuery(".ama_adminmenu").prependTo("#adminmenu");

    jQuery("#ama_search").keyup(function(){

        ama_filter_admin_panel(jQuery(this).val());

    });

    jQuery(".ama_adminmenu > .tabs > li").click(function(){

        jQuery(".ama_adminmenu > .tabs > li").removeClass('wp-menu-arrow');
        jQuery(this).addClass('wp-menu-arrow');

        if(jQuery(this).hasClass("all")) {
            window.ama_is_fav = false;
        } else {
            window.ama_is_fav = true;
        }

        jQuery("#ama_search").keyup(); //refresh search.

    });

    /**
     * Fav functionality
     */
    ama_add_fav_functionality();

});
function ama_add_fav_functionality() {

    jQuery("#adminmenu > li").each(function(){

        heartbtn = jQuery('<i class="fa amaheart fa-heart-o"></i>');
        heartbtn.data("href",jQuery(this).find("a").first().attr("href"));
        heartbtn.data("name",jQuery(this).find("a").first().text());
        ama_heartbtn_action(heartbtn);
        jQuery(this).find(".wp-menu-name").first().parent().after(heartbtn);

        // Sub Menu
        jQuery(this).find(".wp-submenu").first().find("li").each(function(){
            heartbtn = jQuery('<i class="fa amaheart fa-heart-o"></i>');
            heartbtn.data("href",jQuery(this).find("a").first().attr("href"));
            heartbtn.data("name",jQuery(this).find("a").first().text());
            ama_heartbtn_action(heartbtn);
            jQuery(this).append(heartbtn);
        });

    });

}

function ama_heartbtn_action(btn) {

    // restore current stage of btn
    if(typeof window.ama_fav[btn.data("href")] != "undefined") {
        if(jQuery(btn).hasClass("fa-heart-o")) {
            jQuery(btn).addClass("fa-heart")
            jQuery(btn).removeClass("fa-heart-o")
        }
    }

    jQuery(btn).click(function(){
        data = {};
        data.action = "ama_fav";
        data.href = btn.data("href");

        if(btn.hasClass('fa-heart')) {
            data.remove = '1';
        }

        save = jQuery.post(ajaxurl,data);
        save.done(function(response){
            if(response != "0") {
                window.ama_fav = jQuery.parseJSON(response);

                if(jQuery(btn).hasClass("fa-heart-o")) {
                    jQuery(btn).addClass("fa-heart");
                    jQuery(btn).removeClass("fa-heart-o");
                    message = String(ama_translate.fav_added).replace("{{ITEM}}",jQuery(btn).data("name"));
                } else {
                    jQuery(btn).removeClass("fa-heart");
                    jQuery(btn).addClass("fa-heart-o");
                    message = String(ama_translate.fav_removed).replace("{{ITEM}}",jQuery(btn).data("name"));
                }

                jQuery.growl.notice({ message: message });

                jQuery("#ama_search").keyup(); //refresh search.

            }
        });

    });
}

function ama_filter_admin_panel(text) {

    text = text.toLowerCase();

    jQuery("#adminmenu").addClass('ama_active');

    jQuery("#adminmenu > li").each(function(){

        var parent_menu_name = jQuery(this).find(".wp-menu-name").first().text().toLowerCase();

        // fav logic
        var is_fav = (typeof window.ama_fav[jQuery(this).find("a").first().attr("href")] != "undefined")?true:false;

        if( (text!="" && parent_menu_name.search(text) < 0) || (window.ama_is_fav && !is_fav) ) {
            jQuery(this).addClass("ama_hide");
        } else {
            jQuery(this).removeClass("ama_hide");
            jQuery(this).find(".wp-submenu").first().addClass("ama_showsubmenu"); // force show submenu on panel.
        }

        if(text == ""){
            jQuery(this).find(".wp-submenu").first().removeClass("ama_showsubmenu"); // hide sub menu when there is no text to restore normal mode
        }

        /* check matches on submenus */
        var main_menu = this;
        if(jQuery(this).hasClass("wp-has-submenu")) {

            jQuery(this).find("li").each(function() {
                var sub_menu_text = jQuery(this).find("a").first().text().toLowerCase();

                 /**
                 * if we found match in sub menu and sub menu is hidden then show it.
                 * */

                // parent sub match string.
                var subtext_split_parent = text.replace(parent_menu_name,"").trim();

                // fav logic
                var is_fav = (typeof window.ama_fav[jQuery(this).find("a").first().attr("href")] != "undefined")?true:false;

                if( (text!="" && sub_menu_text.search(text) < 0 && sub_menu_text.search(subtext_split_parent) < 0) || (window.ama_is_fav && !is_fav)) {
                    jQuery(this).addClass("ama_hide");
                    if(text == "" && is_fav)
                        jQuery(main_menu).find(".wp-submenu").removeClass("ama_showsubmenu"); // hide sub menu when there is no text to restore normal mode
                } else {
                    jQuery(this).removeClass("ama_hide");
                    jQuery(main_menu).removeClass("ama_hide");
                    if(window.ama_is_fav || text != "") {
                        jQuery(main_menu).find(".wp-submenu").first().addClass("ama_showsubmenu"); // force show submenu on panel.
                    }
                }

            });

        }


    });

    if(text == "" & !window.ama_is_fav) {
        jQuery("#adminmenu").removeClass('ama_active');
    }

}
