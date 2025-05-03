// pages/User/CounselingRecord/CounselingRecord.js
const host = getApp().globalData.host;
Page({
  data: {
    consultationList: [] // 咨询记录列表
  },

  onLoad: function () {
    const thisUserId = wx.getStorageSync('userInfo').userId;
    console.log('thisUserId', thisUserId);
    wx.request({
     
      url: host + '/api/client/session/getAll?userId=' + thisUserId,
      method: 'GET',
      header:{
        token : wx.getStorageSync('token') 
      },
      success: (res) =>{
        console.log('API响应', res.data);
        if(res.data.code === 1){
          const sessionList = res.data.data.map(item => ({
            id: item.sessionId,
            name: item.counselorName,
            date: item.startTime
          }));
          this.setData({
            consultationList: sessionList
          });
        }
      },
    })
  },

  // 切换勾选状态
  toggleCheck: function (e) {
    const id = e.currentTarget.dataset.id;
    const consultationList = this.data.consultationList.map(item => {
      if (item.id === id) {
        item.checked = !item.checked;
      }
      return item;
    });
    this.setData({ consultationList });
  },

  // 删除选中的记录
  deleteSelected: function () {
    const consultationList = this.data.consultationList.filter(item => !item.checked);
    this.setData({ consultationList });
    wx.showToast({
      title: '删除成功',
      icon: 'success'
    });
  },

  // 导出选中的记录为文件
  exportSelected: function () {
    const selectedRecords = this.data.consultationList.filter(item => item.checked);
    if (selectedRecords.length === 0) {
      wx.showToast({
        title: '请先选择记录',
        icon: 'none'
      });
      return;
    }

    // 将选中的记录转换为字符串
    const exportData = selectedRecords.map(item => {
      return `${item.name} | ${item.date} | ${item.description}`;
    }).join('\n');

    // 将字符串转换为文件并保存
    this.saveToFile(exportData);
  },

  // 保存文件到本地
  saveToFile: function (data) {
    // 生成临时文件路径
    const filePath = `${wx.env.USER_DATA_PATH}/consultation_records_${Date.now()}.txt`;

    // 将数据写入文件
    wx.getFileSystemManager().writeFile({
      filePath: filePath,
      data: data,
      encoding: 'utf8',
      success: () => {
        // 保存文件到用户相册
        wx.saveFileToDisk({
          filePath: filePath,
          success: () => {
            wx.showToast({
              title: '文件已保存',
              icon: 'success'
            });
          },
          fail: (err) => {
            wx.showToast({
              title: '保存失败',
              icon: 'none'
            });
            console.error('保存文件失败', err);
          }
        });
      },
      fail: (err) => {
        wx.showToast({
          title: '文件生成失败',
          icon: 'none'
        });
        console.error('写入文件失败', err);
      }
    });
  },

  handleCardTap(e){
    const sessionId = e.currentTarget.dataset.id;
    const counselorName = e.currentTarget.dataset.name;

    wx.navigateTo({
      url: '/pages/User/RecordDetails/RecordDetails?sessionId='+sessionId+'&realName='+counselorName,
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