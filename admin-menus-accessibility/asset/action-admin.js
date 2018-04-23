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
            ama_cookie_helper.create('ama_tab','all',365);
            window.ama_is_fav = false;
        } else {
            ama_cookie_helper.create('ama_tab','fav',365);
            window.ama_is_fav = true;
        }

        jQuery("#ama_search").keyup(); //refresh search.

    });
    
    // Restore Last Tab
    if (ama_cookie_helper.read('ama_tab') == 'fav') {
        jQuery('.ama_adminmenu > .tabs > .fav').click()
    }
    else {
        jQuery('.ama_adminmenu > .tabs > .all').click()
    }

    /**
     * Fav functionality
     */
    ama_add_fav_functionality();

});
function ama_add_fav_functionality() {

    var heart = ('<span class="dashicons dashicons-heart amaheart" title="'+ama_translate.do_fav+'"></span>');
    
    jQuery("#adminmenu > li").each(function(){

        heartbtn = jQuery(heart);
        heartbtn.data("href",jQuery(this).find("a").first().attr("href"));
        heartbtn.data("name",jQuery(this).find("a").first().text());
        ama_heartbtn_action(heartbtn);
        jQuery(this).find(".wp-menu-name").first().parent().after(heartbtn);

        // Sub Menu
        jQuery(this).find(".wp-submenu").first().find("li").each(function(){
            heartbtn = jQuery(heart);
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
        if(!jQuery(btn).hasClass("selected")) {
            jQuery(btn).addClass("selected").attr("title",ama_translate.do_unfav);
        }
    }

    jQuery(btn).click(function(){
        data = {};
        data.action = "ama_fav";
        data.href = btn.data("href");

        if(btn.hasClass('selected')) {
            data.remove = '1';
        }

        save = jQuery.post(ajaxurl,data,function(){},'json');
        save.done(function(response){
            if(response != "0") {
                window.ama_fav = response;

                if(!jQuery(btn).hasClass("selected")) {
                    jQuery(btn).addClass("selected").attr("title",ama_translate.do_unfav);
                    message = String(ama_translate.fav_added).replace("{{ITEM}}",jQuery(btn).data("name"));
                } else {
                    jQuery(btn).removeClass("selected").attr("title",ama_translate.do_fav);;
                    message = String(ama_translate.fav_removed).replace("{{ITEM}}",jQuery(btn).data("name"));
                }

                jQuery.growl.notice({ title:'',message: message });

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
                 * if we found match in sub menu and sub menu is hidden then
                 * show it.
                 * */

                // parent sub match string.
                var subtext_split_parent = text.replace(parent_menu_name,"").trim();

                // fav logic
                var is_fav = (typeof window.ama_fav[jQuery(this).find("a").first().attr("href")] != "undefined")?true:false;

                if( (text!="" && sub_menu_text.search(text) < 0 && sub_menu_text.search(subtext_split_parent) < 0) || (window.ama_is_fav && !is_fav)) {

	                  ama_unhighlight(jQuery(this).find("a").first());
                    
                    jQuery(this).addClass("ama_hide");
                    if(text == "" && is_fav)
                        jQuery(main_menu).find(".wp-submenu").removeClass("ama_showsubmenu"); // hide sub menu when there is no text to restore normal mode
                } else {

	                ama_highlight(text,jQuery(this).find("a").first());

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

function ama_unhighlight(element) {
	jQuery(element).find('.ama_highlight').contents().unwrap();
	jQuery(element).html(jQuery(element).html());
}

function ama_highlight (word, element) {
	ama_unhighlight(jQuery(element))
	if (word) {
		var textNodes
		var str = word
		var term = str
		var textNodes = jQuery(element).
			contents().
			filter(function () { return this.nodeType === 3 })
		textNodes.each(function () {
			var content = jQuery(this).text()
			var regex = new RegExp(term, 'gi')
			content = content.replace(regex, '<span class="ama_highlight">' + term +
				'</span>')
			jQuery(this).replaceWith(content)
		})
	}
}

var ama_cookie_helper = {
	create: function (key, value, days) {
		var expires = new Date()
		expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000))
		document.cookie = key + '=' + value + ';expires=' + expires.toUTCString()
	},
  read: function (key) {
		var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)')
		return keyValue ? keyValue[2] : null
	}
}


