# Hermelin
Hermelin is a fork of [Hotot](https://github.com/lyricat/Hotot), the "Lightweight, Flexible Microblogging Client" supporting Twitter at this point of development. (identi.ca and similar may be readded later)

I forked Hotot for the reason that it won't get any bigger updates here in the future because the developer stated that the [future updates of hotot won't be opensource & free](https://d34d.de/?p=160).
I think it is sad that there aren't much [free](https://www.gnu.org/philosophy/free-sw.html) Twitter Clients, so i don't want
Hotot to die.

##Installing the Chrome/Chromium Version:

At this point i don't have any chrome webstore dev acc so you sadly can't find it in the store. (This will change in the future!)
What i did so far was just copy all of the stuff of the data/ directory into the chrome/chromium hotot directory.
This is not he best solution, and as long as it is not in the store i'd appreciate if someone tolde me how to do it differently.
To do this you have to install hotot in the webstore first and then copy the files over.

* Download this git repo (via the git clone command on linux or the downloadable zip file).
* Copy everything out of the data/ directory into the apps directory which is dependent on your OS:

###Windows XP
Google Chrome: C:\Documents and Settings\%USERNAME%\Local Settings\Application Data\Google\Chrome\User Data\Default\Extensions\cnfkkfleeiooolklkgkmigodkmcopnji\0.9.8.15_0\

Chromium: C:\Documents and Settings\%USERNAME%\Local Settings\Application Data\Chromium\User Data\Default\Extensions\cnfkkfleeiooolklkgkmigodkmcopnji\0.9.8.15_0\

###Windows 8/7/Vista
Google Chrome: C:\Users\%USERNAME%\AppData\Local\Google\Chrome\User Data\Default\Extensions\cnfkkfleeiooolklkgkmigodkmcopnji\0.9.8.15_0\

Chromium: C:\Users\%USERNAME%\AppData\Local\Chromium\User Data\Default\Extensions\cnfkkfleeiooolklkgkmigodkmcopnji\0.9.8.15_0\

###Linux
Google Chrome: ~/.config/google-chrome/Default/Extensions/cnfkkfleeiooolklkgkmigodkmcopnji/0.9.8.15_0/

Chromium: ~/.config/chromium/Default/Extensions/cnfkkfleeiooolklkgkmigodkmcopnji/0.9.8.15_0/

###Mac OS X
Google Chrome: ~/Library/Application Support/Google/Chrome/Default/Extensions/cnfkkfleeiooolklkgkmigodkmcopnji/0.9.8.15_0/

Chromium: ~/Library/Application Support/Chromium/Default/Extensions/cnfkkfleeiooolklkgkmigodkmcopnji/0.9.8.15_0/

###Chrome OS & Chromium OS

~/Extensions/cnfkkfleeiooolklkgkmigodkmcopnji/0.9.8.15_0/

## Building from source:
Since Hermelin core is largely based on HTML5, JavaScript and Webkit
technology, it can be run under many Webkit implementations. Hotot officially
supports Gtk, Qt, and Chrome webkit wrapper.

###Dependencies:

Common Requirements:
* cmake
* intltool

Qt Wrapper:
* Qt4 (newer than 4.7)
* KDE Libs (optional, for better KDE integration)

Gtk2 Wrapper:
* python2
* pygtk
* python-webkit
* python-keybinder (optional)

Gtk3 Wrapper:
* python-gobject (for gtk3 wrapper)
* gtk3
* libwebkit3

On Ubuntu 11.10 all of these resources are available in the standard repositories:
    # apt-get install libqt4-dev cmake intltool

###Build:
If you don't care about the following and just want to install or update the gtk
wrappers, you can use(or modify) [this](https://gist.github.com/fliiiix/8146460) buildscript.
It has to be executable and in the Hermelin directory which you get via:

    $ git clone https://github.com/remhume/Hermelin.git



The standard process for building from source is:

    $ cd {source-directory}
    $ mkdir build
    $ cd build
    $ cmake ..
    $ make

Install as root:

    # make install

This will install Hotot in the default prefix: `/usr/local`, in order to change
to a different prefix, use:
`-DCMAKE_INSTALL_PREFIX=/prefix/you/want`

By default gtk with gir, and qt will be built.

The following options can be applied, with On/Off as value.

* `-DWITH_GTK2` build gtk2 version (program name: `hotot-gtk2`)
* `-DWITH_GTK3` build gtk3 version (program name: `hotot-gtk3`)
* `-DWITH_GTK` build gtk version (without `-DWITH_GTK{2,3}` options, the program's name will be `hotot`)
* `-DWITH_GIR` build gir(gtk3) version (need gtk enabled) (without `-DWITH_GTK{2,3}` options, this option will disable gtk2 version.)
* `-DWITH_QT` build qt version (program name: `hotot-qt`)
* `-DWITH_KDE` build qt with kde support (program name by default: `hotot-qt`)
* `-DWITH_KDE_QT` build qt with (program name: `hotot-kde`) and without (program name: `hotot-qt`) kde support at the same time.
* `-DWITH_CHROME` build chrome with mk-chrome-app.sh, will be placed under build directory/chrome/hotot-chrome.zip, need rsync

There is also a option to specify the name of the qt binary with kde support enabled.

* `-DHOTOT_KDE_BIN_NAME=` the value of this option is ONLY used when `-DWITH_QT=On` `-DWITH_KDE=On` `-DWITH_KDE_QT=Off` (all default), in which case this will be the name of the qt wrapper.

For example, to just build gtk with gir rather than qt, the `cmake` command
will be:

    $ cmake .. -DWITH_QT=off

To build all local wrappers (useful for split package,):

    $ cmake .. -DWITH_GTK2=On -DWITH_GTK3=On -DWITH_KDE_QT=On

To build on Archlinux, add:
`-DPYTHON_EXECUTABLE=/usr/bin/python2`

There is something about a Gtk version in Python using some sort of
"distutils".
