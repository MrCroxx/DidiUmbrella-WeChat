// pages/takeorder/takeorder.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    modal_confirm: true,
    contact: ""
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
    this.setWifiEnvironment();
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
    wx.request({
      url: getApp().globalData.host + '/order/waiting',
      method: "GET",
      success: res => {
        console.log(res);
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
  },
  takeorder: function (e) {
    var that = this;
    if (this.data.contact && this.data.contact != "") {
      this.setData({
        modal_confirm: false,
        current_order: e.currentTarget.dataset.order
      });
      wx.showModal({
        title: '确认订单',
        content: '确认接单?',
        showCancel: true,
        cancelText: "取消",
        confirmText: "确认",
        success: function (res) {
          if (res.confirm) {
            that.setData({
              modal_confirm: true
            });
            if (that.data.canOrder) {
              var order = that.data.current_order;
              var token = getApp().globalData.user.token;
              var userInfo = getApp().globalData.userInfo;
              that.setData({
                canOrder: false
              });
              wx.request({
                url: getApp().globalData.hostv2 + '/order/take',
                method: "POST",
                dataType: "json",
                data:{
                  "oid": order.id,
                  "token":token,
                  "to_nickname": userInfo.nickName,
                  "to_contact": that.data.contact,
                  "to_wifi": that.data.currentWifi
                },
                success: function (res) {
                  that.setData({
                    canOrder: true
                  });
                  if (res.data.errcode == 20000) {
                    console.log(res);
                    var runningorder = res.data.order;
                    getApp().globalData.runningorder = runningorder;
                    getApp().globalData.torunningorder = true;
                    that.freshOrder();
                    wx.showToast({
                      title: '接单成功',
                      icon: 'success',
                      duration: 2000,
                      complete: function () {
                        setTimeout(function () {
                          wx.navigateBack();
                        }, 1000);
                      }
                    });
                  } else {
                    var runningorder = res.data.order;
                    getApp().globalData.runningorder = runningorder;
                    wx.showToast({
                      title: '手慢了,刷新中',
                      icon: 'loading',
                      duration: 2000,
                      complete: function () {
                        setTimeout(function () {
                          that.freshorders();
                        }, 1000);
                      }
                    });
                  }
                },
                fail:res=>{
                  console.log(res);
                }
              })
            }
          }
        }
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '请先输入联系方式',
        showCancel: false,
        confirmText: "返回"
      })
    }
  },
  freshOrder: function () {
    var order = getApp().globalData.order;
    var that = this;
    var token = getApp().globalData.user.token;
    wx.request({
      url: getApp().globalData.host + "/order" + "/" + order.id + "/fresh" + "/" + token,
      method: "POST",
      success: res => {
        if (res.data.order) {
          getApp().globalData.order = res.data.order;
        }
      }
    })
  },
  cancel: function () {
    this.setData({
      modal_confirm: true
    });

  },
  bindContactChange: function (e) {
    this.setData({
      contact: e.detail.value
    })
    console.log(this.data.contact);
  },
  setWifiEnvironment: function () {
    var that = this;
    wx.startWifi({
      success: res => {
        wx.getConnectedWifi({
          success: res => {
            console.log(res)
            var wifi = res.wifi;
            var secureWifiSSIDs = getApp().globalData.secureWifiSSIDs;
            if (secureWifiSSIDs.indexOf(wifi.SSID) > -1) {
              that.setData({
                currentWifi: wifi.SSID
              });
            } else {
              that.setData({
                currentWifi: "未认证"
              });
            }
          },
          fail: res => {
            console.log(res);
            that.setData({
              currentWifi: "未认证"
            });
          }
        })
      },
      fail: res => {
        console.log(res);
        that.setData({
          currentWifi: "未认证"
        });
      }
    })
  }
})