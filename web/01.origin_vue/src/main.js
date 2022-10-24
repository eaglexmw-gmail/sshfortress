import Vue from 'vue';
import App from './App.vue';
import router from "./router";
import ElementUI from 'element-ui';
import service from "./libs/request";
import 'element-ui/lib/theme-chalk/index.css'
import 'nprogress/nprogress.css';
import VueI18n from 'vue-i18n'
import {messages} from "./libs/i18n";
import store from '@/libs/store';
import locale from 'element-ui/lib/locale/lang/en'

Vue.use(VueI18n);
Vue.use(ElementUI, {locale});

Vue.prototype.$http = service;

Vue.config.productionTip = false;

const i18n = new VueI18n({
    locale: 'zh-CN', // 设置语言
    fallbackLocale: 'en-US',
    messages // 语言包
});
new Vue({
    router,
    i18n,
    store,
    render: h => h(App),
}).$mount('#app');
