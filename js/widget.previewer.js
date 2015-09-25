if (typeof (widget) == 'undefined') widget = {};

function WidgetPreviewer(obj) {
  var self = this;
  self.me = obj;
  self.currentMedia = null;
  self.imageElement = self.me.getElementsByClassName('image')[0];
  self.videoElement = self.me.getElementsByClassName('video')[0];
  self.progress = self.me.getElementsByClassName('image_progress')[0];
  self.link = self.me.getElementsByClassName('image_wrapper')[0];
  self.close_btn = self.me.getElementsByClassName('close')[0];
  self.ytReg = new RegExp('^http\\:\\/\\/www\\.youtube\\.com\\/embed\\/', 'i');
  self.vineReg = ui.Template.preview_link_reg['vine.co'].reg;
  self.instaReg = ui.Template.preview_link_reg['instagram.com'].reg;
  self.zorReg = ui.Template.preview_link_reg['z0r.de'].reg;

  self.reset = function reset() {
    self.me.classList.add('reload');
    self.me.classList.remove('error');
    self.me.style.width = null;
    self.me.style.height = null;
    self.me.style.marginTop = null;
    self.me.style.marginLeft = null;
    self.imageElement.style.width = null;
    self.imageElement.style.height = null;
    self.videoElement.style.width = null;
    self.videoElement.style.height = null;
  }

  self.reload = function reload(url, video) {
    var before = self.currentMedia;
    self.currentMedia = url;
    if (video) {
      self.me.classList.add('video');
      self.me.classList.remove('image');
      if (url !== before || self.me.classList.contains('away')) {
        self.me.classList.remove('z0r');
        var w, h;
        self.reset();
        if (self.ytReg.test(url)) {
          w = 640;
          h = 360;
        } else if (self.instaReg.test(url)) {
          w = 612;
          h = 710;
        } else if (self.zorReg.test(url)){
          w = 900;
          h = 450;
          self.me.classList.add('z0r');
        } else {
          w = 480;
          h = 480;
          self.videoElement.style.width = w + 'px';
          self.videoElement.style.height = h + 'px';
        }
        self.videoElement.removeAttribute('src');
        self.videoElement.src = url;
        self.videoElement.width = w;
        self.videoElement.height = h;
        window.setTimeout(function () {
          self.me.classList.remove('reload');
          self.resize(w, h);
        }, 1);
      }
    } else {
      self.me.classList.remove('z0r');
      self.me.classList.add('image');
      self.me.classList.remove('video');
      self.videoElement.removeAttribute('src');
      self.imageElement.src = self.currentMedia;
      self.link.setAttribute('href', self.currentMedia);
      if (self.imageElement.complete) {
        if (url !== before || self.me.classList.contains('away')) {
          self.reset();
          window.setTimeout(function () {
            self.me.classList.remove('reload');
            self.resize(self.imageElement.naturalWidth, self.imageElement.naturalHeight);
          }, 1);
        }
      } else {
        self.reset();
      }
    }
  }

  self.open = function open() {
    self.me.classList.remove('away');
  }

  self.close = function close() {
    self.videoElement.removeAttribute('src');
    self.me.classList.add('away');
  }

  self.imageElement.onload = function onImgLoad() {
    self.me.classList.remove('reload');
    self.resize(self.imageElement.naturalWidth, self.imageElement.naturalHeight);
  }

  self.resize = function resize(w, h) {
    var scale = 1;
    var xScale = ((0.85 * window.innerWidth) / w);
    var yScale = ((0.85 * window.innerHeight) / h);
    scale = Math.min(scale, xScale);
    scale = Math.min(scale, yScale);
    var newW = scale * w;
    var newH = scale * h;
    self.me.style.width = newW + 'px';
    self.me.style.height = newH + 'px';
    self.me.style.marginTop = (-(newH + self.close_btn.offsetHeight) / 2) + 'px';
    self.me.style.marginLeft = (-newW / 2) + 'px';
    if(self.me.classList.contains('z0r')){
      self.videoElement.style.height = (160 / newH * 100 + 100) + '%'; 
    }
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