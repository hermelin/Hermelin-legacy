var hotkey = hotkey || {}
hotkey = {
  map: [],

  // mod key definition
  shiftKey: 1,
  ctrlKey: 2,
  altKey: 4,

  init: function init() {
    document.addEventListener('keypress', hotkey.crack, true);
  },

  crack: function crack(event) {
    if (event.keyCode == 27) { //ESC, reset all input queues
      for (var i = 0, i_max = hotkey.map.length; i < i_max; i++) {
        hotkey.map[i].pos = 0;
      }
      if (ui.Previewer.visible)
        ui.Previewer.close();
      // @TODO close dialog.
      return;
    }

    var checkKey = function (map, evt) {
      var key = map.seq[map.pos];
      if (typeof key === "string") {
        var modkeys = key.substring(0, key.length - 1);
        if (evt.charCode !== key.substr(-1).charCodeAt(0) ||
            evt.ctrlKey !== (modkeys.indexOf("C") >= 0) ||
            evt.altKey !== (modkeys.indexOf("A") >= 0)) {
          return false;
        }
      } else {
        var ckey = hotkey.calculate(evt.keyCode,
          evt.shiftKey ? hotkey.shiftKey : null,
          evt.ctrlKey ? hotkey.ctrlKey : null,
          evt.altKey ? hotkey.altKey : null);
        if (key !== ckey) {
          return false;
        }
      }
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      return true;
    }

    var isFocusOnInput = (/^INPUT$|^TEXTAREA$/.test(event.target.tagName)) && $(event.target).is(':visible');
    var isViewVisible = globals.signed_in;
    var isMenuVisible = $(".hermelin_menu:visible").length > 0;

    var etype = event.type[3].toUpperCase();
    var mi = null,
      mpos = -1;
    for (var i = 0, i_max = hotkey.map.length; i < i_max; i++) {
      var map = hotkey.map[i];
      var flags = map.flags;
      if (flags.indexOf(etype) >= 0) {
        var c = true;
        if (flags.indexOf("*") < 0) {
          if (isFocusOnInput && flags.indexOf("i") < 0) {
            c = false;
          } else if (!isViewVisible && flags.indexOf("g") < 0) {
            c = false;
          } else if (isMenuVisible && flags.indexOf("m") < 0) {
            c = false;
          }
        }
        if (c && checkKey(map, event)) {
          if (map.pos + 1 === map.seq.length) {
            // only the callback function of the longest sequence should be called.
            // e.g. "r" vs. "ar"
            if (map.pos > mpos) {
              mi = i;
              mpos = map.pos;
            }
            map.pos = 0;
          } else {
            map.pos++;
          }
        } else {
          var prev = map.pos;
          map.pos = 0;
          if (prev > 0 && c && checkKey(map, event)) {
            map.pos++;
          }
        }
      }
    }
    if (mi != null) {
      event.preventDefault();
      try {
        hotkey.map[mi].f();
      } catch (ex) {}
      hotkey.map.forEach(function(map){
        map.pos = 0;
      });
    }
  },

  register: function register(name, keySeq, flags, callback) {
    // flags:
    //   "*": call callback function in any cases
    //   "i": call callback function, even typing text
    //   "g": call callback function, even not login
    //   "m": call callback function, even a popup menu showed
    //   "U": call callback function at keyup event
    //   "D": call callback function at keydown event
    //   "P": call callback function at keypress event
    if (typeof flags === "function") {
      callback = flags;
      flags = "";
    }
    var keys;
    if (typeof keySeq === "string") {
      keys = [];
      for (var i = 0, i_max = keySeq.length; i < i_max; i++) {
        var keyChar = keySeq[i];
        if (keyChar === "<") {
          var p = keySeq.indexOf(">", i + 1);
          if (p == -1) {
            return false;
          }
          keyChar = keySeq.substring(i + 1, p).replace(/([ACS]{1,3})-/g, "$1");
          i = p;
        }
        keys.push(keyChar);
      }
      flags = flags.replace(/[UD]/g, "");
      if (flags.indexOf("P") < 0) {
        flags += "P";
      }
    } else {
      if (typeof keySeq === "number") {
        keys = [keySeq];
      } else if (keySeq instanceof Array) {
        keys = [].concat(keySeq);
      } else {
        return false;
      }
      flags = flags.replace(/[UD]/g, "");
      if (flags.indexOf("P") < 0) {
        flags += "P";
      }
    }
    hotkey.map.push({
      seq: keys,
      f: callback,
      pos: 0,
      flags: flags,
      name: name
    });
    return true;
  },
  
  unregister: function unregister(name){
    var index = -1;
    hotkey.map.forEach(function(thismap, i){
      if(thismap.name && thismap.name===name){
        index = i;
      }
    });
    if(index !== -1){
      hotkey.map.splice(index, 1);
    }
  },
  
  get: function get(name){
    var sequence = '';
    hotkey.map.forEach(function(thismap){
      if(thismap.name && thismap.name===name){
        thismap.seq.forEach(function(seq){
          sequence += seq.substr(-1);
        });
      }
    });
    return sequence;
  },
  
  clear: function clear(){
    hotkey.map = [];
  },

  calculate: function calculate(keyCode, modkeys) {
    var idx = keyCode << 3;
    for (var i = 1, i_max = arguments.length; i < i_max; i++) {
      var key = arguments[i];
      if (key === hotkey.shiftKey || key === hotkey.ctrlKey || key === hotkey.altKey) {
        idx |= key;
      }
    }
    return idx;
  }

};