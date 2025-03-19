Page({
  data: {
    isLoggedIn: false,        // 控制登录状态
    tempUserInfo: {},         // 临时存储用户信息
    formData: {               // 新增表单数据绑定
      phone: '',
      password: ''
    }
  },

  // 手机号输入处理
  handlePhoneInput(e) {
    this.setData({
      'formData.phone': e.detail.value
    })
  },

  // 密码输入处理
  handlePasswordInput(e) {
    this.setData({
      'formData.password': e.detail.value
    })
  },

  // 微信登录
  getUserProfile() {
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: res => {
        this.setData({
          tempUserInfo: res.userInfo,
          isLoggedIn: true
        })
        // 存储用户信息
        wx.setStorageSync('userInfo', res.userInfo)
        // 1.5秒后自动返回
        setTimeout(() => wx.navigateBack(), 1500)
      }
    })
  },

  // 手机号登录（原有逻辑）
  mockLogin() {
    if (this.data.formData.phone && this.data.formData.password) {
      wx.showToast({
        title: '登录成功',
        icon: 'success'
      })
      // 这里可以添加真实的登录逻辑
      setTimeout(() => wx.navigateBack(), 1000)
    }
  },

  // 退出登录
  handleLogout() {
    wx.removeStorageSync('userInfo')
    this.setData({ 
      isLoggedIn: false,
      tempUserInfo: {}
    })
  },

  handleRegister(){
    wx.navigateTo({
      url: '/pages/User/Register/Register'
    })
  },

  handleForgetPassword(){
    wx.navigateTo({
      url: '/pages/User/ResetPassword/ResetPassword'
    })
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

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