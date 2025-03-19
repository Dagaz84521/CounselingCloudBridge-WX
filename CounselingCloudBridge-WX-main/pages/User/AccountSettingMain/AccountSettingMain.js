// pages/User/AccountSettingMain.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  navigateToPersonalInfo() {
    wx.navigateTo({
      url: '/pages/User/Information/Information'
    })
  },

  // 显示退出确认对话框
  showLogoutConfirm() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出当前账号吗？',
      confirmColor: '#ff4444',
      success: (res) => {
        if (res.confirm) {
          this.handleLogout()
        }
      }
    })
  },

  // 处理退出登录逻辑
  handleLogout() {
    // 清除本地存储的登录状态
    try {
      wx.removeStorageSync('token')
      wx.removeStorageSync('userInfo')
    } catch (e) {
      console.error('清除存储失败', e)
    }

    // 跳转到登录页面（根据实际路由调整）
    wx.reLaunch({
      url: '/pages/User/Login/Login'
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