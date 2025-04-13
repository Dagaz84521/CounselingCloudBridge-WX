export class ChatService {
  constructor(userId) {
    this.userId = userId; // 新增用户标识
    this._connection = null; // 主连接实例
    this._emitter = new SessionEmitter(userId);
    this._pendingQueue = []; // 全局待处理队列
    this._setupConnection();
  }

  // 初始化WebSocket连接
  _setupConnection() {
    console.log("connecting....");
    this._connection = new WebSocket(`ws://localhost:8090/chat/${this.userId}`);
    console.log("connected....");
    this._connection.onopen = () => {
      this._emitter.emit('connected');
      this._flushPendingQueue();
    };

    this._connection.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this._emitter.emit('message', {
        roomId: data.roomId,
        type : data.type,
        senderId: data.senderId,
        content: data.content,
        createdAt: data.createdAt,
      });
    };

    this._connection.onclose = () => {
      this._emitter.emit('disconnected');
    };

    this._connection.onerror = (error) => {
      this._emitter.emit('error', error);
    };
  }

  // 订阅事件
  subscribe(eventType, handler) {
    if (this.isConnected) {
      this._emitter.on(eventType, handler);
    } else {
      this._pendingQueue.push({ type: 'subscribe', data: { eventType, handler } });
    }
    return this;
  }

  // 发送消息
  send(roomId, receiverId, content, type) {
    const payload = {
      roomId : roomId,
      senderId : this.userId,
      receiverId : receiverId,
      content : content,
      type: type
    };

    if (this.isConnected) {
      this._connection.send(JSON.stringify(payload));
    } else {
      this._pendingQueue.push({ type: 'send', data: payload });
    }
    return this;
  }

  // 关闭连接
  destroy() {
    if (this._connection) {
      this._connection.close();
      this._emitter.destroy();
      this._pendingQueue = [];
    }
  }

  // 处理等待队列
  _flushPendingQueue() {
    this._pendingQueue.forEach(item => {
      if (item.type === 'send') {
        this._connection.send(JSON.stringify(item.data));
      } else {
        this._emitter.on(item.data.eventType, item.data.handler);
      }
    });
    this._pendingQueue = [];
  }

  // 连接状态
  get isConnected() {
    return this._connection?.readyState === WebSocket.OPEN;
  }
}

class SessionEmitter {
  constructor(userId) {
    this.userId = userId;
    this.handlers = new Map();
  }

  on(eventType, handler) {
    const handlers = this.handlers.get(eventType) || new Set();
    handlers.add(handler);
    this.handlers.set(eventType, handlers);
  }

  emit(eventType, data) {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      handlers.forEach(handler => handler({ ...data, userId: this.userId }));
    }
  }

  destroy() {
    this.handlers.clear();
  }
}

// // 传入当前userId
// chatService = new ChatService (senderId);
// //注册接收消息时候的处理事件
// chatService.subscribe('message', (msg) => {
//   console.log(msg.roomId);       //这里roomId等于sessionId或者requestId
//   console.log(msg.type);         //这里type等于request或者session
//   console.log(msg.senderId);
//   console.log(msg.content);
//   console.log(msg.createdAt);
// })
// //发送消息
// chatService.send(roomId,receiverId,content, type);
module.exports = {
  ChatService
}
