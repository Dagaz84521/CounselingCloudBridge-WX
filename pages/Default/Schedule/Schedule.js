// pages/Default/Schedule/Schedule.js
const app = getApp();
// 防抖函数（新增）
Page({
  data: {
    searchKeyword: '',
    sortType: '',
    activeStatus: 'all',
    therapists: [],
    page: 1,
    pagesize: 5,
    loading: false,
    noMoreData: false
  },

  debounce(fn, delay) {
    let timer = null;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  },

  // 导航到咨询师详情页
  navToCounselorDetail(e) {
    const counselorId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/Default/Counselor_Details/Counselor_Details?id=${counselorId}`,
    })
  },

  onLoad(options) {
    // 绑定防抖搜索方法（新增）
    this.debouncedSearch = this.debounce(this.performSearch, 500);
    this.loadTherapists();
  },

  // 加载咨询师数据（优化）
  loadTherapists() {
    if (this.data.loading || this.data.noMoreData) return;
    
    this.setData({ loading: true });
    
    const { searchKeyword, sortType, activeStatus, page, pagesize } = this.data;
    const token = wx.getStorageSync('token');
    
    wx.request({
      url: app.globalData.host + '/api/client/counselor',
      method: 'GET',
      header: {
        'token': token,
        'content-type': 'application/json'
      },
      data: {
        name: searchKeyword || '',
        sortord: sortType === '' ? '' : sortType,
        isFree: activeStatus === 'all' ? 2 : 
               (activeStatus === 'free' ? 1 : 0),
        page: page,
        pagesize: pagesize  // 修正参数名
      },
      success: (res) => {
        if (res.data.code === 1) {
          const newData = res.data?.data || [];
          newData.forEach(counselor => {
            wx.setStorageSync(`counselor_${counselor.counselorId}`, counselor);
          });
          
          // 优化数据合并逻辑（修改）
          const mergedData = page === 1 ? newData : [...this.data.therapists, ...newData];
          
          this.setData({
            therapists: mergedData,
            noMoreData: newData.length < pagesize
          });
        } else {
          wx.showToast({ title: res.data.msg || '加载失败', icon: 'none' });
        }
      },
      fail: (err) => {
        wx.showToast({ title: err.errMsg || '网络错误', icon: 'none' });
      },
      complete: () => {
        wx.stopPullDownRefresh();
        this.setData({ loading: false });
      }
    });
  },


  // 搜索处理
  // 搜索处理（优化）
  handleSearch(e) {
    this.debouncedSearch(e.detail.value);  // 使用防抖方法
  },

  // 实际执行搜索（新增）
  performSearch(value) {
    this.setData({
      searchKeyword: value,
      page: 1,
      therapists: [],       // 清空旧数据
      noMoreData: false     // 重置加载状态
    }, () => {
      this.loadTherapists();
    });
  },

  // 清空搜索（优化）
  clearSearch() {
    this.setData({ 
      searchKeyword: '',
      page: 1,
      therapists: [],
      noMoreData: false
    }, () => {
      this.loadTherapists();
    });
  },

  // 清空搜索
  clearSearch() {
    this.setData({ 
      searchKeyword: '',
      page: 1
    }, () => {
      this.loadTherapists();
    });
  },

  // 排序处理
  handleSortChange(e) {
    const sortType = ['default', 'rating'][e.detail.value];
    this.setData({ 
      sortType,
      page: 1
    }, () => {
      this.loadTherapists();
    });
  },

// 状态过滤
filterByStatus(e) {
  const status = e.currentTarget.dataset.status;
  this.setData({ 
    activeStatus: status,
    page: 1,
    therapists: [],       // 清空旧数据
    noMoreData: false     // 重置加载状态
  }, () => {  // 这里修正了语法错误
    this.loadTherapists();
  });
},

  // 下拉刷新
  onPullDownRefresh() {
    this.setData({ page: 1 }, () => {
      this.loadTherapists();
    });
  },

  // 上拉加载更多
  onReachBottom() {
    if (!this.data.noMoreData) {
      this.setData({ page: this.data.page + 1 }, () => {
        this.loadTherapists();
      });
    }
  }
});