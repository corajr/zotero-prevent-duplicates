Zotero.PreventDuplicates = {
	prompt: function(id) {
		// prompt the user whether they wish to save a possible duplicate or not
		var item = Zotero.Items.get(id) || null;
		
		var params = {"dataIn": null, "dataOut": null};
		
		if (item != null) {
			params["dataIn"] = {"html": Zotero.QuickCopy.getContentFromItems([item],Zotero.Prefs.get("export.quickCopy.setting"))["html"]};
		}
		var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
						.getService(Components.interfaces.nsIWindowMediator);
		var win = wm.getMostRecentWindow("navigator:browser");

		win.openDialog("chrome://preventduplicates/content/dialog.xul", "", "chrome, dialog, modal", params);

		if (params.dataOut != null) {
			return true;
		} else {
			return false;
		}
	},
	normalizeString: function (str) {
		// String into sql query
		str = str + "";
		
		if (str === "") {
			return "";
		}
		
		str = '%' + str.replace(/[^a-zA-Z0-9_-]+/g, '%') + '%';
		str = str.replace(/%+/g, '%');
		
		return str;
	},
	isUnique: function (item) {

		// assume the item is unique
		var returnValue = true;

		// (debug) display what this item can be queried for
		//		for (var i in item) {
		//			Zotero.debug("Item field " + i + ": " + item[i]);
		//		}

		// useful fields: title, publicationTitle, volume, issue, publisher, ISBN, ISSN, url, date, pages, DOI


		// perform SQL queries to check for pre-existing item		
		
		var doi = null, url = null, title = null, lastName = null;

		if (item.hasOwnProperty("DOI")) {
			doi = item["DOI"];
		}

		if (item.hasOwnProperty("url")) {
			url = item["url"];
		}
				
		if (item.hasOwnProperty("title")) {
			title = item["title"];
		}

		if (item.hasOwnProperty("creators") && item["creators"].hasOwnProperty(0)) {
			if (item["creators"][0].hasOwnProperty("lastName")) {
				lastName = item["creators"][0]["lastName"];
			}
		}

		var sql = "SELECT itemID FROM items "
					+ "WHERE itemTypeID NOT IN (1, 14) "
					+ "AND itemID NOT IN (SELECT itemID FROM deletedItems) ";

		var append = "AND itemID in (SELECT itemID FROM items JOIN itemData USING (itemID) "
					+ "JOIN itemDataValues USING (valueID) ";

		if (doi != null) {
			var doiResults = Zotero.DB.query(sql + append + "WHERE fieldID = 26 AND value = ?);", [doi]);
			if (doiResults.length > 0) {
				returnValue = Zotero.PreventDuplicates.prompt(doiResults[0]["itemID"]);

				// if DOI matches, stop search
				return returnValue;
			}
		}
		
		if (url != null) {
			var urlResults = Zotero.DB.query(sql + append + "WHERE fieldID = 1 AND value = ?);", [url]);
			if (urlResults.length > 0) {
				returnValue = Zotero.PreventDuplicates.prompt(urlResults[0]["itemID"]);

				// if URL matches, stop search
				return returnValue;
			}
		}

		if (title != null || lastName != null) {
			if (title != null) {
				sql += append + "WHERE fieldID BETWEEN 110 AND 113 AND value LIKE ?) ";
			}

			if (lastName != null) {
				sql += "AND itemID in (SELECT itemID FROM items JOIN itemCreators USING (itemID) "
					+  "JOIN creators USING (creatorID) "
					+  "JOIN creatorData USING (creatorDataID) "
					+  "WHERE lastName LIKE ?)";
			}
			sql += ";";

			var thisTitle = Zotero.PreventDuplicates.normalizeString(item.title);
			
			if (title != null && lastName != null) {
				var titleLastNameResults = Zotero.DB.query(sql, [thisTitle, lastName]);
				if (titleLastNameResults.length > 0) {
					returnValue = Zotero.PreventDuplicates.prompt(titleLastNameResults[0]["itemID"]);
				}
			}		
		}			

		return returnValue;
	}
};

Zotero.Translate.Sandbox.Base._itemDone = function(translate, item) {
//	Zotero.debug("Translate: Saving item");
	
	// warn if itemDone called after translation completed
	if(translate._complete) {
		Zotero.debug("Translate: WARNING: Zotero.Item#complete() called after Zotero.done(); please fix your code", 2);
	}
		
	const allowedObjects = ["complete", "attachments", "seeAlso", "creators", "tags", "notes"];
	
	delete item.complete;
	for(var i in item) {
		var val = item[i];
		var type = typeof val;
		if(!val && val !== 0) {
			// remove null, undefined, and false properties, and convert objects to strings
			delete item[i];
		} else if(type === "string") {
			// trim strings
			item[i] = val.trim();
		} else if((type === "object" || type === "xml" || type === "function") && allowedObjects.indexOf(i) === -1) {
			// convert things that shouldn't be objecst to objects
			translate._debug("Translate: WARNING: typeof "+i+" is "+type+"; converting to string");
			item[i] = val.toString();
		}
	}
	
	// if we're not supposed to save the item or we're in a child translator,
	// just return the item array
	if(translate._libraryID === false || translate._parentTranslator) {
		translate.newItems.push(item);
		translate._runHandler("itemDone", item, item);
		return;
	}
	
	// We use this within the connector to keep track of items as they are saved
	if(!item.id) item.id = Zotero.Utilities.randomString();
	
	// don't save documents as documents in connector, since we can't pass them around
	if(Zotero.isConnector) {
		var attachments = item.attachments;
		var nAttachments = attachments.length;
		for(var j=0; j<nAttachments; j++) {
			if(attachments[j].document) {
				attachments[j].url = attachments[j].document.location.href;
				attachments[j].mimeType = "text/html";
				delete attachments[j].document;
			}
		}
	}

	// If the item appears to be a duplicate, don't actually save
	
	if (!Zotero.PreventDuplicates.isUnique(item)) {
		return;
	}
			
	// Fire itemSaving event
	translate._runHandler("itemSaving", item);
	
	if(translate instanceof Zotero.Translate.Web) {
		// For web translators, we queue saves
		translate.saveQueue.push(item);
	} else {
		// Save items
		translate._saveItems([item]);
	}
};