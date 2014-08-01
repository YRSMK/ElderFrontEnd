/********************************************************************
*	Author: 		Jim English										*	
*	Company: 		JRE Solutions Ltd								*	
*	Description: 	A find services widget for built for the NHS.	*
********************************************************************/
var fsNHSDefaults = {
	pageSize: 4,													// maximum number of results returned for each call
	serviceUrl: 'http://v1.syndication.nhschoices.nhs.uk/',			// NHS service URL
	apiKey: 'PHRJCDTY',												// NHS API key
	maxServiceTabs: 3,												// maximum number of tabs that can be initialised
	serviceMappings: {												// service mappings to be appended to serviceURL to create service path
		'1': 'organisations/gppractices',							// gp practices service path
		'2': 'organisations/dentists',								// dentist service path
		'3': 'organisations/pharmacies',							// pharmacies service path
		'4': 'organisations/hospitals'								// hospital service path
	},
	content: {														// content object that contains all widget configurable content
		logoURL: 'http://media.nhschoices.nhs.uk/nhs/nhs.fs.widget/logo-nhs_choices.gif',							// NHS choices URL path
		logoAlt: 'nhs choices',										// NHS choices alternative text for logo
		subtitle: 'Find and choose services',						// widget sub title
		findBtn: 'Find',											// find button text
		resetBtn: 'Reset',											// reset button text
		searchText: 'postcode',										// text if search filed left blank (user tip)
		telephoneText: 'Telephone',									// telephone label in search result entry
		noResults: 'Your search for %value% returned no results.',	// no results returned text - Note that this needs to have the text '%value%' in which gets replcaed with the search the user entered
		serviceTypes: {												// service mapping to tab titles
			'1': 'GP',												// gp practices tab title
			'2': 'Dentist',											// dentist tab title
			'3': 'Pharmacy',										// pharmacies tab title
			'4': 'Hospital'											// hospital tab title
		},
		aboutTab: 'About',											// about tab title
		about: '<p><p>NHS Choices widget, powered by the <a href="http://www.nhs.uk/servicedirectories/Pages/ServiceSearch.aspx" TARGET="_blank"> NHS Choices Services Finder</a>.</p>For further information, see <a href="http://www.nhs.uk/aboutNHSChoices/professionals/syndication/Pages/Webservices.aspx" TARGET="_blank"> NHS Choices syndication pages</a>.</p></p>'						// about tab content (can be HTML or just an unformatted text string)
	}
};
// widget code below
(function(b,r){b.fsNHSWidget=function(e,a){var h=b.fsNHSWidget.widgets++,s=b(e),i,f,m,t=b.fsNHSWidget.defaults;if(typeof a==="string")a={types:a.split(",")};else if(typeof a==="object"){if(b.isArray(a)&&(a={types:a}),typeof a.types==="string")a.types=a.types.split(",")}else return;a=b.extend(true,{},t,a);a.types=!a.types||!b.isArray(a.types)?[]:a.types;(function(){var n='<div id="fs-nhs-widget" class="fs-nhs-widget"><div class="nhs-widget-inner"><img src="'+a.content.logoURL+'" alt="'+a.content.logoURL+ '"/><p class="nhs-widget-title"><strong>'+a.content.subtitle+'</strong></p><ul class="nhs-widget-nav nhs-widget-clear">',o="",p=[],q=[];b.each(a.types,function(j,g){var c=a.content.serviceTypes[g];c&&b.inArray(g,q)&&(o+='<li class="'+(j===0?"nhs-widget-first nhs-widget-active":"")+'"><a href="#nhs-widget-'+j+"-"+h+'">'+c+"</a></li>",p.push('<div id="nhs-widget-'+j+"-"+h+'" class="nhs-widget-tab" '+(j===0?"":'style="display:none;"')+'><div class="nhs-widget-clear nhs-widget-overflow"><form action="#'+ g+'"><div><input class="nhs-widget-input" type="text" title="postcode" maxlength="8" /></div><div class="nhs-widget-btn-wrapper"><button class="nhs-widget-find-js">'+a.content.findBtn+'</button></div><div class="nhs-widget-btn-wrapper"><button class="nhs-widget-reset-js">'+a.content.resetBtn+'</button></div></form></div><div class="nhs-widget-clear"></div><div class="nhs-widget-search-results"><ul></ul></div></div>'),q.push(g));return j<a.maxServiceTabs-1});n+=o+'<li class="'+(!a.types.length?"nhs-widget-first nhs-widget-active": "")+'"><a href="#nhs-widget-about-'+h+'">'+a.content.aboutTab+'</a></li></ul><div class="nhs-widget-tabs nhs-widget-clear">'+p.join("")+'<div id="nhs-widget-about-'+h+'" class="nhs-widget-tab" style="'+(!a.types.length?"":"display:none;")+'">'+a.content.about+"</div></div></div>";b(e).append(n);f=s.find(".fs-nhs-widget");m=f.find(".nhs-widget-input");i=f.find(".nhs-widget-nav a");f.find("input[type=text]").each(function(){this.value=this.title}).focus(function(){if(this.value===this.title)this.value= ""}).blur(function(){if(this.value==="")this.value=this.title});i.click(function(){var a=m.filter(":visible");i.parent("li").removeClass("nhs-widget-active");b(this).parent("li").addClass("nhs-widget-active");f.find(".nhs-widget-tab").hide();b(this.href.substring(this.href.indexOf("#"))).show();a.length&&m.val(a.val());this.blur();return false});f.find(".nhs-widget-reset-js").click(function(){var a=b(this).parents(".nhs-widget-tab");a.find(".nhs-widget-search-results ul").empty();a.find(".nhs-widget-input").val("").focus(); return false});f.find(".nhs-widget-find-js").click(function(){var j=f.find(".nhs-widget-find-js, .nhs-widget-reset-js"),g=b(this).parents(".nhs-widget-tab"),c=g.find("form"),e=c.find(".nhs-widget-input"),h=g.find(".nhs-widget-search-results ul"),l=e.val(),c=c.attr("action"),c=a.serviceMappings[c.substring(c.indexOf("#")+1)],i="http"+(/^https/.test(r.location.protocol)?"s":"");l!==e.attr("title")&&l!==""&&(h.empty(),j.attr("disabled","disabled"),g.addClass("nhs-widget-loader"),b.getJSON(i+"://query.yahooapis.com/v1/public/yql?callback=?", {q:"select * from xml where url='"+a.serviceUrl+c+"/postcode/"+l.replace(/\s/g,"")+".xml?apikey="+a.apiKey+"'",diagnostics:true,format:"json"},function(b){var b=b&&b.query&&Number(b.query.count)!==0&&b.query.results&&b.query.results.feed&&b.query.results.feed.entry?b.query.results.feed.entry:null,c,d,e=0,f,k,i=[];g.removeClass("nhs-widget-loader");if(b){f=b.length;for(k=0;k<f;k++)if(k<=a.pageSize){if(b[k])c=b[k].content.organisationSummary,d=c.address,d=(d.addressLine[0]&&d.addressLine[0]+", "||"")+ (d.addressLine[1]&&d.addressLine[1]+", "||"")+(d.addressLine[2]&&d.addressLine[2]+", "||"")+(d.addressLine[3]&&d.addressLine[3]+", "||"")+(d.addressLine[4]&&d.addressLine[4]+", "||"")+(d.postcode||""),i.push('<li><span class="nhs-widget-addr"><a href="'+b[k].link[1].href+'" target="_blank"><strong>'+c.name+'</strong></a></span><span class="nhs-widget-addr">'+d+"</span> <span>"+a.content.telephoneText+": "+c.contact.telephone+"</span></li>"),e++}else break;h.append(i.join(""))}else h.append('<li class="nhs-widget-error">'+ a.content.noResults.replace("%value%","'"+l+"'")+"</li>");j.removeAttr("disabled")}));this.blur();return false})})()};b.fsNHSWidget.widgets=0;b.fsNHSWidget.defaults=fsNHSDefaults;b.fn.extend({fsNHSWidget:function(e){e=e||{};this.each(function(){b.data(this,"fsNHSWidget")||b.data(this,"fsNHSWidget",new b.fsNHSWidget(this,e))});return this}})})(jQuery,window,document);