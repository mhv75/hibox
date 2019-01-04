import CommonNavigator from "heheda-navigator";

export default class HiNavigator extends CommonNavigator {

    static navigateToAddDrug({deviceId = '', compartment}) {
        getApp().globalData.addOrEditDrugObj = {deviceId, compartment};
        this.navigateTo({url: '/pages/add-drug/choose-type/choose-type'});
    }

    static navigateToEditDrugPage({deviceId, compartment, classify, drugName, items, step, count}) {
        getApp().globalData.addOrEditDrugObj = {deviceId, compartment, classify, drugName, items};
        this.navigateTo({url: `/pages/add-drug/input-drug/input-drug?classify=${classify}&step=${step}&count=${count}`});
    }

    /**
     * 跳转到次数和用量
     * @param classify 药品类型
     * @param drugName 药品名称
     * @param step 当前是第几步
     * @param count 当前总共的步数
     */
    static navigateToDrugNumberPage({classify, drugName, step, count}) {
        this.navigateTo({url: `/pages/add-drug/number/number?classify=${classify}&drugName=${drugName}&step=${parseInt(step) + 1}&count=${count}`})
    }

    static navigateToConnectDevice() {
        this.reLaunch({url: '/pages/connect-device/connect-device'});
    }

    static switchToIndexPage({refresh = false}) {
        getApp().globalData.refreshIndexPage = refresh;
        this.switchTab({url: '/pages/index/index'});
    }

    static navigateSearchDevicePage() {
        this.navigateTo({url: `/pages/search-device/search-device`})
    }

    static navigateSearchDrugPage() {
        this.navigateTo({
            url: `/pages/search-drug/search-drug`
        })
    }

    static reLaunchToBindDevicePage() {
        this.reLaunch({url: '/pages/bind-device/bind-device'})
    }
}
