// pages/historyorder/historyorder.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;

    this.setData({
      orders: []
    });

    wx.getLocation({
      type: 'wgs84',
      success: res => {
        that.setData({
          latitude: res.latitude,
          longitude: res.longitude
        });
      },
      fail: res => {
        wx.showModal({
          title: '提示',
          content: '航概拼伞需要您授权获取地理位置信息才能使用。',
          showCancel: false,
          confirmText: "前往授权",
          success: res => {
            wx.openSetting({
              success: function (res) {
                if (res.authSetting["scope.userLocation"]) {
                  wx.getLocation({
                    type: 'wgs84',
                    success: res => {
                      that.setData({
                        latitude: res.latitude,
                        longitude: res.longitude
                      });
                    }
                  });
                } else {
                  wx.navigateBack();
                }
              }
            })
          }
        });

      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.freshorders();
    this.setData({
      canOrder: true
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  /**
   * 自定义函数
   */

  freshorders: function () {
    var that = this;
    var token = getApp().globalData.user.token;
    wx.request({
      url: getApp().globalData.host + '/order/history' + '/' + token,
      method: "GET",
      success: res => {
        that.setData({
          orders: res.data.orders
        });
      }
    })   
  },
  drawonmap: function (e) {
    var order = e.currentTarget.dataset.order;
    this.setData({
      markers: [
        {
          id: 1
          , name: "from"
          , iconPath: "/static/icon/umbrella_green.png"
          , longitude: order.from_longitude
          , latitude: order.from_latitude
          , width: 30
          , height: 30
        },
        {
          id: 2
          , name: "to"
          , iconPath: "/static/icon/umbrella_red.png"
          , longitude: order.to_longitude
          , latitude: order.to_latitude
          , width: 30
          , height: 30
        }
      ],
      polyline: [{
        points: [
          {
            longitude: order.from_longitude,
            latitude: order.from_latitude
          }, {
            longitude: order.to_longitude,
            latitude: order.to_latitude
          }
        ],
        color: "#0000FFDD",
        width: 3,
        dottedLine: true,
        arrowLine: true
      }]
    });
  }
})