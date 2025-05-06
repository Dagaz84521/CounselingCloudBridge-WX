// pages/User/Register/Register.js
const app = getApp();
import md5 from '../../../utils/md5'
Page({
  data: {
    formData: {
      phone: '',         // 手机号
      code: '',          // 验证码
      realName: '',      // 真实姓名
      age: '',           // 年龄
      gender: '',        // 性别
      profession: '',    // 职业
      password: '',      // 密码
      confirmPassword: '', // 新增字段
      avatar_url:'https://cdn.jsdelivr.net/gh/Dagaz84521/DagazBlogPicture@main/img/user.jpg'
    },
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

  // 性别选择器变化时更新数据
  onGenderChange(e) {
    const genderIndex = e.detail.value;     // 获取选中的索引
    const gender = ['male', 'female'][genderIndex]; // 根据索引获取性别
    this.setData({
      'formData.gender': gender,           // 更新性别字段
    });
  },

  // 切换密码可见性
  togglePassword() {
    this.setData({
      showPassword: !this.data.showPassword
    });
  },

  // 切换确认密码可见性
  toggleConfirmPassword() {
    this.setData({
      showConfirmPassword: !this.data.showConfirmPassword
    });
  },

  // 获取验证码
  getVerificationCode() {
    if (!this.data.canGetCode || this.data.isCountingDown) return;
    wx.showToast({
      title: '验证码是123456',
      icon: 'success'
    });
    this.startCountdown();
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
    const { phone, code, realName, age, gender, profession, password, confirmPassword, avatar_url } = this.data.formData;
    
    // 表单验证
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return;
    }

    if (!realName.trim()) {
      wx.showToast({ title: '请输入真实姓名', icon: 'none' });
      return;
    }

    if (!age || age < 1 || age > 120) {
      wx.showToast({ title: '请输入有效的年龄', icon: 'none' });
      return;
    }

    if (!gender) {
      wx.showToast({ title: '请选择性别', icon: 'none' });
      return;
    }

    if (!profession.trim()) {
      wx.showToast({ title: '请输入职业', icon: 'none' });
      return;
    }

    if (password.length < 6) {
      wx.showToast({
        title: '密码长度不能少于6位',
        icon: 'none'
      });
      return;
    }
    
    if (password !== confirmPassword) {
      wx.showToast({
        title: '两次输入的密码不一致',
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
    
    this.setData({ isSubmitting: true });
    
    console.log(avatar_url)

    // 调用注册API
    wx.request({
      url: app.globalData.host + '/api/user/register',
      method: 'POST',
      data: {
        phoneNumber : phone,
        code : code,
        passwordHash : md5.hex(password),
        realName : realName,
        gender : gender,
        age : age,
        occupation : profession,
        avatarUrl : avatar_url
      },
      success: (res) => {
        if (res.data.code === 1) {
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