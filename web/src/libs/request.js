import axios from 'axios';
import {Message, MessageBox} from 'element-ui';
import vueRouter from "../router";
import NProgress from 'nprogress';

// 创建axios实例
const service = axios.create({
    timeout: 30000, // 请求超时时间,
    // request payload
    headers: {
        'Content-Type': 'application/json;charset=UTF-8'
    },
    baseURL: "./api/"
    // 修改请求数据,去除data.q中为空的数据项,只针对post请求
});

service.interceptors.request.use(config => {
    //console.log("欢迎访问后端开发者和前端开发者的技术博客网站: https://mojotv.cn");
    NProgress.start();
    //过滤 登陆请求
    if (config.url.includes('login') || config.url.includes('captcha') || config.url.includes('meta')) {
        return config
    }
    const errp = {response: {status: 412}};
    let expire_ts = localStorage.getItem('expire_ts');
    if (expire_ts && parseInt(expire_ts) < (Date.now() / 1000)) {
        return Promise.reject(errp)
    }
    let token = localStorage.getItem('token');
    if (!token) {
        return Promise.reject(errp)
    }
    config.headers['Authorization'] = 'Bearer ' + token; // 让每个请求携带自定义token 请根据实际情况自行修改
    return config;
}, error => {
    NProgress.done();

    // 对请求错误做些什么
    Message.error("sending request is failed");
    // let loading = Loading.service({target:'#felix'});
    // loading.close();    //关闭加载前，记得重新定义实例
    return Promise.reject(error);
});

// http response 拦截器
service.interceptors.response.use(response => {
        NProgress.done();
        let res = response.data;
        if (res.ok) {
            return res
        }
        Message.warning(res.msg);
        return false;
    },
    error => {
        NProgress.done();
        if (error.response && error.response.status === 412) {
            MessageBox.confirm('token is invalid', 'jump to login', {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                type: 'warning'
            }).then(() => {
                vueRouter.push({name: "login"})
            });
            return
        }
        if (error.response && error.response.status === 200) {
            Message.warning(error.response.msg);
            return
        }
        Message.error(`http response error code: ${error.response.status}`);
        console.log(error)
        //return Promise.reject(error)

    });
export default service
