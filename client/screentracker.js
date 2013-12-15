ScreenTracker = {
  websocket: null,
  wsUri: "ws://localhost:9999",
  init: function() {
            var self = this;
            self.websocket = new WebSocket(self.wsUri);
            self.websocket.onopen = function(evt) {self.onOpen(evt) };
            //self.websocket.onclose = function(evt) { self.onClose(evt) };
            self.websocket.onmessage = function(evt) { self.onMessage(evt) };
            self.websocket.onerror = function(evt) { self.onError(evt) };
  },
  onOpen: function(evt) {
    var self = this;
    self.trackerLog("CONNECTED");
    uuid = self.createUUID();
    window.onmousemove = function(ev){
      self.websocket.send(JSON.stringify({uuid: uuid, date: (new Date()).getTime(), x: ev.clientX,  y:ev.clientY}));
    }
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
ScreenTracker.init();
