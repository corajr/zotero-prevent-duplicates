# Prevent Duplicates in Zotero [UNMAINTAINED] 

No longer updated, sorry!

<hr/>


This plugin runs a preflight check when importing items in Zotero, prompting the user to confirm the addition if a potential match is found. It runs queries for DOI, URL, and the combination of title and first author's last name to assess uniqueness.

Currently, this only works when importing items in Zotero for Firefox and Zotero Standalone; items added from connectors bypass this check. I've only tried on Mac OS X, but it should work on other platforms as well.

## Package and Install

Mac OS X/Unix users can run the package.sh script to create an XPI file which may be added to Firefox/Zotero Standalone. For Windows users, follow these instructions from [Mozilla](https://developer.mozilla.org/en/Building_an_Extension/):

> Zip up the contents of your extension's folder (not the extension folder itself), and rename the zip file to have a .xpi extension. In Windows XP, you can do this easily by selecting all the files and subfolders in your extension folder, right click and choose "Send To -> Compressed (Zipped) Folder". A .zip file will be created for you. Just rename it and you're done!

## To-do
The checks could be made a little bit looser (search on just a few words of title, for example). Also, it would be nice to figure out the connector question.
