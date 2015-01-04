if (typeof util == 'undefined') var util = {};
util = {

  loadJSON: function (path, success, error) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          if (success){
            try{
              success(JSON.parse(xhr.responseText));
            }
            catch(e){
              error(e);
            }
          }
        } else {
          if (error)
            error(xhr);
        }
      }
    };
    xhr.open("GET", path, true);
    xhr.send();
  },

  fadeIn: function (elems, opts, cb) {
    //used to fade DOMElements in
    //options are speed (speed of the animation, int)
    if (!elems) {
      return;
    }
    var elemClass = Object.prototype.toString.call(elems);
    if (elemClass != '[object Array]' && elemClass != '[object NodeList]' && elemClass != '[object HTMLCollection]') {
      inner(elems);
    } else {
      for (var i = 0; i < elems.length; i++) {
        util.fadeIn(elems[i]);
      }
    }

    //actual fadein (removes/adds some css classes)

    function inner(elem) {
      elem.classList.remove('away');
      elem.style["-webkit-transition"] = (opts && opts.speed) ? ('opacity ' + (opts.speed / 1000)) + 's' : 'opacity .4s';
      elem.classList.add('fade');
      setTimeout(function () {
        //setting the value 1 ms later, so it actually animates it.
        //it wouldn't if not, because js and css behave like that ._.

        if (!elem.classList.contains('away')) {
          //the if is just to make sure it didn't fade out in that ms
          elem.classList.add('fadein');
        }
      }, 1);
      setTimeout(function () {
        elem.style["-webkit-transition"] = null;
        if (cb) {
          cb();
        }
      }, (opts && opts.speed) ? opts.speed : 401);
    }
  },

  fadeOut: function (elems, opts, cb) {
    //used to fade DOMElements out
    //options are noAnim (no animation, bool) and speed (speed of the animation, int). the callback will be executed after the tranisition finished.
    if (!elems) {
      return;
    }
    var elemClass = Object.prototype.toString.call(elems);
    if (elemClass != '[object Array]' && elemClass != '[object NodeList]' && elemClass != '[object HTMLCollection]') {
      inner(elems);
    } else {
      for (var i = 0; i < elems.length; i++) {
        util.fadeOut(elems[i]);
      }
    }

    //actual fadeout (removes/adds some css classes)

    function inner(elem) {
      elem.classList.remove('fadein');
      elem.classList.add('fade');
      elem.style["-webkit-transition"] = (opts && opts.speed) ? ('opacity ' + (opts.speed / 1000)) + 's' : 'opacity .4s';
      if (opts && opts.noAnim) {
        elem.classList.add('away');
      } else {
        setTimeout(function () {
          if (!elem.classList.contains('fadein')) {
            elem.classList.add('away');
            elem.style["-webkit-transition"] = null;
          }
          if (cb) {
            cb();
          }
        }, ((opts && opts.speed) ? opts.speed : 400));
      }
    }
  },

  docReady: function (cb) {
    //executes function when document is loaded
    function inner() {
      if (document.readyState === 'complete') {
        cb();
      } else {
        setTimeout(inner, 50);
      }
    }
    inner();
  },

  extend: function () {
    for (var i = 1; i < arguments.length; i++) {
      for (var key in arguments[i]) {
        if (arguments[i].hasOwnProperty(key)) {
          arguments[0][key] = arguments[i][key];
        }
      }
    }
    return arguments[0];
  },

  native_platform: ['Linux', 'Windows', 'Mac'],

  compare_id: function (id1, id2) {
    if (id1.length < id2.length) {
      return -1;
    } else if (id2.length < id1.length) {
      return 1;
    } else {
      if (id1 == id2)
        return 0;
      else
        return id1 < id2 ? -1 : 1;
    }
  },

  generate_uuid: function () {
    var S4 = function () {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
  },

  unserialize_dict: function unserialize_dict(str) {
    /* str = urlencode(key1)
     *  + '=' + urlencode(value1)
     *  + '&'
     *  + urlencode(key2) 
     *  + '=' + urlencode(value2)
     *  --> 
     *      {key1: value1, key2: value2 ...} 
     * */
    dict = {}; // return {} if dict is invalid.
    var pairs = str.split('&');
    if (1 < pairs.length) {
      for (var i = 0, l = pairs.length; i < l; i += 1) {
        var pair = pairs[i].split('=');
        dict[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
      }
    }
    return dict;
  },

  serialize_dict: function (obj) {
    /* {key1: value1, key2: value2 ...}  --> 
     *      str = urlencode(key1)
     *      + '=' + urlencode(value1)
     *      + '&'
     *      + urlencode(key2) 
     *      + '=' + urlencode(value2)
     * */
    var arr = [];
    for (var key in obj) {
      arr.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
    }
    return arr.join('&');
  },

  serialize_array: function (arr) {
    var ret = arr.map(function (elem) {
      return encodeURIComponent(elem);
    });
    return ret.join('&');
  },

  is_native_platform: function () {
    return util.native_platform.indexOf(conf.vars.platform) != -1;
  },

  trace: function () {
    var callstack = [];
    var i = 0;
    var currentFunction = arguments.callee.caller;
    while (currentFunction) {
      var fn = currentFunction.toString();
      var fname = fn.substring(0, fn.indexOf('\n')) || 'anonymous';
      callstack.push(fname);
      currentFunction = currentFunction.caller;
      if (i == 10) break;
      i += 1;
    }
    hermelin_log('TraceBack', '\n-------------\n  ' + callstack.join('\n-------------\n  '));
  },

  cache_avatar: function (user_obj) {
    db.get_user(user_obj.screen_name, function (exists_user) {
      var imgurl = user_obj.profile_image_url;
      var imgname = imgurl.substring(imgurl.lastIndexOf('/') + 1);
      var avatar_file = user_obj.screen_name + '_' + imgname;
      hermelin_action('action/save_avatar/' + encodeURIComponent(imgurl) + '/' + encodeURIComponent(avatar_file));
    });
  },

  get_avatar: function (screen_name, callback) {
    if (util.is_native_platform()) {
      db.get_user(screen_name, function (user) {
        var imgurl = user.profile_image_url;
        var avatar_file = user.screen_name + '_' + imgurl.substring(imgurl.lastIndexOf('/') + 1);
        callback(conf.vars.avatar_cache_dir + '/' + avatar_file);
      });
    } else {
      db.get_user(screen_name, function (user) {
        callback(user.profile_image_url);
      });
    }
  },

  concat: function (arr, lst) {
    for (var i = 0; i < lst.length; i += 1) {
      arr.push(lst[i]);
    }
    return arr;
  }

};