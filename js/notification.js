var notification = {

  _queue: [],

  _delay: 3000,

  _k_limit: 3,

  check_proc: function check_proc() {
    if (notification._queue.length) {
      var tuple = notification._queue.shift();
      notification.notify(tuple[0], tuple[1], tuple[2], tuple[3]);
    }
  },

  notify: function (title, summary, image, type) {
    title = title.replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&');
    summary = summary.replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&');
    if (util.is_native_platform()) {
      hermelin_action('system/notify/' + type + '/' + encodeURIComponent(title) + '/' + encodeURIComponent(summary) + '/' + encodeURIComponent(image));
    } else if (conf.vars.platform == 'Chrome') {
      var img_url = image ? image : './image/ic64_hermelin.png';
      
      notification.check_permission(function(){
        var note = new Notification(title, { 
		  body: summary,
          icon: img_url
        });
        note.onshow = function () {
          setTimeout(function () {
            note.close();
          }, 5000);
        }
      });
    }
  },
  
  check_permission: function(cb){
    if(Notification.permission !== 'granted'){
      Notification.requestPermission(function(status){
        if(Notification.permission === 'granted'){
          cb();
        }
      });
    } else{
      cb();
    }
  },

  push: function (title, summary, image, type) {
    notification._queue.push([title, summary, image, type]);
    notification.check_proc();
  },

  init: function () {
    notification.check_proc();
  }

};