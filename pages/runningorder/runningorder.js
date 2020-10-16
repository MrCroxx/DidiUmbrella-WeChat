// pages/runningorder/runningorder.js
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
    

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var that = this;
    var order = getApp().globalData.runningorder;
    getApp().globalData.torunningorder = false;
    this.setData({
      order: order,
      userInfo:getApp().globalData.userInfo,
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
    });

    setInterval(function () {
      if (that.data.order.status == "WAITING" || that.data.order.status == "RUNNING"){
        that.freshOrder();
      }
    }, 3000)   
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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
  back: e => {
    wx.navigateBack();
  },
  cancel: function (e) {
    var that = this;
    var token = getApp().globalData.user.token;
    wx.request({
      url: getApp().globalData.host + "/order" + "/" + that.data.order.id + "/cancel" + "/" + token,
      method: "DELETE",
      success: res => {
        console.log(res);
        if (res.data.errcode == 20000) {
          wx.showToast({
            title: '取消成功',
            icon: 'success',
            duration: 2000,
            complete: function () {
              setTimeout(function () {
                wx.navigateBack();
              }, 1000);
            }
          });
        } else {
          wx.showToast({
            title: '请重试',
            icon: 'loading',
            duration: 1000
          });
        }
      }
    });
  },
  finish: function (e) {
    var that = this;
    var token = getApp().globalData.user.token;
    wx.request({
      url: getApp().globalData.host + "/order" + "/" + that.data.order.id + "/finish" + "/" + token,
      method: "POST",
      success: res => {
        console.log(res);
        if (res.data.errcode == 20000) {
          wx.showToast({
            title: '订单完成',
            icon: 'success',
            duration: 2000,
            complete: function () {
              setTimeout(function () {
                wx.navigateBack();
              }, 1000);
            }
          });
        } else {
          wx.showToast({
            title: '请重试',
            icon: 'loading',
            duration: 1000
          });
        }
      }
    })
  },
  freshOrder: function () {
    var order = this.data.order;
    var that = this;
    var token = getApp().globalData.user.token;
    wx.request({
      url: getApp().globalData.host + "/order" + "/" + order.id + "/fresh" + "/" + token,
      method: "POST",
      success: res => {
        if(res.data.order){
          getApp().globalData.order = res.data.order;
          that.setData({
            order:res.data.order
          });
        }
      }
    })
  }
})