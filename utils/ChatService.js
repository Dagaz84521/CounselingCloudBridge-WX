class SessionEmitter {
  constructor(userId) {
    this.userId = userId;
    this._events = new Map(); // 存储事件回调 { eventName: [callback1, callback2] }
  }

  // 订阅事件
  subscribe(event, callback) {
    if (!this._events.has(event)) {
      this._events.set(event, []);
    }
    this._events.get(event).push(callback);
  }

  // 触发事件
  emit(event, ...args) {
    if (this._events.has(event)) {
      this._events.get(event).forEach(callback => {
        try {
          callback(...args);
        } catch (err) {
          console.error(`Event ${event} handler error:`, err);
        }
      });
    }
  }

  // 取消订阅
  unsubscribe(event, callback) {
    if (this._events.has(event)) {
      const callbacks = this._events.get(event).filter(cb => cb !== callback);
      this._events.set(event, callbacks);
    }
  }
}

class ChatService {
  constructor(userId) {
    this.userId = userId;
    this._emitter = new SessionEmitter(userId);
    this._reconnectAttempts = 0; // 记录重连次数
    this._maxReconnectAttempts = 5; // 最大重连次数
    this._reconnectTimer = null; // 重连计时器
    this._isManualClose = false; // 标记是否为主动关闭
    this._setupConnection();
  }
  
  // 新增订阅方法
  subscribe(event, callback) {
    this._emitter.subscribe(event, callback);
  }

  // 新增取消订阅方法（可选）
  unsubscribe(event, callback) {
    this._emitter.unsubscribe(event, callback);
  }

  _setupConnection() {
    // 1. 创建 WebSocket 连接
    this._socketTask = wx.connectSocket({
      url: `ws://localhost:8080/chat/${this.userId}`,
      success: () => {
        console.log("Socket 连接创建成功");
        this._bindEvents();
      },
      fail: (err) => {
        console.error("连接失败:", err);
        this._emitter.emit('error', err);
        this._scheduleReconnect(); // 初始连接失败也触发重连
      }
    });
    this._socketTask
  }

  _bindEvents() {
    // 2. 监听连接打开
    wx.onSocketOpen(() => {
      console.log("WebSocket 连接已打开");
      this._reconnectAttempts = 0;
      this._emitter.emit('connected');
    });

    // 3. 监听消息
    wx.onSocketMessage((res) => {
      try {
        const data = JSON.parse(res.data);
        this._emitter.emit('message', data);
      } catch (err) {
        this._emitter.emit('error', err);
      }
    });

    // 4. 监听错误
    wx.onSocketError((err) => {
      console.error("Socket 错误:", err);
      this._emitter.emit('error', err);
    });

    // 5. 监听关闭
    wx.onSocketClose(() => {
      console.log("WebSocket 连接已关闭");
      this._emitter.emit('disconnected');

      // 非主动关闭时触发重连
      if (!this._isManualClose) this._scheduleReconnect();
    });
  }

  _scheduleReconnect() {
    if (this._reconnectAttempts >= this._maxReconnectAttempts) {
      console.error("已达最大重连次数，放弃连接");
      return;
    }

    const delay = Math.pow(2, this._reconnectAttempts) * 1000;
    this._reconnectTimer = setTimeout(() => {
      console.log(`尝试第 ${this._reconnectAttempts + 1} 次重连...`);
      this._setupConnection();
      this._reconnectAttempts++;
    }, delay);
  }

  formatDate(date, format = 'yyyy-MM-dd HH:mm:ss') {
    const config = {
      yyyy: date.getFullYear(),
      MM: (date.getMonth() + 1).toString().padStart(2, '0'),
      dd: date.getDate().toString().padStart(2, '0'),
      HH: date.getHours().toString().padStart(2, '0'),
      mm: date.getMinutes().toString().padStart(2, '0'),
      ss: date.getSeconds().toString().padStart(2, '0'),
    }
  
    return format.replace(/(yyyy|MM|dd|HH|mm|ss)/g, match => config[match])
  }

  send(sessionId, receiverId, content, type) {
    const now = new Date();
    const payload = {
      roomId: sessionId,
      senderId: this.userId,
      receiverId,
      content,
      type,
    };

    wx.sendSocketMessage({
      data: JSON.stringify(payload),
      success: () => {
        console.log("消息已发送");
      },
      fail: (err) => {
        this._emitter.emit('error', err);
      }
    });
  }

  destroy() {
    this._isManualClose = true;
    if (this._reconnectTimer) clearTimeout(this._reconnectTimer);
    wx.closeSocket();
  }
}

module.exports = ChatService;
  
  // // 传入当前userId
  // sessionManager = new ChatService (senderId);
  // //注册接收消息时候的处理事件
  // sessionManager.subscribe('message', (msg) => {
  //   console.log(msg.sessionId);
  //   console.log(msg.senderId);
  //   console.log(msg.content);
  //   console.log(msg.createdAt);
  // })
  // //发送消息
  // sessionManager.send(sessionId,receiverId,content);