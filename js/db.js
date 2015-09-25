if (typeof db == 'undefined') var db = {};
db = {

  cache: null,

  MAX_TWEET_CACHE_SIZE: 4096,

  MAX_USER_CACHE_SIZE: 1024,

  MAX_HASHTAG_CACHE_SIZE: 2048,

  version: 4,

  init: function init(callback) {
    db.database = window.openDatabase('hermelin.cache', '', 'Cache of Hermelin', 10);
    db.get_version(function (version) {
      var db_version = parseInt(version);
      if (db_version === 2 || db_version === 3) { // from 2 to 3 / 3 to 4
        db.create_cache(function () {
          db.update_version(callback);
        });
      } else if (db_version === db.version) {
        if (typeof (callback) != 'undefined') {
          callback();
        }
      } else { // rebuild
        db.create_sys(function () {
          db.create_cache(function () {
            db.update_version(callback);
          });
        });
      }
    });
  },

  create_sys: function create_sys(callback) {
    db.database.transaction(function (tx) {
      var procs = [

    function () {
          tx.executeSql('DROP TABLE IF EXISTS "Info"', [], function () {
            $(window).dequeue('_database');
          });
    },

    function () {
          tx.executeSql('DROP TABLE IF EXISTS "Profile"', [], function () {
            $(window).dequeue('_database');
          });
    },

    function () {
          tx.executeSql('CREATE TABLE IF NOT EXISTS "Info" ("key" CHAR(256) PRIMARY KEY  NOT NULL  UNIQUE , "value" TEXT NOT NULL )', [], function () {
            $(window).dequeue('_database');
          });
    },

    function () {
          tx.executeSql('CREATE TABLE IF NOT EXISTS "Profile" ("name" CHAR(256) PRIMARY KEY  NOT NULL UNIQUE , "protocol" CHAR(64) NOT NULL , "preferences" TEXT NOT NULL, "order" INTEGER DEFAULT 0)', [], function () {
            $(window).dequeue('_database');
          });
    },

    function () {
          tx.executeSql('INSERT or REPLACE INTO Info VALUES("settings", ?)', [JSON.stringify(conf.default_settings)], function () {
            $(window).dequeue('_database');
          });
    },

    function () {
          if (typeof (callback) != 'undefined') {
            callback();
          }
    }
      ];
      $(window).queue('_database', procs);
      $(window).dequeue('_database');
    });
  },

  update_version: function update_version(callback) {
    db.database.transaction(function (tx) {
      var procs = [

    function () {
          tx.executeSql('INSERT or REPLACE INTO Info VALUES("version", ?)', [db.version], function () {
            $(window).dequeue('_database');
          });
    },

    function () {
          if (typeof (callback) != 'undefined') {
            callback();
          }
    }
      ];
      $(window).queue('_database', procs);
      $(window).dequeue('_database');
    });
  },

  create_cache: function create_cache(callback) {
    db.database.transaction(function (tx) {
      var procs = [

    function () {
          tx.executeSql('DROP TABLE IF EXISTS "TweetCache"', [], function () {
            $(window).dequeue('_database');
          });
    },

    function () {
          tx.executeSql('DROP TABLE IF EXISTS "UserCache"', [], function () {
            $(window).dequeue('_database');
          });
    },

    function () {
          tx.executeSql('DROP TABLE IF EXISTS "HashtagCache"', [], function () {
            $(window).dequeue('_database');
          });
    },

    function () {
          tx.executeSql('CREATE TABLE IF NOT EXISTS "TweetCache" ("id" CHAR(256) PRIMARY KEY  NOT NULL  UNIQUE , "status" NCHAR(140) NOT NULL, "json" TEXT NOT NULL )', [], function () {
            $(window).dequeue('_database');
          });
    },

    function () {
          tx.executeSql('CREATE TABLE IF NOT EXISTS "UserCache" ("id" INTEGER PRIMARY KEY  AUTOINCREMENT  UNIQUE  DEFAULT 0, "user_id" CHAR(256) NOT NULL UNIQUE, "screen_name" CHAR(64) NOT NULL , "json" TEXT NOT NULL )', [], function () {
            $(window).dequeue('_database');
          });
    },

    function () {
          tx.executeSql('CREATE TABLE IF NOT EXISTS "HashtagCache" ("id" INTEGER PRIMARY KEY  AUTOINCREMENT  UNIQUE  DEFAULT 0, "hashtag" TEXT UNIQUE NOT NULL )', [], function () {
            $(window).dequeue('_database');
          });
    },

    function () {
          if (typeof (callback) != 'undefined') {
            callback();
          }
    }
      ];
      $(window).queue('_database', procs);
      $(window).dequeue('_database');
    });
  },

  dump_users: function dump_users(json_obj) {
    var dump_single_user = function (tx, user) {
      // update user obj
      tx.executeSql('INSERT OR REPLACE INTO UserCache (user_id, screen_name, json) VALUES (?, ?, ?)', [user.id_str, user.screen_name, JSON.stringify(user)], function (tx, rs) {}, function (tx, error) {
        hermelin_log('DB', 'INSERT ERROR: ' + error.code + ',' + error.message);
      });
    };
    // dump users
    db.database.transaction(function (tx) {
      for (var i = 0, l = json_obj.length; i < l; i += 1) {
        var user = json_obj[i];
        dump_single_user(tx, user);
      }
    });
  },

  dump_tweets: function dump_tweets(json_obj) {
    var dump_single_user = function (tx, user) {
      tx.executeSql('INSERT OR REPLACE INTO UserCache (user_id, screen_name, json) VALUES (?, ?, ?)', [user.id_str, user.screen_name, JSON.stringify(user)], function (tx, rs) {}, function (tx, error) {
        hermelin_log('DB', 'INSERT ERROR: ' + error.code + ',' + error.message);
      });
    };
    var dump_single_tweet = function (tx, tweet_obj) {
      tx.executeSql('INSERT or REPLACE INTO TweetCache VALUES (?, ?, ?)', [tweet_obj.id_str, tweet_obj.text, JSON.stringify(tweet_obj)], function (tx, rs) {}, function (tx, error) {
        hermelin_log('DB', 'INSERT ERROR: ' + error.code + ',' + error.message);
      });
    };

    // dump tweets
    db.database.transaction(function (tx) {
      for (var i = 0, l = json_obj.length; i < l; i += 1) {
        var tweet_obj = json_obj[i];
        if (tweet_obj.hasOwnProperty('retweeted_status')) {
          dump_single_tweet(tx, tweet_obj['retweeted_status']);
        }
        dump_single_tweet(tx, tweet_obj);
      }
    });
    // dump users
    db.database.transaction(function (tx) {
      for (var i = 0, l = json_obj.length; i < l; i += 1) {
        var tweet_obj = json_obj[i];
        var user = typeof tweet_obj.user != 'undefined' ? tweet_obj.user : tweet_obj.sender;
        dump_single_user(tx, user);
      }
    });
  },

  dump_hashtags: function dump_hashtags(tags) {
    var dump_single_hashtag = function (tx, tag) {
      tx.executeSql('INSERT OR REPLACE INTO HashtagCache (hashtag) VALUES (?)', [tag], function (tx, rs) {}, function (tx, error) {
        hermelin_log('DB', 'INSERT ERROR: ' + error.code + ',' + error.message);
      });
    }
    //dump hashtags
    db.database.transaction(function (tx) {
      for (var i = 0, l = tags.length; i < l; i += 1) {
        var tag = tags[i];
        dump_single_hashtag(tx, tag);
      }
    });
  },

  get_version: function get_version(callback) {
    db.database.readTransaction(function (tx) {
      tx.executeSql('SELECT * FROM sqlite_master WHERE type="table" and name="Info"', [], function (tx, rs) {
        if (rs.rows.length == 0) {
          callback(-1);
        } else {
          tx.executeSql('SELECT key, value FROM Info WHERE key="version"', [], function (tx, rs) {
            callback(rs.rows.item(0).value);
          }, function (tx, err) {
            callback(-2);
          });
        }
      });
    });
  },


  get_tweet: function get_tweet(key, callback) {
    db.database.readTransaction(function (tx) {
      tx.executeSql('SELECT id, status, json FROM TweetCache WHERE id=?', [key], function (tx, rs) {
        callback(tx, rs);
      });
    });
  },

  get_user: function get_user(screen_name, callback) {
    db.database.readTransaction(function (tx) {
      tx.executeSql('SELECT id, screen_name, json FROM UserCache WHERE screen_name=?', [screen_name], function (tx, rs) {
        if (rs.rows.length != 0) {
          callback(JSON.parse(rs.rows.item(0).json));
        } else {
          callback(null);
        }
      });
    });
  },

  search_user: function search_user(query, callback) {
    db.database.readTransaction(function (tx) {
      tx.executeSql('SELECT user_id, screen_name, json FROM UserCache WHERE screen_name LIKE \'%' + query.replace(/_/g, '^_') + '%\' ESCAPE \'^\'', [], function (tx, rs) {
        callback(tx, rs);
      });
    });
  },

  get_screen_names_starts_with: function get_users_starts_with(starts, callback) {
    db.database.readTransaction(function (tx) {
      tx.executeSql('SELECT screen_name FROM UserCache WHERE screen_name LIKE \'' + starts.replace(/_/g, '^_') + '%\' ESCAPE \'^\'', [], function (tx, rs) {
        callback(tx, rs);
      });
    });
  },

  get_screen_names: function get_screen_names(callback) {
    db.database.readTransaction(function (tx) {
      tx.executeSql('SELECT screen_name FROM UserCache ORDER BY screen_name', [], function (tx, rs) {
        callback(tx, rs);
      });
    });
  },
  
  get_hashtags_starts_with: function get_hashtags_starts_with(starts, callback) {
    db.database.readTransaction(function (tx) {
      tx.executeSql('SELECT hashtag FROM HashtagCache WHERE hashtag LIKE \'' + starts.replace(/_/g, '^_') + '%\' ESCAPE \'^\'', [], function (tx, rs) {
        callback(tx, rs);
      });
    });
  },

  reduce_user_cache: function reduce_user_cache(limit, callback) {
    db.database.transaction(function (tx) {
      tx.executeSql('DELETE FROM UserCache WHERE id in (SELECT id FROM UserCache ORDER BY id limit ?)', [limit], callback);
    });
  },

  reduce_tweet_cache: function reduce_tweet_cache(limit, callback) {
    db.database.transaction(function (tx) {
      tx.executeSql('DELETE FROM TweetCache WHERE id in (SELECT id FROM TweetCache ORDER BY id limit ?)', [limit], callback);
    });
  },
  
  reduce_hashtag_cache: function reduce_hashtag_cache(limit, callback) {
    db.database.transaction(function (tx) {
      tx.executeSql('DELETE FROM HashtagCache WHERE id in (SELECT id FROM HashtagCache ORDER BY id limit ?)', [limit], callback);
    });
  },

  get_tweet_cache_size: function get_tweet_cache_size(callback) {
    db.database.readTransaction(function (tx) {
      tx.executeSql('SELECT count(*) FROM TweetCache', [], function (tx, rs) {
        callback(rs.rows.item(0)['count(*)']);
      });
    });
  },

  get_user_cache_size: function get_user_cache_size(callback) {
    db.database.readTransaction(function (tx) {
      tx.executeSql('SELECT count(*) FROM UserCache', [], function (tx, rs) {
        callback(rs.rows.item(0)['count(*)']);
      });
    });
  },
  
  get_hashtag_cache_size: function get_hashtag_cache_size(callback) {
    db.database.readTransaction(function (tx) {
      tx.executeSql('SELECT count(*) FROM HashtagCache', [], function (tx, rs) {
        callback(rs.rows.item(0)['count(*)']);
      });
    });
  },

  reduce_db: function reduce_db() {
    //reduces all caches to 2/3 of their max size
    db.get_tweet_cache_size(function (size) {
      if (db.MAX_TWEET_CACHE_SIZE < size) {
        db.reduce_tweet_cache(
          parseInt(db.MAX_TWEET_CACHE_SIZE * 2 / 3), function () {})
      }
    });
    db.get_user_cache_size(function (size) {
      if (db.MAX_USER_CACHE_SIZE < size) {
        db.reduce_user_cache(
          parseInt(db.MAX_USER_CACHE_SIZE * 2 / 3), function () {})
      }
    });
    db.get_hashtag_cache_size(function (size) {
      if (db.MAX_HASHTAG_CACHE_SIZE < size) {
        db.reduce_hashtag_cache(
          parseInt(db.MAX_HASHTAG_CACHE_SIZE * 2 / 3), function () {})
      }
    });
  },

  save_option: function save_option(key, value, callback) {
    db.database.transaction(function (tx) {
      tx.executeSql('INSERT or REPLACE INTO Info VALUES(?, ?)', [key, value], function (tx, rs) {
        callback(true);
      }, function (tx, error) {
        callback(false);
      });
    });
  },

  load_option: function load_option(key, callback) {
    db.database.readTransaction(function (tx) {
      tx.executeSql('SELECT key, value FROM Info WHERE key=?', [key], function (tx, rs) {
        callback(rs.rows.item(0).value);
      }, function (tx, error) {
        callback(null);
      });
    });
  },

  save_profile_prefs: function save_profile_prefs(name, json, callback) {
    db.database.transaction(function (tx) {
      tx.executeSql('UPDATE Profile SET preferences=? WHERE name=?', [name, json], function (tx, rs) {
        callback(true);
      }, function (tx, error) {
        callback(false);
      });
    });
  },

  load_profile_prefs: function load_profile_prefs(name, callback) {
    db.database.readTransaction(function (tx) {
      tx.executeSql('SELECT preferences FROM Profile WHERE name=?', [name], function (tx, rs) {
        if (rs.rows.length == 0) {
          callback('{}');
        } else {
          callback(rs.rows.item(0).preferences);
        }
      });
    });
  },

  add_profile: function add_profile(prefix, protocol, callback) {
    db.database.transaction(function (tx) {
      tx.executeSql('INSERT INTO Profile VALUES(?, ?, ?, ?)', [prefix + '@' + protocol, protocol, JSON.stringify(conf.get_default_prefs(protocol)), 0], function (tx, rs) {
        callback(true);
      }, function (tx, error) {
        callback(error);
      });
    });
  },

  remove_profile: function remove_profile(name, callback) {
    db.database.transaction(function (tx) {
      tx.executeSql('DELETE FROM Profile WHERE name=?', [name], function (tx, rs) {
        callback(true);
      }, function (tx, error) {
        callback(false);
      });
    });
  },

  modify_profile: function modify_profile(name, profile, callback) {
    db.database.transaction(function (tx) {
      tx.executeSql('UPDATE Profile SET "name"=?, "protocol"=?, "preferences"=?, "order"=? WHERE "name"=?', [profile.name, profile.protocol, profile.preferences, profile.order, name], function (tx, rs) {
        callback(true);
      }, function (tx, error) {
        callback(error);
      });
    });
  },

  get_profile: function get_profile(name, callback) {
    db.database.readTransaction(function (tx) {
      tx.executeSql('SELECT * FROM Profile WHERE name=?', [name], function (tx, rs) {
        if (rs.rows.length == 0) {
          callback({});
        } else {
          callback({
            'name': rs.rows.item(0).name,
            'protocol': rs.rows.item(0).protocol,
            'preferences': rs.rows.item(0).preferences,
            'order': rs.rows.item(0).order
          });
        }
      });
    });
  },

  get_all_profiles: function get_all_profiles(callback) {
    db.database.readTransaction(function (tx) {
      tx.executeSql('SELECT * FROM "Profile" ORDER BY "Profile"."order"', [], function (tx, rs) {
        if (rs.rows.length == 0) {
          callback([]);
        } else {
          var profs = [];
          for (var i = 0, l = rs.rows.length; i < l; i += 1) {
            profs.push({
              'name': rs.rows.item(i).name,
              'protocol': rs.rows.item(i).protocol,
              'preferences': rs.rows.item(i).preferences,
              'order': rs.rows.item(i).order
            });
          }
          callback(profs);
        }
      });
    });
  }

};