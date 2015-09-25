# Hermelin
Hermelin is a fork of [Hotot](https://github.com/lyricat/Hotot), the "Lightweight, Flexible Microblogging Client" supporting Twitter at this point of development. (identi.ca and similar may be readded later)

I forked Hotot for the reason that it won't get any bigger updates here in the future because the developer stated that the [future updates of hotot won't be opensource & free](https://d34d.de/?p=160).

I think it is sad that there aren't much [free](https://www.gnu.org/philosophy/free-sw.html) Twitter Clients, so i don't want Hotot to die.

##Installing the Chrome/Chromium Version:

To install Hermelin in chrome or chromium, simply install it from the [Chrome Web Store](https://chrome.google.com/webstore/detail/hermelin-twitter-client/jkajhbbfjgkbjeldopihmjfcaebjgobg). 

To load the newest commit you have to:

* Download this git repo (via the git clone command on linux or the downloadable zip file).
* Go to Chrome/Chromiums Extensions page and activate developer mode (top right corner).
* Click "Load unpacked extension…" and choose the folder of the repository (../Hermelin).

It is not possible to update the Web Store Extension with this method.

For that you'd have to:

* Download this git repo (via the git clone command on linux or the downloadable zip file).
* Copy everything ***except manifest.json*** from the data/ directory into the Web Store extensions directory.

The folder where Chrome/Chromium extensions are stored differs from OS to OS - In there should be the folder jkajhbbfjgkbjeldopihmjfcaebjgobg/ in which you'll find the folder with the newest version.
