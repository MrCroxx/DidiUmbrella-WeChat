// pages/map/map.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    canOrder: false,
    markers: [
      {
        id: 0
        , name: "normal"
        , iconPath: "/static/icon/umbrella_blue.png"
        , longitude: 0
        , latitude: 0
        , width: 30
        , height: 30
      },
      {
        id: 1
        , name: "from"
        , iconPath: "/static/icon/umbrella_green.png"
        , longitude: 0
        , latitude: 0
        , width: 30
        , height: 30
      },
      {
        id: 2
        , name: "to"
        , iconPath: "/static/icon/umbrella_red.png"
        , longitude: 0
        , latitude: 0
        , width: 30
        , height: 30
      }
    ],
    polyline: [{
      points: [],
      color: "#0000FFDD",
      width: 3,
      dottedLine: true,
      arrowLine: true
    }]
  },

  /**
   * 生命周期函数--监听页面加载
   */



  onLoad: function (options) {
    var that = this;

    Date.prototype.format = function (fmt) {
      var o = {
        "M+": this.getMonth() + 1,                 //月份 
        "d+": this.getDate(),                    //日 
        "H+": this.getHours(),                   //小时 
        "m+": this.getMinutes(),                 //分 
        "s+": this.getSeconds(),                 //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds()             //毫秒 
      };
      if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
      }
      for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
          fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
      }
      return fmt;
    }

    this.setData({
      date: new Date().format("yyyy-MM-dd"),
      time: new Date().format("HH:mm"),
      marked: false
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
    this.setWifiEnvironment();
    this.setData({
      canOrder: true
    })
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
  regionchange(e) {
    if (e.type == 'end') {
      if (!this.data.marked) {
        this.setData({
          marked: true
        });
        this.markAll();
      } else {
        this.markNormal();
      }
    }
  },
  markLocation: function (t) {
    var that = this;
    this.mapCtx = wx.createMapContext("map4order");
    this.mapCtx.getCenterLocation({
      success: function (res) {
        if (t == 'all') {
          that.data.markers[0].longitude = res.longitude;
          that.data.markers[0].latitude = res.latitude;
          that.data.markers[1].longitude = res.longitude;
          that.data.markers[1].latitude = res.latitude;
          that.data.markers[2].longitude = res.longitude;
          that.data.markers[2].latitude = res.latitude;
        } else {
          var marker = that.data.markers.filter((m) => {
            return m.name == t
          });
          marker[0].longitude = res.longitude;
          marker[0].latitude = res.latitude;
        }
        that.setData({
          markers: that.data.markers
        });
        that.freshPolyline();
      }
    });
  },
  markFrom: function () {
    this.markLocation("from");
  },
  markTo: function () {
    this.markLocation("to");
  },
  markNormal: function () {
    this.markLocation("normal");
  },
  markAll: function () {
    this.markLocation("all");
  },
  freshPolyline: function () {
    this.data.polyline[0].points = [
      {
        longitude: this.data.markers[1].longitude,
        latitude: this.data.markers[1].latitude
      }, {
        longitude: this.data.markers[2].longitude,
        latitude: this.data.markers[2].latitude
      }
    ];
    this.setData({
      polyline: this.data.polyline
    });
  },
  makeOrder: function () {
    var that = this;
    var token = getApp().globalData.user.token;
    var userInfo = getApp().globalData.userInfo;
    this.setData({
      canOrder: false
    });
    if (this.data.contact != null && this.data.contact != "") {
      wx.request({
        url: getApp().globalData.host + '/order/new',
        method: "POST",
        dataType: "json",
        data: {
          "token": token,
          "from_nickname": userInfo.nickName,
          "from_longitude": that.data.markers[1].longitude,
          "from_latitude": that.data.markers[1].latitude,
          "to_longitude": that.data.markers[2].longitude,
          "to_latitude": that.data.markers[2].latitude,
          "from_position": that.data.from_position,
          "to_position": that.data.to_position,
          "from_contact": that.data.contact,
          "remark": that.data.remark,
          "event_time": that.data.date + " " + that.data.time + ":00",
          "from_wifi":that.data.currentWifi
        },
        success: function (res) {
          console.log(res);
          that.setData({
            canOrder: true
          });
          if (res.data.errcode == 20000) {
            var runningorder = res.data.order;
            getApp().globalData.runningorder = runningorder;
            getApp().globalData.torunningorder = true;
            wx.showToast({
              title: '下单成功',
              icon: 'success',
              duration: 2000,
              complete: function () {
                setTimeout(function () {
                  wx.navigateBack();
                }, 1000);
              }
            });
          }
        },
        fail: res => {
          console.log(res);
        }
      });
    } else {
      that.setData({
        canOrder: true
      });
      wx.showModal({
        title: '提示',
        content: '请先输入联系方式',
        showCancel: false,
        confirmText: "返回"
      })
    }

  },
  bindDateChange: function (e) {
    this.setData({
      date: e.detail.value
    });
  },
  bindTimeChange: function (e) {
    this.setData({
      time: e.detail.value
    });
  },
  bindFromPositionChange: function (e) {
    this.setData({
      from_position: e.detail.value
    });
  }, bindToPositionChange: function (e) {
    this.setData({
      to_position: e.detail.value
    });
  },
  bindRemarkChange: function (e) {
    this.setData({
      remark: e.detail.value
    });
  },
  bindContactChange: function (e) {
    this.setData({
      contact: e.detail.value
    });
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