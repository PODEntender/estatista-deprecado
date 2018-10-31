
.portfolio_nav { display:none; }
#wrapper
{
	overflow-x: hidden;
}
.mobile_menu_wrapper
{
    display: none;
}
body.js_nav .mobile_menu_wrapper 
{
    display: block;
}
.gallery_type, .portfolio_type
{
	opacity: 1;
}
#searchform input[type=text]
{
	width: 75%;
}
.woocommerce .logo_wrapper img
{
	max-width: 50%;
}



@media only screen and (max-width: 768px) {
	html[data-menu=leftmenu] .mobile_menu_wrapper
	{
		right: 0;
		left: initial;
		
		-webkit-transform: translate(360px, 0px);
		-ms-transform: translate(360px, 0px);
		transform: translate(360px, 0px);
		-o-transform: translate(360px, 0px);
	}
}


#copyright, .footer_bar_wrapper .social_wrapper
{
	float: none;
	margin: auto;
	width: 100%;
	text-align: center;
}

.footer_bar_wrapper .social_wrapper ul, #page_content_wrapper .footer_bar_wrapper .social_wrapper ul
{
	text-align: center;
	margin-bottom: 20px;
}

.footer_bar_wrapper .social_wrapper ul li
{
	float: none;
}

.footer_bar
{
	padding: 30px 0 30px 0;
}

.post_header_title, .post_header.grid
{
	text-align: center;
}

.above_top_bar .page_content_wrapper
{
	text-align:center;
}

#top_menu
{
	float: none;
	margin: auto;
}

#top_menu li
{
	float: none;
	display: inline-block;
}



.top_bar.hasbg
{
	background: rgba(0,0,0,0.00);
}


#footer
{
	padding: 0;
}

@media only screen and (max-width: 767px) {
	body .top_bar
	{
		padding: 20px;
	}
}

@media only screen and (max-width: 960px) and (min-width: 768px) {
	body #logo_right_button, html[data-menu=leftalign_center] body #logo_right_button
	{
		top: 62px;
	}
}

.two_cols.gallery .element img, .three_cols.gallery .element img, .four_cols.gallery .element img, .five_cols.gallery .element img, .two_cols.gallery .element:hover img, .three_cols.gallery .element:hover img, .four_cols.gallery .element:hover img, .five_cols.gallery .element:hover img, .post_img img, .post_img:hover img, #horizontal_gallery_wrapper .gallery_image_wrapper.archive img, .horizontal_gallery_wrapper .gallery_image_wrapper.archive img
{
	transition: all 4.5s ease-out;
    -webkit-transition: all 4.5s ease-out;
}





