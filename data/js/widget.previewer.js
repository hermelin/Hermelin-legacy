if (typeof (widget) == 'undefined') widget = {};

function WidgetPreviewer(obj) {
  var self = this;
  self.me = obj;
  self.currentMedia = null;
  self.imageElement = self.me.getElementsByClassName('image')[0];
  self.progress = self.me.getElementsByClassName('image_progress')[0];
  self.link = self.me.getElementsByClassName('image_wrapper')[0];
  self.close_btn = self.me.getElementsByClassName('close')[0];

  self.reset = function reset() {
    self.me.classList.add('reload');
    self.me.classList.remove('error');
    self.me.style.width = null;
    self.me.style.height = null;
    self.me.style.marginTop = null;
    self.me.style.marginLeft = null;
    self.imageElement.style.width = null;
    self.imageElement.style.height = null;
  }

  self.reload = function reload(url) {
    var before = self.currentMedia;
    self.currentMedia = url;
    self.imageElement.src = self.currentMedia;
    self.link.setAttribute('href', self.currentMedia);
    if (self.imageElement.complete) {
      if (url !== before || self.me.classList.contains('away')) {
        self.reset();
        window.setTimeout(function () {
          self.me.classList.remove('reload');
          self.resize();
        }, 1);
      }
    } else {
      self.reset();
    }
  }

  self.open = function open() {
    self.me.classList.remove('away');
  }

  self.close = function close() {
    self.me.classList.add('away');
  }

  self.imageElement.onload = function onImgLoad() {
    self.me.classList.remove('reload');
    self.resize();
  }

  self.resize = function resize() {
    var img = self.imageElement;
    var scale = 1;
    var xScale = ((0.85 * window.innerHeight) / img.naturalHeight);
    var yScale = ((0.85 * window.innerWidth) / img.naturalWidth);
    scale = Math.min(scale, xScale);
    scale = Math.min(scale, yScale);
    var w = scale * img.naturalWidth;
    var h = scale * img.naturalHeight;
    self.me.style.width = w + 'px';
    self.me.style.height = h + self.close_btn.offsetHeight + 'px';
    self.me.style.marginTop = (-(h + self.close_btn.offsetHeight) / 2) + 'px';
    self.me.style.marginLeft = (-w / 2) + 'px';
  }

  self.imageElement.onerror = function onImgError() {
    self.me.classList.add('error');
  }
  
  self.imageElement.onabort = function onImgError() {
    self.me.classList.add('error');
  }

  self.link.onclick = function onLinkClick(e) {
    self.close();
    if (!self.me.classList.contains('reload') && e.button !== 2) {
      if (conf.vars.platform === 'Chrome') {
        chrome.tabs.create({
          url: self.link.getAttribute('href'),
          active: e.button === 0
        }, function () {});
        return false;
      }
    }
  }

  self.close_btn.onclick = function onCloseClick() {
    self.close();
  }
}

widget.previewer = WidgetPreviewer;