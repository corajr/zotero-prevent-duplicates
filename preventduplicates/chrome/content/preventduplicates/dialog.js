Zotero_PreventDuplicates_Dialog = function () {};

Zotero_PreventDuplicates_Dialog.init = function () {

	var container = document.getElementById("zotero-prevent-duplicates-container");
	
	this.io = window.arguments[0];
	var description = document.getElementById("zotero-prevent-duplicates-description");
	var desc_div = document.createElementNS("http://www.w3.org/1999/xhtml","div");
	desc_div.innerHTML = this.io.dataIn["html"];
	description.appendChild(desc_div);
}

Zotero_PreventDuplicates_Dialog.acceptSelection = function() {
	this.io.dataOut = true;

	return true;
}