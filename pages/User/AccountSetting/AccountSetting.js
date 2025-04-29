// pages/User/AccountSetting/AccountSetting.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone: '12345678910',
    password: '******'
  },

  // 跳转到修改个人信息页面
  navigateToPersonalInfo: function() {
    wx.navigateTo({
      url: '/pages/User/Information/Information'
    });
  },

  // 跳转到修改手机号页面
  navigateToChangePhone: function() {
    wx.navigateTo({
      url: '/pages/User/ChangePhone/ChangePhone'
    });
  },

  // 跳转到修改密码页面
  navigateToChangePassword: function() {
    wx.navigateTo({
      url: '/pages/User/ChangePassword/ChangePassword'
    });
  },

 // 退出登录
  handleLogout: function () {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success(res) {
        if (res.confirm) {
          wx.setStorageSync('userInfo', null)
          wx.setStorageSync('isLoggedIn', false)
          wx.setStorageSync('token', '')
          wx.setStorageSync('phoneNumber', '')
          // 执行退出登录逻辑
          wx.switchTab({
            url: '/pages/Default/Index/Default_Index',
          });
        }
      }
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const phoneNumber = wx.getStorageSync('phoneNumber');
    this.setData({
      phone: phoneNumber,
    })
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