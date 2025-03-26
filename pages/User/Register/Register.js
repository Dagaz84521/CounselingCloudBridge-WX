// pages/User/Register/Register.js
Page({
  data: {
    formData: {
      phone: '',
      code: '',
      password: ''
    },
    showPassword: false,
    isCountingDown: false,
    countdown: 0,
    canGetCode: false,
    isSubmitting: false
  },

  // 输入框变化处理
  onInputChange(e) {
    const { name } = e.currentTarget.dataset;
    this.setData({
      [`formData.${name}`]: e.detail.value
    });
    
    // 检查是否可以获取验证码（手机号验证）
    if (name === 'phone') {
      this.setData({
        canGetCode: /^1[3-9]\d{9}$/.test(e.detail.value)
      });
    }
  },

  // 切换密码可见性
  togglePassword() {
    this.setData({
      showPassword: !this.data.showPassword
    });
  },

  // 获取验证码
  getVerificationCode() {
    if (!this.data.canGetCode || this.data.isCountingDown) return;
    
    // 调用获取验证码API
    wx.request({
      url: 'https://your-api-domain.com/auth/send-code',
      method: 'POST',
      data: {
        phone: this.data.formData.phone,
        type: 'register' // 验证码类型，根据业务需求调整
      },
      success: (res) => {
        if (res.data.code === 0) {
          wx.showToast({
            title: '验证码已发送',
            icon: 'success'
          });
          this.startCountdown();
        } else {
          wx.showToast({
            title: res.data.message || '验证码发送失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      }
    });
  },

  // 开始倒计时
  startCountdown() {
    this.setData({
      isCountingDown: true,
      countdown: 60
    });
    
    const timer = setInterval(() => {
      if (this.data.countdown <= 1) {
        clearInterval(timer);
        this.setData({
          isCountingDown: false,
          countdown: 0
        });
      } else {
        this.setData({
          countdown: this.data.countdown - 1
        });
      }
    }, 1000);
  },

  // 表单提交
  onSubmit(e) {
    const { phone, code, password } = this.data.formData;
    
    // 表单验证
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return;
    }
    
    if (!/^\d{6}$/.test(code)) {
      wx.showToast({
        title: '请输入6位验证码',
        icon: 'none'
      });
      return;
    }
    
    if (password.length < 6) {
      wx.showToast({
        title: '密码长度不能少于6位',
        icon: 'none'
      });
      return;
    }
    
    this.setData({ isSubmitting: true });
    
    // 调用注册API
    wx.request({
      url: 'https://your-api-domain.com/auth/register',
      method: 'POST',
      data: {
        phone,
        code,
        password
      },
      success: (res) => {
        if (res.data.code === 0) {
          wx.showToast({
            title: '注册成功',
            icon: 'success'
          });
          // 注册成功后跳转到登录页或其他页面
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
        } else {
          wx.showToast({
            title: res.data.message || '注册失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      },
      complete: () => {
        this.setData({ isSubmitting: false });
      }
    });
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