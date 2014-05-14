ScreenTracker = {
  websocket: null,
  config: {
    wsUri: "ws://localhost:9999", 
    catcheableElements: {},
  },
  init: function(options) {
            var self = this;
            if(options != null){
              for(i in options){
                self.config[i] = options[i];
              }
            }
            self.websocket = new WebSocket(self.config.wsUri);
            self.websocket.onopen = function(evt) {self.onOpen(evt) };
            //self.websocket.onclose = function(evt) { self.onClose(evt) };
            self.websocket.onmessage = function(evt) { self.onMessage(evt) };
            self.websocket.onerror = function(evt) { self.onError(evt) };
  },
  getWindowSize: function() {
  var docEl = document.documentElement,
      IS_BODY_ACTING_ROOT = docEl && docEl.clientHeight === 0;

  // Used to feature test Opera returning wrong values 
  // for documentElement.clientHeight. 
  function isDocumentElementHeightOff () { 
      var d = document,
          div = d.createElement('div');
      div.style.height = "2500px";
      d.body.insertBefore(div, d.body.firstChild);
      var r = d.documentElement.clientHeight > 2400;
      d.body.removeChild(div);
      return r;
  }

  if (typeof document.clientWidth == "number") {
     return function () {
       return { width: document.clientWidth, height: document.clientHeight };
     };
  } else if (IS_BODY_ACTING_ROOT || isDocumentElementHeightOff()) {
      var b = document.body;
      return function () {
        return { width: b.clientWidth, height: b.clientHeight };
      };
  } else {
      return function () {
        return { width: docEl.clientWidth, height: docEl.clientHeight };
      };
  }
},
  onOpen: function(evt) {
    var self = this;
    self.trackerLog("CONNECTED");
    if(self.config.id == undefined){
      uuid = self.createUUID();
    } else{
      uuid = self.config.id;
    }

    window.addEventListener('mousemove', function(ev){
      var size = self.getWindowSize();
      var w = size().width, h= size().height;
      self.websocket.send(JSON.stringify({uuid: uuid, event: "position", date: (new Date()).getTime(), x: ev.clientX,  y:ev.clientY, width: w, height: h}));
    });
    window.addEventListener('click', function(ev){
      self.websocket.send(JSON.stringify({uuid: uuid, event: "click", date: (new Date()).getTime()}));
    });
    window.addEventListener('dblclick', function(ev){
      self.websocket.send(JSON.stringify({uuid: uuid, event: "doubleclick", date: (new Date()).getTime()}));
    });
    for(eventType in self.config.catcheableElements) {
      var event = self.config.catcheableElements[eventType];
      for(i in event) {
        elem = event[i];
        myList = document.querySelectorAll(elem);
        for (var i = 0; i < myList.length; ++i) {
          var item = myList[i];
          item.addEventListener(eventType, self._injectEvent.bind(self, eventType, elem));
        }
      }      
    }

  },
  _injectEvent: function(eventType, item){
      var self = this;
      console.log(this);      
      console.log(eventType, item);
      self.websocket.send(JSON.stringify({uuid: uuid, event: eventType, element: item, date: (new Date()).getTime()}));
  },
  onClose: function(evt) {
    var self = this;
    self.trackerLog("DISCONNECTED");
  },
  onMessage: function(evt) {
    var self = this;
    self.trackerLog('RESPONSE: ' + evt.data);
    //self.websocket.close();
  },
  onError: function(evt) {
    var self = this;
    alert("Can't connect to server");
    self.trackerLog('<span style="color: red;">ERROR:</span> ' + evt.data);
  },
  doSend: function(message) {
    var self = this;
    self.trackerLog("SENT: " + message);
    self.websocket.send(message);
  },
  trackerLog: function(message) {
    console.log(message);
  },
  createUUID: function() {
    // http://www.ietf.org/rfc/rfc4122.txt
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "-";

    var uuid = s.join("");
    return uuid;
  }
}

//ScreenTracker.init();