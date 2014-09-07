if (typeof (widget) == 'undefined') widget = {};

function WidgetPreviewer(obj) {
  var self = this;
  self.me = obj;
  self.currentMedia = null;
  self.imageElement = self.me.getElementsByClassName('image')[0];
  self.youtubeElement = self.me.getElementsByClassName('youtube')[0];
  self.progress = self.me.getElementsByClassName('image_progress')[0];
  self.link = self.me.getElementsByClassName('image_wrapper')[0];
  self.close_btn = self.me.getElementsByClassName('close')[0];
  self.ytReg = new RegExp('^http\\:\\/\\/www\\.youtube\\.com\\/embed\\/','i');

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
    if (self.ytReg.test(url)) {
      self.me.classList.add('youtube');
      self.me.classList.remove('image');
      if(url !== before || self.me.classList.contains('away')){
        self.youtubeElement.src = url;
        self.reset();
        window.setTimeout(function () {
          self.me.classList.remove('reload');
          self.resize(self.youtubeElement.width, self.youtubeElement.height);
        }, 1);
      }
    } else {
      self.me.classList.add('image');
      self.me.classList.remove('youtube');
      self.youtubeElement.src = '';
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
    self.youtubeElement.src = '';
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
    self.me.style.height = newH + self.close_btn.offsetHeight + 'px';
    self.me.style.marginTop = (-(newH + self.close_btn.offsetHeight) / 2) + 'px';
    self.me.style.marginLeft = (-newW / 2) + 'px';
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