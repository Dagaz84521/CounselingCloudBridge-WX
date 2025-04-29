// pages/User/ChangePhone/ChangePassword.js
const host = getApp().globalData.host;
import md5 from '../../../utils/md5'
Page({
  data: {
    phoneNumber: '138****1234', // 从缓存或全局状态获取真实号码
    smsCode: '',
    newPassword: '',
    confirmPassword: '',
    countdown: 0
  },

  onLoad() {
    // 获取真实手机号，示例：
    const phone = wx.getStorageSync('phoneNumber');
    this.setData({ phoneNumber: phone })
  },

  onInputChange(e) {
    const { name } = e.currentTarget.dataset
    this.setData({ [name]: e.detail.value })
  },

  // 发送验证码
  sendSmsCode() {
    if (this.data.countdown > 0) return

    wx.showToast({
      title: '已发送验证码',
    })
    this.startCountdown();
  },

  // 倒计时逻辑
  startCountdown() {
    this.setData({ countdown: 60 })
    const timer = setInterval(() => {
      if (this.data.countdown <= 0) {
        clearInterval(timer)
        return
      }
      this.setData({ countdown: this.data.countdown - 1 })
    }, 1000)
  },

  handleSmsCodeInput(e) {
    let value = e.detail.value
    
    // 高级过滤（处理中文输入法等特殊情况）
    value = value.replace(/[^0-9]/g, '')
                .replace(/(\..*)\./g, '$1')
                .slice(0,6)
    
    // 即时校验提示
    if (value.length === 6) {
      this.setData({ codeError: false })
    } else if (value.length > 0) {
      this.setData({ codeError: '验证码必须为6位数字' })
    } else {
      this.setData({ codeError: false })
    }
    
    this.setData({ smsCode: value })
    return value  // 必须返回处理后的值
  },

  // 提交表单
  onSubmit(e) {
    const { smsCode, newPassword, confirmPassword } = this.data
    if(smsCode == '')
      return wx.showToast({ title: '验证码为空', icon: 'none' })
    if(newPassword == '')
      return wx.showToast({ title: '未输入密码', icon: 'none' })
    if (newPassword !== confirmPassword) {
      return wx.showToast({ title: '两次密码不一致', icon: 'none' })
    }
  
    // 调用修改密码接口
    wx.request({
      url: host + '/api/user/password',
      method: 'PUT',
      header:{
        token: wx.getStorageSync('token')
      },
      data: {
        phoneNumber: this.data.phoneNumber,
        code : smsCode,
        passwordHash: md5.hex(newPassword)
      },
      success: (res) => {
        wx.showToast({
          title: '修改密码成功'
        })
        // 处理成功逻辑
        wx.setStorageSync('userInfo', null)
        wx.setStorageSync('isLoggedIn', false)
        wx.setStorageSync('token', '')
        wx.setStorageSync('phoneNumber', '')
        wx.switchTab({
          url: '/pages/User/Index/User_Index',
        })
      }
    })
  }
})
