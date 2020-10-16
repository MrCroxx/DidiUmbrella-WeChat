//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    getApp().login();
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: function (res) {
          if (res.detail.errMsg == "getUserInfo:ok") {
            app.globalData.userInfo = res.userInfo
            this.setData({
              userInfo: res.userInfo,
              hasUserInfo: true
            })
          }
        }
      })
    }
    
    
  },
  onReady: function () {    
    
  },
  onShow: function () {
    if (getApp().globalData.torunningorder) {
      this.toRunningOrder(getApp().globalData.runningorder);
    }
  },
  getUserInfo: function (res) {
    if (res.detail.errMsg == "getUserInfo:ok") {
      app.globalData.userInfo = res.detail.userInfo
      this.setData({
        userInfo: res.detail.userInfo,
        hasUserInfo: true
      })
    }
  },
  toOrder: function () {
    this.toUrlWithCheckRunningOrder("../neworder/neworder");
  },
  toTake: function (e) {
    this.toUrlWithCheckRunningOrder("../takeorder/takeorder");
  },
  toHistory: function (e) {
    wx.navigateTo({
      url: '../historyorder/historyorder',
    })
  },
  toRunningOrder: function (runningorder) {
    wx.showModal({
      title: '提示',
      content: '您有正在进行的订单',
      showCancel: false,
      confirmText: "进入订单",
      success: res => {
        getApp().globalData.runningorder = runningorder;
        wx.navigateTo({
          url: '../runningorder/runningorder',
        })
      }
    })
  },
  toUrlWithCheckRunningOrder: function (url) {
    var that = this;
    var token = getApp().globalData.user.token;
    wx.request({
      url: getApp().globalData.host + '/order/latest/' + token,
      method: "GET",
      dataType: "json",
      data: {},
      success: res => {
        console.log(res);
        var runningorder = res.data.order;
        if (res.data.order == null) {
          wx.navigateTo({
            url: url
          })
        } else if (res.data.order.status == "CANCEL") {
          wx.navigateTo({
            url: url
          })
        } else if (res.data.order.status == "FINISH") {
          wx.navigateTo({
            url: url
          })
        } else if (res.data.order.status == "RUNNING") {
          that.toRunningOrder(runningorder);
        } else if (res.data.order.status == "WAITING") {
          that.toRunningOrder(runningorder);
        } else {
          that.toRunningOrder(runningorder);
        }
      }
    });
  },
  toHG: function (e) {
    wx.navigateTo({
      url: '../hg/hg',
    })
  }
})
