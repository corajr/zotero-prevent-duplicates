Zotero_PreventDuplicates_Dialog = function () {};

Zotero_PreventDuplicates_Dialog.init = function () {

	var container = document.getElementById('zotero-prevent-duplicates-container');
	
	this.io = window.arguments[0];
	var description = document.getElementById('zotero-prevent-duplicates-description');
	
	for(var i in this.io.dataIn) {
		description.textContent += this.io.dataIn[i];
	}
}

Zotero_PreventDuplicates_Dialog.acceptSelection = function() {
	this.io.dataOut = true;

	return true;
}