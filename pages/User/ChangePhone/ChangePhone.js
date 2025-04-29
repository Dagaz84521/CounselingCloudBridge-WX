// pages/User/ChangePhone/ChangePhone.js
const host = getApp().globalData.host;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentPhone: '12345678910', // 当前手机号（从接口获取）
    newPhone: '', // 新手机号
    verificationCode: '', // 验证码
    isCodeButtonDisabled: false, // 验证码按钮是否禁用
    codeButtonText: '获取验证码', // 验证码按钮文字
    countdown: 60 // 倒计时
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getCurrentPhone();
  },

  // 获取当前手机号
  getCurrentPhone: function() {
    const phoneNumber = wx.getStorageSync('phoneNumber');
    this.setData({
      currentPhone: phoneNumber,
    })
  },

  // 监听手机号输入
  onPhoneInput: function(e) {
    this.setData({
      newPhone: e.detail.value
    });
  },

  // 监听验证码输入
  onCodeInput: function(e) {
    this.setData({
      verificationCode: e.detail.value
    });
  },

  // 获取验证码
  getVerificationCode: function() {
    const { newPhone } = this.data;

    if (!newPhone || !/^1[3456789]\d{9}$/.test(newPhone)) {
      wx.showToast({
        title: '请输入有效的手机号',
        icon: 'none'
      });
      return;
    }

    // 调用接口发送验证码
    wx.request({
      url: '', // 替换为你的接口地址
      method: 'POST',
      data: {
        phone: newPhone
      },
      success: (res) => {
        if (res.statusCode === 200) {
          wx.showToast({
            title: '验证码已发送',
            icon: 'success'
          });

          // 开始倒计时
          this.startCountdown();
        } else {
          wx.showToast({
            title: '发送验证码失败',
            icon: 'none'
          });
        }
      }
    });
  },

  // 开始倒计时
  startCountdown: function() {
    let countdown = 60;
    this.setData({
      isCodeButtonDisabled: true,
      codeButtonText: `${countdown}秒后重试`
    });

    const timer = setInterval(() => {
      countdown--;
      if (countdown <= 0) {
        clearInterval(timer);
        this.setData({
          isCodeButtonDisabled: false,
          codeButtonText: '获取验证码'
        });
      } else {
        this.setData({
          codeButtonText: `${countdown}秒后重试`
        });
      }
    }, 1000);
  },

  // 提交修改
  submitChange: function() {
    const { newPhone, verificationCode } = this.data;

    if (!newPhone || !/^1[3456789]\d{9}$/.test(newPhone)) {
      wx.showToast({
        title: '请输入有效的手机号',
        icon: 'none'
      });
      return;
    }

    if (!verificationCode) {
      wx.showToast({
        title: '请输入验证码',
        icon: 'none'
      });
      return;
    }

    // 调用接口验证并修改手机号
    wx.request({
      url: host + '/api/user/phoneNumber', // 替换为你的接口地址
      method: 'PUT',
      header:{
        token: wx.getStorageSync('token')
      },
      data: {
        phoneNumber: newPhone,
        code: verificationCode
      },
      success: (res) => {
        if (res.statusCode === 200) {
          wx.showToast({
            title: '手机号修改成功',
            icon: 'success'
          });
          wx.setStorageSync('phoneNumber', newPhone);
          // 返回上一页
          wx.switchTab({
            url: '/pages/User/Index/User_Index',
          })
        } else {
          wx.showToast({
            title: '修改失败，请检查验证码',
            icon: 'none'
          });
        }
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