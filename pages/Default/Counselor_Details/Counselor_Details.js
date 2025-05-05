// pages/Default/Counselor_Details/Counselor_Details.js
const app = getApp();
const host = app.globalData.host;
Page({
  data: {
    showAgreement: false,  // 控制弹窗显示
    hasAgreed: false,      // 是否同意协议
    counselor: {
    },
    totalSessions: 0,
    bio: '',
  },

  onLoad: function(options) {
    // 这里可以通过options.id获取咨询师ID，然后从服务器获取数据
  },

  loadConsultantData: function(id) {
    // 实际项目中这里应该是从服务器获取数据
    const token = wx.getStorageSync('token');
    wx.request({
      url: app.globalData.host + '/api/client/counselor/' + id,
      method: 'GET',
      header: {
        'token': token,
        'content-type': 'application/json'
      },
      success: (res) => {
        console.log(res.data);
        this.setData({
          totalSessions: res.data.data.totalSessions,
          bio: res.data.data.bio
        });
        console.log(this.data.totalSessions);
        console.log(this.data.bio);
      }
    });
  },

  startConsultation: function() {
    this.setData({
      showAgreement: true,
      hasAgreed: false
    });
  },
   // 关闭弹窗
   closeAgreement: function() {
    this.setData({ showAgreement: false });
  },

  // 切换同意状态
  toggleAgreement: function() {
    this.setData({ hasAgreed: !this.data.hasAgreed });
  },

  // 确认继续咨询
  handleConfirm: async function() {
    if (!this.data.hasAgreed) return;
  
    const token = wx.getStorageSync('token'); // 提前获取 token
    const userInfo = wx.getStorageSync('userInfo');
  
    // 先检查是否存在会话
    const checkSession = () => new Promise((resolve, reject) => {
      wx.request({
        url: app.globalData.host + '/api/client/session',
        method: 'GET',
        header: { 'token': token },
        success: (res) => {
          if (res.data.code === 1) {
            resolve(res.data.data); // 返回会话数据
          } else {
            reject(res.data.msg);
          }
        },
        fail: (err) => reject('网络异常，请重试')
      });
    });
  
    try {
      // 等待检查结果
      const existingSession = await checkSession();
      
      if (existingSession) {
        wx.showToast({
          title: '当前已存在咨询，请先结束当前会话',
          icon: 'none',
          duration: 3000
        });
        return; // 存在会话则终止流程
      }
  
      // 不存在会话时继续创建
      const counselorId = this.data.counselor.counselorId;
      const clientId = userInfo.userId;
      
      const createSession = () => new Promise((resolve, reject) => {
        wx.request({
          url: host + '/api/client/session/add',
          method: 'POST',
          header: {
            'token': token,
            'content-type': 'application/x-www-form-urlencoded'
          },
          data: `clientId=${clientId}&counselorId=${counselorId}`,
          success: (res) => {
            if (res.data.code === 1) {
              resolve(res.data.data); // 返回 sessionId
            } else {
              reject(res.data.msg);
            }
          },
          fail: (err) => reject('创建会话失败')
        });
      });
  
      const sessionId = await createSession();
      
      // 存储并跳转
      wx.setStorageSync('currentSessionId', sessionId);
      wx.setStorageSync('currentCounselorId', counselorId);
      wx.switchTab({
        url: `/pages/Counseling/Index/Counseling_Index?sessionId=${sessionId}&counselorId=${counselorId}`
      });
  
    } catch (error) {
      wx.showToast({
        title: typeof error === 'string' ? error : '操作失败',
        icon: 'none',
        duration: 3000
      });
    } finally {
      this.setData({ showAgreement: false });
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.loadConsultantData(options.id);
    const counselorId = options.id;
    console.log(counselorId);
    // 从缓存读取
    const cachedData = wx.getStorageSync(`counselor_${counselorId}`);
    console.log(cachedData);
    if (cachedData) {
      this.setData({ counselor: cachedData });
      console.log(this.data.counselor);
    } else {
      // 缓存不存在时调用 API 获取
      this.fetchCounselorDetail(counselorId);
    }
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