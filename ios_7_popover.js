/* 
    Created on : Jul 30, 2014, 10:03:12 AM
    Author     : e5u2r0m
*/

/*
 * Some Example code for a menu, with an example of all types in use -
Map.popover = new Ios7Popover({
	title:        "Configuration",
	id:           "map_popover",
	width:        "350px",
	height:       "150px",
	items:        [
		{
			//groupCheckboxes: true,
			items: [
				{
					type: "date",
					fieldLabel: "Date Test",
					name: "date_test"
				},
				{
					type: "datetime",
					fieldLabel: "Date Time Test",
					name: "datetime_test"
				},
				{
					type: "layoutselect",
					name: "location_layout",
					fieldLabel: "Location",
					data: Map.officeLocations,
					selectedValue: "DBQ_DC"
				},
				{
					type: "multiselect",
					layoutEngine: "location_layout",
					activeLayoutIds: ["DBQ_DC"],
					fieldLabel: "View",
					data: Map.views,
					selectedValue: ["LIVE_ACD_STATUS"],
					name: "multiselect_test"
				}
			]
		},
		{
			type: "divider",
			text: "A hint for the next section"
		},
		{
			items: [
				{
					type: "switch",
					layoutEngine: "location_layout",
					activeLayoutIds: ["TUL","DBQ_DC"],
					fieldLabel: "Test for switch",
					selectedValue: true,
					name: "switch_test"
				},
				{
					layoutEngine: "location_layout",
					activeLayoutIds: ["COL"],
					fieldLabel: "Test for generic",
					name: "displayfield_test"
				},
				{
					layoutEngine: "location_layout",
					activeLayoutIds: ["COL"],
					fieldLabel: "Test for textarea",
					type: "textarea",
					height: "100px",
					placeholder: "Type in here....",
					name: "textarea_test"
				},
				{
					layoutEngine: "location_layout",
					activeLayoutIds: ["COL"],
					fieldLabel: "Test for text",
					type: "text",
					placeholder: "Type in here....",
					name: "text_test"
				}
			]
		}
	],
	openEvent: function(){
		$("#cover").fadeIn();
	},
	closeEvent: function(){
		$("#cover").fadeOut();
	}
});

//example usage code

var myButton = $("#some_button");
Map.popover.showPopover(myButton);
 */

var Ios7Popover = function(config){
	var me = this;
	me.baseId = config.id;
	me.itemConfigs = config.items;
	me.width = config.width;
	me.height = config.height;
	me.title = config.title;
	me.fieldsObject = {};
	me.fieldsArray = [];
	me.currentLayouts = {};
	me.enableMultiPaging = config.enableMultiPaging ? true : false;
	
	me.getFieldsObject = function(){
		return me.fieldsObject;
	};
	
	me.getFieldsArray = function(){
		return me.fieldsArray;
	};
	
	var baseMarkup = 
		"<div style=\"display:none;\">" +
			"<div id=\"" + me.baseId + "_popup_header\">" +
				"<span id=\"" + me.baseId + "_popover_header_text_1\" style=\"position:absolute;left:0px;right:0px;\">" + me.title + "</span>" +
				"<span id=\"" + me.baseId + "_popover_header_text_2\" style=\"position:absolute;left:0px;right:0px;display:none;\"></span>" +
				"<span id=\"" + me.baseId + "_popover_back\" style=\"position:absolute;left:12px;color:#007AFF;display:none;-webkit-tap-highlight-color: rgba(0,0,0,0);\">Back</span>" +
				"<span id=\"" + me.baseId + "_popover_done\" style=\"position:absolute;right:12px;color:#007AFF;-webkit-tap-highlight-color: rgba(0,0,0,0);\">Done</span>" +
			"</div>" +
			"<div id=\"" + me.baseId + "_popover_content\" class=\"popover_content\" style=\"height:" + me.height + ";width:" + me.width + ";\">" +
				"<div id=\"" + me.baseId + "_popover_shifter\" class=\"popover_shifter\" style=\"height:" + me.height + ";\">" +
				"</div>" +
			"</div>" +
		"</div>";

	var pageMarkup = "<div id=\"" + me.baseId + "_popover_page_{page_number}\" style=\"left:{left_pixels}px;height:" + me.height + ";width:" + me.width + ";overflow-y:auto;-webkit-overflow-scrolling: touch;\">" +
		"</div>";

	var subpageSelectMarkup = "<div id=\"" + me.baseId + "_popover_page_submenu_{page_number}\" style=\"left:{left_pixels};height:" + me.height + ";width:" + me.width + ";overflow-y:auto;-webkit-overflow-scrolling: touch;display:none;\">" +
			"<ul class=\"popover_list\">" +
			"</ul>" +
		"</div>";

	var checkMarkMarkup = 
		"<img class=\"popover_li_checkbox\" src=\"images/check_blue.png\" style=\"display:{checkbox_display};\"/>";

	var selectMarkup = 
		"<div class=\"{text_class}\">{item_name}</div>" +
		"<div class=\"popover_list_selected_text\">{selected_value}</div>" +
		"<img src=\"images/right_arrow.png\">" +
		"<div data-region=\"checkbox\" style=\"height:40px;position:absolute;left:0px;right:40px;\"></div>" +
		"<div data-region=\"select\" style=\"height:40px;position:absolute;width:40px;right:0px;\"></div>";

	var genericListItemMarkup = 
		"<div class=\"{text_class}\">{item_name}</div>";

	var switchItemMarkup = 
		"<div class=\"{text_class}\">{item_name}</div>" +
		"<input type=\"checkbox\" class=\"js-switch\" {checked} />";
	
	var textareaListItemMarkup = 
		"<textarea style=\"width:100%;height:100%;box-sizing: border-box;\" placeholder=\"{placeholder}\">{selected_value}</textarea>";

	var textListItemMarkup = 
		"<input type=\"text\" style=\"width:100%;height:100%;box-sizing: border-box;\" placeholder=\"{placeholder}\"/>";

	var dateTimeListItemMarkup = 
		"<div class=\"{text_class}\">{item_name}</div>" +
		"<input style=\"position:absolute;right:0px;border:0;background-color: transparent;font-size: 13pt;font-family: arial;margin-top: 7px;\" type=\"datetime-local\"/>" +
		"<div data-region=\"checkbox\" style=\"height:40px;position:absolute;left:0px;right:50%;\"></div>" +
		"<div data-region=\"select\" style=\"height:40px;position:absolute;width:50%;right:0px;\"></div>";
	
	var dateListItemMarkup = 
		"<div class=\"{text_class}\">{item_name}</div>" +
		"<input style=\"position:absolute;right:0px;border:0;background-color: transparent;font-size: 13pt;font-family: arial;margin-top: 7px;\" type=\"date\"/>" +
		"<div data-region=\"checkbox\" style=\"height:40px;position:absolute;left:0px;right:50%;\"></div>" +
		"<div data-region=\"select\" style=\"height:40px;position:absolute;width:50%;right:0px;\"></div>";
	
	//handles the action when a user clicks an item on the sub menu
	me.selectItem = function(eventObject){
		
		var itemConfig = me.currentSelectedLiConfig;
		var mainItem = me.currentSelectedLiTarget;
		var arrayToProcess = itemConfig.data;
		var liTarget = $(eventObject.target).prop("tagName") == "LI" ? $(eventObject.target) : $(eventObject.target).parent("li");
		var selectedItemData = arrayToProcess[liTarget.index()];
				
		liTarget.children("div.selected").fadeIn("fast", function(){
				
			//the setTimeout here helps with keeping the animation from being choppy
			setTimeout(function(){
		
				if(itemConfig.type == "select" || itemConfig.type == "layoutselect")
				{
					//in the case of a single select, select the value, set it to the main element and then move back to the main menu
					itemConfig.selectedValue = selectedItemData[itemConfig.valueField];

					var mainItemSelectedTextElement = mainItem.children("div").eq(1);
					mainItemSelectedTextElement.html(selectedItemData[itemConfig.displayField]);

					if(itemConfig.type == "layoutselect")
						me.doLayoutSelect(itemConfig.name, itemConfig.selectedValue);

					me.moveShifterLeft();
				}
				else if(itemConfig.type == "multiselect")
				{
					var checkbox = liTarget.children("img.popover_li_checkbox");

					if(!itemConfig.selectedValue)
						itemConfig.selectedValue = [];

					var newDisplay = "none";
					if(checkbox.css("display") == "none")
					{
						newDisplay = "block";
						if(itemConfig.selectedValue.indexOf(selectedItemData[itemConfig.valueField]) == -1)
							itemConfig.selectedValue.push(selectedItemData[itemConfig.valueField]);
					}
					else
					{
						itemConfig.selectedValue = jQuery.grep(itemConfig.selectedValue, function(value) {
							return value != selectedItemData[itemConfig.valueField];
						});
					}

					checkbox.css("display", newDisplay);
					liTarget.children("div.selected").fadeOut("fast");
				}
			}, 1);
		});
	};
	
	//do a layout such that only fields with the included id in their activeLayoutIds property are shown
	me.doLayoutSelect = function(layoutEngine, layoutChosen){

		for(var k = 0; k < me.itemConfigs.length; k++)
		{
			var mainElement = $("#" + me.baseId + "_popover_page_" + k);
			var mainElementList = mainElement.children();
			
			var ulConfigs = me.itemConfigs[k].items;
			
			for(var i = 0; i < ulConfigs.length; i++)
			{
				var ulConfig = ulConfigs[i];
				var ulElement = mainElementList.eq(i);
				var liElementList = ulElement.children("li");
				var liConfigList = ulConfig.items;
				if(ulConfig.items)
				{
					for(var j = 0; j < liConfigList.length; j++)
					{
						var liConfig = liConfigList[j];
						if(liConfig.layoutEngine == layoutEngine)
						{
							var liElement = liElementList.eq(j);
							var newDisplay = "none";
							if(liConfig.activeLayoutIds.indexOf(layoutChosen) != -1)
								newDisplay = "block";

							liElement.css("display", newDisplay);
						}
					}
				}
			}
		}
		
		me.currentLayouts[layoutEngine] = layoutChosen;
	};
	
	me.activateSubMenuFromSelect = function(liConfig){
		
		var submenu = $("#" + me.baseId + "_popover_page_submenu_0");
		submenu.show();
		var ul = submenu.children("ul");

		var arrayToProcess = liConfig.data;

		ul.empty();
		var newItems = "";
		for(var i = 0; i < arrayToProcess.length; i++)
		{
			var singleItem = arrayToProcess[i];
			newItems += "<li style=\"-webkit-tap-highlight-color: rgba(0,0,0,0);\">";
			var liClass = "popover_list_li_text";
			if(liConfig.type == "multiselect")
			{
				var checkboxCheckedCss = (liConfig.selectedValue != null && $.inArray(singleItem[liConfig.valueField], liConfig.selectedValue) != -1) ? "block" : "none";

				newItems += checkMarkMarkup.replace(/\{checkbox_display\}/g, checkboxCheckedCss);
				liClass += "_checkbox";
			}
			newItems += genericListItemMarkup.replace(/\{item_name\}/g, singleItem[liConfig.displayField]);

			newItems += "<div class=\"selected\" style=\"display:none;position:absolute;height:40px;left:0px;right:0px;background-color:#999999;opacity: 0.4;\"></div>";

			newItems = newItems.replace(/\{text_class\}/g, liClass);

			newItems += "</li>";
		}

		ul.append(newItems);

		$("#" + me.baseId + "_popover_header_text_2").html(liConfig.fieldLabel);
		$("#" + me.baseId + "_popover_shifter").animate(
			{left: "-" + me.width},
			{
				duration: 'medium'
			}
		);
		$("#" + me.baseId + "_popover_back").fadeIn('medium');
		$("#" + me.baseId + "_popover_done").fadeOut('medium');
		$("#" + me.baseId + "_popover_header_text_2").fadeIn('medium');
		$("#" + me.baseId + "_popover_header_text_1").fadeOut('medium');
	};
	
	//handles when an item on the main menu is clicked
	me.mainItemClick = function(pageConfig, liTarget, target){
		
		var ulIndex = liTarget.parent().index();
		var liIndex = liTarget.index();
		var ulConfig = pageConfig.items[ulIndex];
		var liConfig = ulConfig.items[liIndex];
		
		if(liConfig.type == "select" || liConfig.type == "layoutselect" || liConfig.type == "multiselect")
		{
			liTarget.children("div.selected").fadeIn("fast", function(){
				setTimeout(function(){
					
					if(ulConfig.groupCheckboxes && target.data("region") == "checkbox")
					{
						me.activateMainItemGroupCheckBox(ulIndex, liTarget, liConfig);
						return;
					}
					
					me.activateSubMenuFromSelect(liConfig);
					
					me.currentSelectedLiConfig = liConfig;
					me.currentSelectedLiTarget = liTarget;
					
				}, 1);
			});
		}
		else
		{
			if(liConfig.type == "switch")
			{
				if(!target)
					return;
				liConfig.checked = target.checked;
			}
			else if(liConfig.type == "datetime" || liConfig.type == "date")
			{
				if(ulConfig.groupCheckboxes && target.data("region") == "checkbox")
				{
					me.activateMainItemGroupCheckBox(ulIndex, liTarget, liConfig);
					return;
				}

				//we focus the datetime input here so that the popover will show up no matter where you click on the li
				liTarget.children("input").focus();
			}
			else
			{
				//generic item
				if(ulConfig.groupCheckboxes)
				{
					liTarget.children("div.selected").fadeIn("fast", function(){
						setTimeout(function(){
							me.activateMainItemGroupCheckBox(ulIndex, liTarget, liConfig);
						}, 1);
					});
				}
			}
		}
	};
	
	me.activateMainItemGroupCheckBox = function(ulIndex, liTarget, liConfig){
		
		var ulConfig = liConfig.parentUl;
		var pageIndex = me.itemConfigs.indexOf(ulConfig.parentPage);
		
		for(var i = 0; i < ulConfig.items.length; i ++)
			ulConfig.items[i].checked = false;
		
		var mainElement = $("#" + me.baseId + "_popover_page_" + pageIndex);
		var ulElement = mainElement.children().eq(ulIndex);
		var checkboxElements = ulElement.children("li").children("img.popover_li_checkbox");
		checkboxElements.css("display", "none");
		
		var checkbox = liTarget.children("img.popover_li_checkbox");
		checkbox.css("display", "block");

		liConfig.checked = true;
		
		liTarget.children("div.selected").fadeOut("fast");
	};

	me.moveShifterLeft = function(){
		$("#" + me.baseId + "_popover_shifter").animate({left: 0},{
			duration: 'fast',
			complete: function(){
				var cheese = $("#" + me.baseId + "_popover_page_0").find("div.selected");
				cheese.fadeOut("fast");
			}
		});
		$("#" + me.baseId + "_popover_back").fadeOut('medium');
		$("#" + me.baseId + "_popover_done").fadeIn('medium');
		$("#" + me.baseId + "_popover_header_text_2").fadeOut('medium');
		$("#" + me.baseId + "_popover_header_text_1").fadeIn('medium');
	};
	
	me.closePopover = function(){
		//closes the active popover
		if(me.popover.openedFromElement != null)
			me.popover.hidePopover();
	};
	
	//render to DOM here
	$(document.body).append(baseMarkup);
	
	if(!me.enableMultiPaging)
	{
		//legacy support for single page popover
		me.itemConfigs = [
			{
				items: me.itemConfigs
			}
		];
	}
	
	for(var k = 0; k < me.itemConfigs.length; k++)
	{
		//need to grab the actual width in pixels, may need to write a corrector function for when the screen is rotated and they are using percentage
		var pixelWidth = $("#" + me.baseId + "_popover_content").width();
		
		var newPage = $(pageMarkup.replace(/\{page_number\}/g, k).replace(/\{left_pixels\}/g, k * pixelWidth));
		var newSelectSubPage = $(subpageSelectMarkup.replace(/\{page_number\}/g, k).replace(/\{left_pixels\}/g, ((k + 1) * pixelWidth) + "px"));
		
		$("#" + me.baseId + "_popover_shifter").append(newPage);
		$("#" + me.baseId + "_popover_shifter").append(newSelectSubPage);
		
		var pageConfig = me.itemConfigs[k];
		var ulConfigs = pageConfig.items;
		
		var mainMenuRender = "";
		for(var i = 0; i < ulConfigs.length; i++)
		{	
			var sectionConfig = ulConfigs[i];
			sectionConfig.parentPage = pageConfig;
			if(sectionConfig.type == "divider")
				mainMenuRender += "<div class=\"popover_divider\"></div>";
			else
			{
				mainMenuRender += "<ul class=\"popover_list\">";
				var sectionConfigItems = sectionConfig.items;
				var groupCheckBoxes = sectionConfig.groupCheckboxes;
				for(var j = 0; j < sectionConfigItems.length; j++)
				{
					var itemConfig = sectionConfigItems[j];
					var liInnerHtml = "";
					var customHeight = null;

					if(itemConfig.type == "select" || itemConfig.type == "layoutselect" || itemConfig.type == "multiselect")
					{
						//if the field indicators are not set, set them to the old defaults
						if(!itemConfig.displayField)
							itemConfig.displayField = "name";
						if(!itemConfig.valueField)
							itemConfig.valueField = "item_id";

						var selectedValueDisplay = "";
						if(itemConfig.selectedValue && (itemConfig.type == "select" || itemConfig.type == "layoutselect"))
						{
							var itemDataArray = itemConfig.data;
							for(var k = 0; k < itemDataArray.length; k++)
							{
								if(itemDataArray[k][itemConfig.valueField] == itemConfig.selectedValue)
								{
									selectedValueDisplay = itemDataArray[k][itemConfig.displayField];
									break;
								}
							}
						}

						liInnerHtml += selectMarkup.replace(/\{item_name\}/g, itemConfig.fieldLabel).replace(/\{selected_value\}/g, selectedValueDisplay);
					}
					else if(itemConfig.type == "switch")
					{
						liInnerHtml += switchItemMarkup.replace(/\{item_name\}/g, itemConfig.fieldLabel).replace(/\{checked\}/g, itemConfig.selectedValue ? "checked" : "");
					}
					else if(itemConfig.type == "textarea")
					{
						customHeight = "100px";
						if(itemConfig.height)
							customHeight = itemConfig.height;
						var selectedValue = "";
						if(itemConfig.selectedValue || itemConfig.selectedValue == 0)
							selectedValue = itemConfig.selectedValue;
						liInnerHtml += textareaListItemMarkup.replace(/\{placeholder\}/g, itemConfig.placeholder ? itemConfig.placeholder : "").replace(/\{selected_value\}/g, selectedValue);
					}
					else if(itemConfig.type == "text")
					{
						liInnerHtml += textListItemMarkup.replace(/\{placeholder\}/g, itemConfig.placeholder ? itemConfig.placeholder : "");
					}
					else if(itemConfig.type == "datetime")
					{
						liInnerHtml += dateTimeListItemMarkup.replace(/\{item_name\}/g, itemConfig.fieldLabel);;
					}
					else if(itemConfig.type == "date")
					{
						liInnerHtml += dateListItemMarkup.replace(/\{item_name\}/g, itemConfig.fieldLabel);;
					}
					else
					{
						liInnerHtml += genericListItemMarkup.replace(/\{item_name\}/g, itemConfig.fieldLabel);
					}

					var liRender = "<li style=\"-webkit-tap-highlight-color: rgba(0,0,0,0);" + (customHeight ? "height:" + customHeight + ";" : "") + "\">";
					var liClass = "popover_list_li_text";
					if(groupCheckBoxes)
					{
						var checkboxCheckedCss = itemConfig.checked ? "block" : "none";
						liRender += checkMarkMarkup.replace(/\{checkbox_display\}/g, checkboxCheckedCss);
						liClass += "_checkbox";
					}

					liRender += liInnerHtml.replace(/\{text_class\}/g, liClass);

					liRender += "<div class=\"selected\" style=\"display:none;position:absolute;height:40px;left:0px;right:0px;background-color:#999999;opacity: 0.4;\"></div>";

					liRender += "</li>";

					mainMenuRender += liRender;
				}
				mainMenuRender += "</ul>";
			}
		}
		
		//set up the main menu in the html and set some events on it
		var mainMenuPane = $("#" + me.baseId + "_popover_page_" + k);
		mainMenuPane.append(mainMenuRender);
		mainMenuPane.children("ul").children("li").bind("click", {pageConfig: pageConfig}, function(eventObject){
			me.mainItemClick(eventObject.data.pageConfig, $(eventObject.currentTarget), $(eventObject.target));
		});

		//probably should make this more specific to the js-switches created by this popover
		$("#" + me.baseId + "_popover_page_" + k + " .js-switch").each(function(index, element){
			new Switchery(element);
		});

		$("#" + me.baseId + "_popover_page_" + k + " .js-switch").bind("change", {pageConfig: pageConfig}, function(eventObject){
			me.mainItemClick(eventObject.data.pageConfig, $(eventObject.currentTarget).parent(), $(eventObject.currentTarget));
		});

		$("#" + me.baseId + "_popover_page_submenu_" + k).children("ul").bind("click", me.selectItem);

		//setup values and layouts, basically anything we need to do in javascript to initialize
		var mainElement = $("#" + me.baseId + "_popover_page_" + k);
		var mainElementList = mainElement.children();
		for(var i = 0; i < ulConfigs.length; i++)
		{
			var ulConfig = ulConfigs[i];
			var ulElement = mainElementList.eq(i);
			var liElementList = ulElement.children("li");

			if(ulConfig.items)
			{
				for(var j = 0; j < ulConfig.items.length; j++)
				{
					var liElement = liElementList.eq(j);
					var liConfig = ulConfig.items[j];
					liConfig.parentUl = ulConfig;

					if(liConfig.type == "layoutselect" && liConfig.selectedValue)
					{
						me.doLayoutSelect(liConfig.name, liConfig.selectedValue);
					}
					else if(liConfig.type == "textarea")
					{
						var textareaElement = liElement.children("textarea");
						liConfig.fieldElement = textareaElement;
						textareaElement.val(liConfig.selectedValue);

						textareaElement.bind("change", {liConfig: liConfig}, function(eventObject){
							eventObject.data.liConfig.selectedValue = $(eventObject.currentTarget).val();
						});

					}
					else if(liConfig.type == "text" || liConfig.type == "datetime" || liConfig.type == "date")
					{
						var textElement = liElement.children("input");
						textElement.val(liConfig.selectedValue);
						liConfig.fieldElement = textElement;

						textElement.bind("change", {liConfig: liConfig}, function(eventObject){
							eventObject.data.liConfig.selectedValue = $(eventObject.currentTarget).val();
						});
					}
					else if(liConfig.type == "switch")
					{
						var switchElement = liElement.children("input");
						liConfig.fieldElement = switchElement;

						switchElement.bind("change", {liConfig: liConfig}, function(eventObject){
							eventObject.data.liConfig.selectedValue = $(eventObject.currentTarget).val() == "on" ? true : false;
						});

					}

					if(liConfig.name)
						me.fieldsObject[liConfig.name] = liConfig;
					me.fieldsArray.push(liConfig);
				}
			}
		}
	}
	
	$("#" + me.baseId + "_popover_back").bind("click", {me: me}, me.moveShifterLeft);
	$("#" + me.baseId + "_popover_done").bind("click", {me: me}, me.closePopover);
	
	//setup and initialization of the original popover
	config.header =  "#" + me.baseId + "_popup_header";
	config.content = "#" + me.baseId + "_popover_content";
	var oldCloseEvent = config.closeEvent;
	config.closeEvent = function(){
		if(oldCloseEvent)
			oldCloseEvent();
		me.moveShifterLeft();
	};
	
	var oldOpenEvent = config.openEvent;
	config.openEvent = function(){
		if(oldOpenEvent)
			oldOpenEvent();
	};
	
	me.popover = new Popover(config);
	//$(config.openFromItem).popover(config);
	
	me.showPopover = function(sourceElement){
		me.popover.showPopover(sourceElement);
	};
	
	me.setFieldValue = function(fieldName, value){
		
		var liConfig = me.getFieldsObject()[fieldName];
		var ulConfig = liConfig.parentUl;
		var pageConfig = ulConfig.parentPage;
		var pageIndex = me.itemConfigs.indexOf(pageConfig);
		var ulIndex = pageConfig.items.indexOf(ulConfig);
		var liIndex = ulConfig.items.indexOf(liConfig);
		
		//set value of the liConfig
		me.getFieldsObject()[fieldName].selectedValue = value;
		
		var mainMenuPane = $("#" + me.baseId + "_popover_page_" + pageIndex);
		var ul = mainMenuPane.children("ul").eq(ulIndex);
		var li = ul.children("li").eq(liIndex);
		
		if(liConfig.type == "select" || liConfig.type == "layoutselect")
		{
			var displayValue = "";
			var liData = liConfig.data;
			for(var i = 0; i < liData.length; i++)
			{
				if(liData[i][liConfig.valueField] == value)
				{
					displayValue = liData[i][liConfig.displayField];
					break;
				}
			}
			var mainItemSelectedTextElement = li.children("div").eq(1);
			mainItemSelectedTextElement.html(displayValue);
		}
		else if(liConfig.type == "text" || liConfig.type == "date" || liConfig.type == "datetime")
		{
			li.children("input").val(value);
		}
		else if(liConfig.type == "textarea")
		{
			li.children("textarea").val(value);
		}
		else if(liConfig.type == "switch")
		{
			if(value != li.children("input.js-switch")[0].checked)
				li.children("span.switchery").click();
		}
		else if(liConfig.type != "multiselect" || !liConfig.type)
		{
			//default list item with just text in it
			li.children("div.popover_list_li_text").html(value);
		}
	};
};