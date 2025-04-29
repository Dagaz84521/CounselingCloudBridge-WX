const app = getApp();
import md5 from '../../../utils/md5'
Page({
  data: {
    phoneNumber: '', // 手机号
    password: '',    // 密码
    isLoading: false // 加载状态
  },

  // 手机号输入处理
  handlePhoneInput: function(e) {
    this.setData({
      phoneNumber: e.detail.value
    });
  },

  // 密码输入处理
  handlePasswordInput: function(e) {
    this.setData({
      password: e.detail.value
    });
  },

  // 登录按钮点击事件
  handleLogin: function() {
    const { phoneNumber, password } = this.data;
    
    // 验证手机号格式
    if (!phoneNumber || !/^1[3-9]\d{9}$/.test(phoneNumber)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return;
    }
    
    // 验证密码
    if (!password || password.length < 6) {
      wx.showToast({
        title: '密码不能少于6位',
        icon: 'none'
      });
      return;
    }
    
    // 开始登录
    this.login();
  },

  // 登录方法
  login: function() {
    if (this.data.isLoading) return;
    
    this.setData({ isLoading: true });
    wx.showLoading({ title: '登录中...' });
    
    // 调用登录接口（不使用加密）
    wx.request({
      url: app.globalData.host + '/api/user/login',
      method: 'POST',
      data: {
        phoneNumber: this.data.phoneNumber,
        passwordHash: md5.hex(this.data.password)
      },
      header: {
        'content-type': 'application/json'
      },
      success: async (res) => {
        wx.hideLoading();
        this.setData({ isLoading: false });
        wx.setStorageSync('phoneNumber', this.data.phoneNumber);
        if (res.statusCode === 200) {
          if (res.data.code === 1) {
            // 登录成功
            const { userId, userType, token } = res.data.data;
            
            // 存储用户信息和token到全局和本地
            app.globalData.userInfo = {
              userId,
              userType,
              token
            };

            app.globalData.isLoggedIn = true;

            try {
              wx.setStorageSync('userInfo', app.globalData.userInfo);
              wx.setStorageSync('token', token);
              wx.setStorageSync('isLoggedIn', true);
            } catch (e) {
              console.error('存储用户信息失败', e);
            }
            
            await this.getUserInfo(token)

            // 登录成功提示
            wx.showToast({
              title: '登录成功',
              icon: 'success',
              duration: 1500,
              complete: () => {
                // 返回上一页或跳转到首页
                setTimeout(() => {
                  wx.switchTab({
                    url: '/pages/Default/Index/Default_Index'
                  });
                }, 1500);
              }
            });
          } else {
            // 登录失败
            wx.showToast({
              title: res.data.msg || '登录失败',
              icon: 'none'
            });
          }
        } else {
          // 请求失败
          wx.showToast({
            title: `请求失败: ${res.statusCode}`,
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        this.setData({ isLoading: false });
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
        console.error('登录请求失败', err);
      }
    });
  },

  getUserInfo: function(token) {
    return new Promise((resolve) => {
      wx.request({
        url: app.globalData.host + '/api/user/info',
        method: 'GET',
        header: { 
          'token' : getApp().globalData.userInfo.token,
          'content-type': 'application/json'
        },
        success: (res) => {
          if (res.statusCode === 200 && res.data.code === 1) {
            const app = getApp()
            // 合并用户信息
            app.globalData.userInfo = { 
              ...app.globalData.userInfo,
              ...res.data.data
            }
            wx.setStorageSync('userInfo', app.globalData.userInfo)
          }
          resolve()
        },
        fail: () => resolve()
      })
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