const app = getApp();
const host = app.globalData.host;
const ChatService = require("../../../utils/ChatService");
Page({
  data: {
    currentConsultant: null,
    counselorId: 0,
    messages: [],
    inputValue: '',
    scrollTop: 0,
    showConfirmDialog: false,
    rating: 0,
    connected: false,
    sessionId: null,
    userId: null,
    chatService: null,
    canSend: false
  },

  onLoad(options) {
    
  },

  async onShow() {
    console.log('onShow');
    const userInfo = wx.getStorageSync('userInfo');
    if(!userInfo){
      console.log('用户未登录')
      unLogin();
      return;
    };
    this.setData(
      {
        userId : wx.getStorageSync('userInfo').userId
      }
    )
    this.initChatService(userInfo.userId);
    await this.loadConsultantInfo();
    if(this.data.sessionId) { // 获取到sessionId后加载历史记录
      this.loadHistoryMessages();
    }
    console.log('endOnShow');
  },

    // 加载历史消息
  loadHistoryMessages() {
    console.log('loadHistory');
    const token = wx.getStorageSync('token');
    const { sessionId } = this.data;
    
    wx.request({
      url: host + '/api/client/session/history',
      method: 'GET',
      header: {
        'token': token,
        'content-type': 'application/json'
      },
      data: {
        sessionId: sessionId
      },
      success: (res) => {
        if (res.data.code === 1 && res.data.data) {
          const data = res.data.data || [];
          const historyMessages = data.map(msg => ({
            id: sessionId,
            content: msg.content,
            senderId: msg.senderId,
            isUser: msg.senderId === this.data.userId,
            time: this.formatTime(new Date(msg.createdAt))
          }));
          
          // 按时间排序（假设后端返回的是倒序）
          const sortedMessages = historyMessages.reverse();
          console.log(sortedMessages);
          this.setData({
            messages: sortedMessages
          });
          this.scrollToBottom();
        } else {
          wx.showToast({ title: res.data.msg || '获取历史记录失败', icon: 'none' });
        }
      },
      fail: (err) => {
        console.error('获取历史记录失败:', err);
        wx.showToast({ title: '网络异常，请重试', icon: 'none' });
      }
    });
  },


  onHide(){
    console.log('onHide');
    console.log(this.chatService);
  },

  initChatService(userId){
    if(this.ChatService)
      return;
    // 初始化ChatService
    this.chatService = new ChatService(userId);
    console.log(this.chatService);
    this.chatService.subscribe('message', (msg) => {
      this.handleIncomingMessage(msg);
    });
    this.chatService.subscribe('connected', this.handleConnectionSuccess.bind(this));
    this.chatService.subscribe('disconnected', this.handleDisconnect.bind(this));
    this.chatService.subscribe('error', this.handleError.bind(this));
  },
  
  // 加载咨询师信息
  loadConsultantInfo() {
    const token = wx.getStorageSync('token');
    // 从后端获取
    wx.request({
      url: app.globalData.host + '/api/client/session',
      method: 'GET',
      header: {
        'token': token,
        'content-type': 'application/json'
      },
      success: (res) => {
        if (res.data.code === 1) {
          if(res.data.data){
            console.log(res.data);
            this.setData({
              currentConsultant: {
                counselorId: res.data.data.counselorId,
                realName: res.data.data.realName,
                avatarUrl: res.data.data.avatarUrl,
              },
              counselorId: res.data.data.counselorId,
              sessionId: res.data.data.sessionId
            });
          }else{
            console.log("不存在会话")
            this.setData({
              currentConsultant: null,
              sessionId: null
            });
          }
        } else {
          wx.showToast({ title: res.data.msg, icon: 'none' });
        }
      },
      fail: (err) => {
        wx.showToast({ title: '网络异常，请重试', icon: 'none' });
      }
    });
  },

  // 处理收到的消息
  handleIncomingMessage(msg) {
    //  严格检查字段存在性
  if (!msg.sessionId || !msg.senderId || !msg.content) return;

  //  过滤其他会话消息（接口文档要求 sessionId 匹配）
  if (msg.sessionId !== this.data.sessionId) return;
  console.log(msg);
  //  处理时间戳格式容错
  let displayTime;
  try {
    displayTime = this.formatTime(new Date(msg.createdAt));
  } catch (e) {
    displayTime = this.formatTime(new Date());
  }

  const newMessage = {
    id: msg.id || Date.now().toString(), //  保证 ID 为字符串
    content: msg.content,
    isUser: msg.senderId === this.data.userId,
    time: displayTime
  };

  //  使用 concat 避免直接修改原数组
  this.setData({
    messages: this.data.messages.concat(newMessage)
  });
    this.scrollToBottom();
  },

  // 发送消息
  sendMessage() {
    console.log('sendMessage');
    const { inputValue, sessionId, counselorId} = this.data;
    const chatService = this.chatService;
    if (!inputValue.trim() || !chatService || !sessionId || !counselorId) {
      console.log("error,!inputValue:" + !inputValue.trim() + " !chatService:" + !chatService+ " sessionId:" + sessionId + ' counselorId:' + counselorId);
      return;
    }
    chatService.send(sessionId, counselorId, inputValue.trim(),"session");
    
    this.setData({
      inputValue: '',
      messages: [...this.data.messages, {
        id: Date.now(),
        content: inputValue.trim(),
        isUser: true,
        time: this.formatTime(new Date())
      }]
    });
    
    this.scrollToBottom();
  },

  handleConnectionSuccess() {
    console.log("连接成功");
    this.setData({ connected: true });
  },

  handleDisconnect() {
    console.log("连接断开");
    this.setData({ connected: false });
  },

  // 处理错误
  handleError(error) {
    console.error('Chat error:', error);
    wx.showToast({
      title: error.message || '聊天错误',
      icon: 'none'
    });
  },

  // 滚动到底部
  scrollToBottom() {
    this.createSelectorQuery()
      .select('#messages-container')
      .boundingClientRect(rect => {
        if (rect) {
          this.setData({ scrollTop: rect.height });
        }
      })
      .exec();
  },

  // 格式化时间
  formatTime(date) {
    const d = date instanceof Date ? date : new Date(date);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  },

  onInput(e) {
    this.setData({
      inputValue: e.detail.value
    });
  },

  onUnload() {
    // 页面卸载时取消订阅
    if (this.data.chatService) {
      this.data.chatService.destroy();
    }
    // 可选：完全关闭WebSocket连接
    // if(this.data.client) {
    //   this.data.client.disconnect();
    // }
  },

  // 点击结束按钮
  handleEndConsult() {
    this.setData({ showConfirmDialog: true });
  },

  // 评分选择
  handleRatingSelect(e) {
    const rating = e.currentTarget.dataset.rating;
    this.setData({ rating });
  },

  // 确认结束
  handleConfirmEnd() {
    if (this.data.rating === 0) {
      wx.showToast({ title: '请先进行评分', icon: 'none' });
      return;
    }
    const token = wx.getStorageSync('token');
    console.log(this.data.sessionId);

    // 新增：标记为主动关闭
  if (this.chatService) {
    this.chatService.destroy(); // 这会设置 _isManualClose = true
  }
  
    // 发送请求到后端
    console.log(this.data.sessionId);
    wx.request({
      url: host + '/api/client/session/end',
      method: 'POST',
      header:{
        'token': token,
        'content-type': 'application/x-www-form-urlencoded' 
      },
      data: `sessionId=${this.data.sessionId}&rating=${this.data.rating}`,
      success: (res) => {
        if (res.statusCode === 200 && res.data.code === 1) {
          // 清除本地会话数据
          wx.removeStorageSync('currentSessionId');
          wx.removeStorageSync('currentCounselorId');
          wx.removeStorageSync('consultData');
          wx.showToast({ title: '咨询已结束' });
          // 强制更新页面状态
          console.log('清除本地会话数据')
          this.setData({ 
            currentConsultant: null,
            messages: []
           });
          // 返回上一页或其他操作
          wx.switchTab({
            url: '/pages/Default/Index/Default_Index',
          })
        }
      },
      fail: () => {
        wx.showToast({ title: '提交失败，请重试', icon: 'none' });
      }
    });

    this.setData({ showConfirmDialog: false });
  },

  // 取消操作
  handleCancel() {
    this.setData({ 
      showConfirmDialog: false,
      rating: 0 
    });
  },

  

  // 保持其他原有方法不变...
  // ... handleEndConsult, handleRatingSelect, handleConfirmEnd, handleCancel 等方法 ...
});

function unLogin() {
  wx.showModal({
    title: '未登录',
    content: '是否前往登录',
    complete: (res) => {
      if (res.cancel) {
        wx.switchTab({
          url: '/pages/Default/Index/Default_Index.js',
        })
      }
      if (res.confirm) {
        wx.navigateTo({
          url: '/pages/User/Login/Login',
        })
      }
    }
  });
}
