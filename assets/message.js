Game.Message = {
  attr: {
    freshMessagesReverseQueue: [],
    staleMessagesQueue: [],
    archivedMessagesQueue: [],
    archiveMessageLimit: 200
  },
  render: function (display) {
    // console.log('render messages');
    //console.dir(this.attr);
    display.clear();
    var dispRowMax = display._options.height - 1;
    var dispColMax = display._options.width - 2;
    var dispRow = 0;
    var freshMsgIdx = 0;
    var staleMsgIdx = 0;
    // fresh messages in white
    for (freshMsgIdx = 0; freshMsgIdx < this.attr.freshMessagesReverseQueue.length && dispRow < dispRowMax; freshMsgIdx++) {
      dispRow += display.drawText(1,dispRow,'%c{#fff}%b{#000}'+this.attr.freshMessagesReverseQueue[freshMsgIdx]+'%c{}%b{}',79);
    }
    // stale messages in grey
    for (staleMsgIdx = 0; staleMsgIdx < this.attr.staleMessagesQueue.length && dispRow < dispRowMax; staleMsgIdx++) {
      dispRow += display.drawText(1,dispRow,'%c{#aaa}%b{#000}'+this.attr.staleMessagesQueue[staleMsgIdx]+'%c{}%b{}',79);
    }
  },
  ageMessages:function (lastStaleMessageIdx) {
    // console.log('age messages');
    // always archive the oldest stale message
    if (this.attr.staleMessagesQueue.length > 0) {
      this.attr.archivedMessagesQueue.unshift(this.attr.staleMessagesQueue.pop());
    }
    // archive any additional stale messages that didn't get shown
    while (this.attr.staleMessagesQueue.length > lastStaleMessageIdx) {
      this.attr.archivedMessagesQueue.unshift(this.attr.staleMessagesQueue.pop());
    }
    // just dump messages that are too old for the archive
    while (this.attr.staleMessagesQueue.length > this.attr.archiveMessageLimit) {
      this.attr.archivedMessagesQueue.pop();
    }
    // move fresh messages to stale messages
    while (this.attr.freshMessagesReverseQueue.length > 0) {
      this.attr.staleMessagesQueue.unshift(this.attr.freshMessagesReverseQueue.shift());
    }
  },
  send: function (msg) {
    // console.log('send message '+msg);
    this.attr.freshMessagesReverseQueue.push(msg); // new messages get added to the end of the fresh message queue so that sequential things are in the right order (e.g. you hit the goblin, you kill the goblin)
  },
  clear: function () {
    this.attr.freshMessagesReverseQueue = [];
    this.attr.staleMessagesQueue = [];
  },
  getArchives: function () {
    return this.attr.archivedMessagesQueue;
  },
  getArchiveMessageLimit: function () {
    return this.attr.archiveMessageLimit;
  },
  setArchiveMessageLimit: function (n) {
    this.attr.archiveMessageLimit = n;
  }
};
