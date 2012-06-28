// Only create main object once
if (!Zotero.PreventDuplicates) {
	const loader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
					.getService(Components.interfaces.mozIJSSubScriptLoader);
	loader.loadSubScript("chrome://preventduplicates/content/preventDuplicates.js");
}
