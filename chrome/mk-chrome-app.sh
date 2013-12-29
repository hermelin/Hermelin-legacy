#! /bin/sh
ORIGIN="$1/data/"
SRC="$2/data/"
DEST="$2/hermelin-chrome/"
RSYNC="$3"

if [ ! -x "$3" ]; then
    echo "hermelin-chrome: rsync not found."
    exit 1
fi

rsync -av --exclude '.*.*' $ORIGIN $SRC

echo "\033[1;31;40m[i]Update Version ...\033[0m"
VER=`sed -n -e 's/.*version\": \"\([0-9.]*\)\",/\1/p' ${SRC}manifest.json`
sed -i "s/'version': '[0-9.]*'/'version': '${VER}'/g" ${SRC}js/conf.js

echo "\033[1;31;40m[i]Sync ...\033[0m"
# ignore .*.swp, .hgignore, etc
rsync -av --exclude '.*.*' $SRC $DEST

# replace conf.vars.platform, key and secret
echo "\033[1;31;40m[i] Replace platform, key and secret ...\033[0m"
sed -i "s/'platform': '\w*'/'platform': 'Chrome'/g" ${DEST}js/conf.js
sed -i "s/'wrapper': '\w*'/'wrapper': 'chrome'/g" ${DEST}js/conf.js
sed -i "s/'consumer_key': '\w*'/'consumer_key': 'crdJOo1I9t59sS7bQ7dXw'/g" ${DEST}js/conf.js
sed -i "s/'consumer_secret': '\w*'/'consumer_secret': 'XNwwRxOvPMskpGJKc0HeXscGsOLhAVghNhyNq38tFk'/g" ${DEST}js/conf.js

echo "\033[1;31;40m[i] Done!\033[0m"

rm -f hermelin-chrome.zip
zip -r hermelin-chrome.zip "$DEST"
rm -rf "$DEST" "$SRC"


