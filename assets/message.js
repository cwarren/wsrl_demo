Game.Message = {
  attr: {
    freshMessages: [],
    staleMessages: [],
    archivedMessages: [],
    archiveMessageCount: 200
  },
  render: function (display) {
    //console.dir(this.attr);
    display.clear();
    var dispRowMax = display._options.height - 1;
    var dispColMax = display._options.width - 2;
    var dispRow = 0;
    var freshMsgIdx = 0;
    var staleMsgIdx = 0;
    // fresh messages in white
    for (freshMsgIdx = 0; freshMsgIdx < this.attr.freshMessages.length && dispRow < dispRowMax; freshMsgIdx++) {
      //console.log('rendering fresh: '+this.attr.freshMessages[freshMsgIdx]);
      dispRow += display.drawText(1,dispRow,'%c{#fff}%b{#000}'+this.attr.freshMessages[freshMsgIdx]+'%c{}%b{}',79);
    }
    // stale messages in grey
    for (staleMsgIdx = 0; staleMsgIdx < this.attr.staleMessages.length && dispRow < dispRowMax; staleMsgIdx++) {
      //console.log('rendering stale: '+this.attr.staleMessages[staleMsgIdx]);
      dispRow += display.drawText(1,dispRow,'%c{#aaa}%b{#000}'+this.attr.staleMessages[staleMsgIdx]+'%c{}%b{}',79);
    }

    // always archive the oldest stale message
    if (this.attr.staleMessages.length > 0) {
      this.attr.archivedMessages.unshift(this.attr.staleMessages.pop());
    }
    // archive any additional stale messages that didn't get shown
    while (this.attr.staleMessages.length > staleMsgIdx) {
      this.attr.archivedMessages.unshift(this.attr.staleMessages.pop());
    }
    // just dump messages that are too old for the archive
    while (this.attr.staleMessages.length > this.attr.archiveMessageCount) {
      this.attr.archivedMessages.pop();
    }
    // move fresh messages to stale messages
    while (this.attr.freshMessages.length > 0) {
      this.attr.staleMessages.unshift(this.attr.freshMessages.pop());
    }

  },
  send: function (msg) {
    this.attr.freshMessages.push(msg); // new messages get added to the end of the fresh message queue so that sequential things are in the right order (e.g. you hit the goblin, you kill the goblin)
  },
  clear: function () {
    this.attr.freshMessages = [];
    this.attr.staleMessages = [];
  }
};
