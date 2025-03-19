// pages/Default/Index/Default_Index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    therapists: [{
      avatar: '/images/咨询师1.jpg',
      name: '王心理咨询师',
      rating: 4.9,
      expertise: '擅长：情绪管理、亲密关系',
      experience: 8,
      isFree: true
    }, {
      avatar: '/images/咨询师2.png',
      name: '李心理专家',
      rating: 4.8,
      expertise: '擅长：职场压力、焦虑缓解',
      experience: 10,
      isFree: true
    }]
  },


  navToQuiz() {
    wx.navigateTo({
      url: '/pages/Default/QuizMain/QuizMain',
    })
  },
  navToAIChat() {},
  navToInquireSchedule() {
    wx.navigateTo({
      url: '/pages/Default/InquireSchedule/InquireSchedule',
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