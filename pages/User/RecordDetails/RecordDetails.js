// pages/User/RecordDetails/RecordDetails.js
const host = getApp().globalData.host;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sessionId: 0,
    userId: 0,
    advice: '',
    currentConsultant:{
      realName:'',
      avatarUrl:''
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const sessionId = options.sessionId; // 获取传递的 sessionId
    const realName = options.realName;
    this.setData({
      sessionId: sessionId,
      userId: wx.getStorageSync('userInfo').userId,
      currentConsultant:{
        realName: realName,
        avatarUrl: 'https://cdn.jsdelivr.net/gh/Dagaz84521/DagazBlogPicture@main/img/counselor.jpg'
      }
    })
    this.loadHistoryMessages();
  },

  formatTime(date) {
    const d = date instanceof Date ? date : new Date(date);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  },

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
        if (res.data.code === 1) {
          if(res.data.data === null)
            return;
            console.log(res.data.data);
            const advice = res.data.data.advice === null ? '咨询师未给出建议' : res.data.data.advice;
            if(res.data.data.records === null){
              this.setData({
                advice: advice
              });
              wx.showToast({ title: '无历史记录', icon: 'none' });
            }
            const historyMessages = res.data.data.records.map(msg => ({
            id: sessionId,
            content: msg.content,
            senderId: msg.senderId,
            isUser: msg.senderId === this.data.userId, // 根据senderId判断是否用户消息
            time: this.formatTime(new Date(msg.createdAt)),
          }));
          
          // 按时间排序（假设后端返回的是倒序）
          const sortedMessages = historyMessages.reverse();
          console.log(sortedMessages);
          this.setData({
            advice: advice,
            messages: sortedMessages
          });
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

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})