let config = {};

config.wsBase = `${window.location.protocol === "https:" ? "wss://" : "ws://"}${window.location.host}`;
config.apiBase = `${window.location.protocol}//:${window.location.host}`;
if (window.location.host.includes('felix.mojotv.cn')) {
    //to fix nginx web socket upgrade error
    config.wsBase = "ws://felix.mojotv.cn:3333"
}
if (window.location.host.includes('127.0.0.1')) {
    //to fix nginx web socket upgrade error
    config.wsBase = "ws://127.0.0.1:8360"
}
if (window.location.host.includes('localhost')) {
    //to fix nginx web socket upgrade error
    config.wsBase = "ws://localhost:8360"
}
export default config;
