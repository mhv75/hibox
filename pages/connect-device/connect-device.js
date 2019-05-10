// pages/connect-device/connect-device.js
import HiNavigator from "../../navigator/hi-navigator";
import {ConnectState, ProtocolState} from "../../modules/bluetooth/bluetooth-state";

const app = getApp();

Page({

    data: {
        isFlicker: false,
        state: {
            title: '将药盒靠近手机',
            content: '正在努力的寻找药盒…',
            backgroundColor: '#3E3E3E',
            navigationColor: '#3E3E3E',
            connectErr: false
        },
        content: [
            '手机未开启蓝牙',
            '手机未授权微信获取定位权限',
            '药盒离手机太远',
            '未在药盒上短按按键确认'
        ]
    },

    isBind: false,

    onLoad: function (options) {
        wx.setNavigationBarColor({
            frontColor: '#ffffff',
            backgroundColor: this.data.state.navigationColor,
        });
        this.flickerHandle();
        this.reConnectEvent();
        app.setBLEListener({
            bleStateListener: ({state}) => {
                // this.state = state;
                console.log('扫描时打印些信息 时间戳计算间隔', Date.now() - this.startScanTimestamp, this.startScanTimestamp);
                const bet = Date.now() - this.startScanTimestamp < this.timeout;
                console.log('扫描时打印些信息 状态', state.connectState, '是否在重连时间内', bet, 'isHide', this.isHide);
                if (state.connectState === ConnectState.DISCONNECT && bet && !this.isHide) {
                    console.log('扫描时打印些信息 执行重连');
                    app.getBLEManager().connect();
                } else {
                    this.showResult({state: state.connectState});
                }
            },
            receiveDataListener: ({finalResult, state}) => {
                if (ProtocolState.GET_CONNECTED_RESULT_SUCCESS === state.protocolState) {
                    this.isBind = true;
                    const {isConnected} = finalResult;
                    const manager = app.getBLEManager();
                    manager.updateBLEStateImmediately(manager.getState({
                        protocolState: ProtocolState.CONNECTED_AND_BIND,
                        connectState: ConnectState.CONNECTED
                    }));
                    setTimeout(() => isConnected && HiNavigator.switchToIndexPage({refresh: true}));
                }
            },
            bleSignPowerListener: (hiDevice) => {
                this.setData({
                    devices:this.bubbleSort(hiDevice)
                })
            }
        })
    },

    bubbleSort(numbers) {
        console.log('未排序的数组====》',numbers);
        let temp = 0;
        let size = numbers.length;
        for (let i = 0; i < size - 1; i++) {
            for (let j = 0; j < size - 1 - i; j++) {
                if (numbers[j].RSSI < numbers[j + 1].RSSI) {  //交换两数位置
                    temp = numbers[j].RSSI;
                    numbers[j].RSSI = numbers[j + 1].RSSI;
                    numbers[j + 1].RSSI = temp;
                }
            }
        }
        console.log('========================',numbers);
        return numbers;
    },

    onShow() {
        this.isHide = false;
    },
    onHide() {
        this.isHide = true;
        this.startScanTimestamp = 0;

    },

    onUnload() {
        !this.isBind && app.getBLEManager().clearConnectedBLE().finally(() => {
            this.startScanTimestamp = Date.now();
        });
    },

    timeout: 30000,
    startScanTimestamp: 0,

    reConnectEvent() {
        const now = Date.now();
        if (now - this.startScanTimestamp >= this.timeout) {
            this.startScanTimestamp = now;
            console.log('扫描时打印些信息 开始时间戳', this.startScanTimestamp);
            app.getBLEManager().connect();
        }
    },

    getResultState({state}) {
        switch (state) {
            case ConnectState.CONNECTING:
                return {
                    title: '将药盒靠近手机',
                    content: '正在努力的寻找药盒…',
                    backgroundColor: '#3E3E3E',
                    navigationColor: '#3E3E3E',
                    connectErr: false,
                    findBox: false
                };
            case ConnectState.UNAVAILABLE:
            case ConnectState.DISCONNECT:
            case ConnectState.UNBIND:
                this.isBind = false;
                app.getBLEManager().clearConnectedBLE();
                return {
                    connectErr: true,
                    navigationColor: '#66DABF',
                    backgroundColor: 'linear-gradient(#66DABF, #008290)',
                    delayTime: 3000
                };
            case ConnectState.CONNECTED:
                this.startScanTimestamp = 0;
            default:
                return {
                    title: '药盒找到啦！',
                    content: '短按药盒按钮，绑定设备',
                    backgroundColor: 'linear-gradient(#66DABF, #008290)',
                    navigationColor: '#66DABF',
                    connectErr: false,
                    findBox: true,
                    delayTime: 2000
                };
        }
    },

    showResult({state}) {
        const resultState = this.getResultState({state});
        setTimeout(() => {
            this.setData({
                state: resultState,
                showReConnected: state === ConnectState.DISCONNECT || state === ConnectState.UNAVAILABLE
            });
            wx.setNavigationBarColor({
                frontColor: '#ffffff',
                backgroundColor: this.data.state.navigationColor,
            });
        }, resultState.delayTime || 0);

    },

    showUnAvailableResult({state}) {
        const resultState = this.getResultState({state});
        setTimeout(() => {
            this.setData({
                state: resultState,
                showReConnected: state === ConnectState.DISCONNECT || state === ConnectState.UNAVAILABLE
            });
            wx.setNavigationBarColor({
                frontColor: '#ffffff',
                backgroundColor: this.data.state.navigationColor,
            });
        }, resultState.delayTime || 0);

    },
    flickerHandle() {
        let num = 0;
        let timer = setInterval(() => {
            this.setData({
                isFlicker: !this.data.isFlicker
            });
            ++num;
            // if (num === 30) {
            //     clearTimeout(timer);
            // }
        }, 1000);
    },

    Showmorepopup() {
        wx.showModal({
            title: '小贴士',
            content: '前往手机【设置】->找到【微信】应用\n' +
                '\n' +
                '打开【微信定位/位置权限】',
            showCancel: false,
            confirmText: '我知道了',
        })
    }

})
