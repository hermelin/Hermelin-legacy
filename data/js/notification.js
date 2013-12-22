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
      var notification = webkitNotifications.createNotification(img_url, title, summary);
      notification.show();
      notification.ondisplay = function () {
        setTimeout(function () {
          notification.cancel()
        }, 5000);
      }
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