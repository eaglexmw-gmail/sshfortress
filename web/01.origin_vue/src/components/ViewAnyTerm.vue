<template>
    <section>
        <div ref="terminal" class="hulk-term"></div>

        <el-dialog title="Web SSH Terminal"
                   :modal="false"
                   :close-on-click-modal="false"
                   width="40%"
                   :show-close="false"
                   custom-class="this-dialog"
                   :visible.sync="dialogFormVisible">
            <el-form :model="form"
                     ref="form"
                     label-width="120px"
                     :rules="rules"
                     class="demo-ruleForm login">
                <el-form-item prop="addr" label="Host">
                    <el-input v-model.trim="form.addr" prefix-icon="el-icon-user-solid"
                              autocomplete="off"
                              placeholder="input your ssh addr with port"></el-input>
                </el-form-item>
                <el-form-item prop="user" label="User">
                    <el-input v-model.trim="form.user" prefix-icon="el-icon-user-solid"
                              autocomplete="off"
                              placeholder="input your ssh user account"></el-input>
                </el-form-item>
                <el-form-item prop="password" label="Password">
                    <el-input v-model="form.password" prefix-icon="el-icon-c-scale-to-original"
                              autocomplete="off"
                              @keyup.enter.native="fireWsBindXterm"
                              :autofocus="true"
                              show-password></el-input>
                </el-form-item>
                <el-form-item prop="savePassword" label="" v-if="zendMode">
                    <el-checkbox v-model="form.savePassword">Remember Password</el-checkbox>
                </el-form-item>
            </el-form>

            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="fireWsBindXterm">Start SSH</el-button>
            </div>
        </el-dialog>

    </section>
</template>


<script>

    import {Terminal} from "xterm";
    import * as fit from "xterm/lib/addons/fit/fit";

    import {Base64} from "js-base64";
    import * as webLinks from "xterm/lib/addons/webLinks/webLinks";
    import "xterm/dist/xterm.css"
    import config from "@/libs/config"

    let bindTerminalResize = (term, websocket) => {
        let onTermResize = size => {
            websocket.send(
                JSON.stringify({
                    type: "resize",
                    rows: size.rows,
                    cols: size.cols,
                })
            );
        };
        // register resize event.
        term.on("resize", onTermResize);
        // unregister resize event when WebSocket closed.
        websocket.addEventListener("close", function () {
            term.off("resize", onTermResize);
        });
    };
    let bindTerminal = (term, websocket, bidirectional, bufferedTime) => {
        term.socket = websocket;
        let messageBuffer = null;
        let handleWebSocketMessage = function (ev) {

            if (bufferedTime && bufferedTime > 0) {
                if (messageBuffer) {
                    messageBuffer += ev.data;
                } else {
                    messageBuffer = ev.data;
                    setTimeout(function () {
                        term.write(messageBuffer);
                    }, bufferedTime);
                }
            } else {
                term.write(ev.data);
            }
        };

        let handleTerminalData = function (data) {
            websocket.send(
                JSON.stringify({
                    type: "cmd",
                    cmd: Base64.encode(data) // encode data as base64 format
                })
            );
        };

        websocket.onmessage = handleWebSocketMessage;
        if (bidirectional) {
            term.on("data", handleTerminalData);
        }

        // send heartbeat package to avoid closing webSocket connection in some proxy environmental such as nginx.
        let heartBeatTimer = setInterval(function () {
            websocket.send(JSON.stringify({type: "heartbeat", data: ""}));
        }, 20 * 1000);

        websocket.addEventListener("close", function () {
            websocket.removeEventListener("message", handleWebSocketMessage);
            term.off("data", handleTerminalData);
            delete term.socket;
            clearInterval(heartBeatTimer);
        });
    };

    let defaultTheme = {
        foreground: "#cecece",
        // foreground: "#ffffff",
        background: "#1b212f",
        cursor: "#ffffff",
        selection: "rgba(255, 255, 255, 0.3)",
        black: "#000000",
        brightBlack: "#808080",
        red: "#ce2f2b",
        brightRed: "#f44a47",
        green: "#00b976",
        brightGreen: "#05d289",
        yellow: "#e0d500",
        brightYellow: "#f4f628",
        magenta: "#bd37bc",
        brightMagenta: "#d86cd8",
        blue: "#1d6fca",
        brightBlue: "#358bed",
        cyan: "#00a8cf",
        brightCyan: "#19b8dd",
        white: "#e5e5e5",
        brightWhite: "#ffffff"
    };
    export default {
        name: "ViewAnyTerm",
        data() {
            return {
                dialogFormVisible: false,
                form: {user: '', password: '', savePassword: false, addr: "127.0.0.1:22"},
                zendMode: false,
                ws: null,
                term: null,
                password: '',
                rules: {
                    user: [
                        {required: true, message: '用户名不能为空', trigger: 'blur'},
                    ],
                    password: [
                        {required: true, message: '密码不能为空', trigger: 'blur'},
                    ],
                },
            };
        },

        mounted() {
            this.form.addr = this.$route.query.a || '127.0.0.1:22';
            this.form.user = this.$route.query.u || '';
            this.form.password = this.$route.query.p || '';
            if (!this.$route.query.z) {
                this.zendMode = true;
                this.form.savePassword = true;
                const storageKey = `${this.form.addr}.${this.form.user}`;
                if (!this.form.password){
                    this.form.password = localStorage.getItem(storageKey)
                }
            } else {
                this.zendMode = false;
                this.form.savePassword = false;
            }


            this.dialogFormVisible = true;
            this.initXtermCanvas()
        },
        beforeDestroy() {
            this.removeLister();
        },
        methods: {
            onWindowResize() {
                //console.log("resize")
                this.term.fit(); // it will make terminal resized.
            },
            doLink(ev, url) {
                if (ev.type === 'click') {
                    window.open(url)
                }
            },

            initXtermCanvas() {
                Terminal.applyAddon(fit);
                Terminal.applyAddon(webLinks);
                //TODO 网页终端添加搜索功能
                this.term = new Terminal({
                    rows: 34,
                    fontSize: 18,
                    cursorBlink: true,
                    cursorStyle: 'block',
                    bellStyle: "visual",
                    theme: defaultTheme,
                });
                this.term.open(this.$refs.terminal);
                this.term.webLinksInit(this.doLink);
                this.term.fit(); // first resizing
                window.addEventListener("resize", this.onWindowResize);
            },

            fireWsBindXterm() {
                const storageKey = `${this.form.addr}.${this.form.user}`;
                if (this.form.savePassword) {
                    localStorage.setItem(storageKey, this.form.password)
                } else {
                    localStorage.removeItem(storageKey);
                }
                this.term.clear();
                //aes
                this.term.fit(); // first resizing
                let wsURL = `${config.wsBase}/api/ws-any-term?cols=${this.term.cols}&rows=${this.term.rows}&a=${this.form.addr}&u=${this.form.user}&p=${this.form.password}`
                this.ws = new WebSocket(wsURL);
                this.ws.onerror = event => {
                    console.log(event)
                    this.dialogFormVisible = true;
                    this.$message.error('用户错误');
                };
                this.ws.onclose = (ce) => {
                    console.log(ce)
                    this.term.setOption("cursorBlink", false);
                    if (ce.code !== 1005) {
                        this.dialogFormVisible = true;
                        this.$notify.error({
                            title: `code ${ce.code}`,
                            message: ce.reason,
                        });
                        this.removeLister();
                    }
                };
                this.dialogFormVisible = false;
                this.term.focus();


                bindTerminal(this.term, this.ws, true, -1);
                bindTerminalResize(this.term, this.ws);
            },
            removeLister() {
                window.removeEventListener("resize", this.onWindowResize);
                // term.off("resize", this.onTerminalResize);
                if (this.ws) {
                    this.ws.close()
                }
                if (this.term) {
                    this.term.dispose()
                }
            }
        },
    }
</script>
<style scoped>
    .hulk-term {
        left: 0;
        right: 0;
        bottom: 0;
        top: 0;
        position: absolute;
        padding: 1rem 0 1rem 1rem;
        background-color: #1b212f;
    }
    div.this-dialog > div.el-dialog__body{
        margin-bottom: 0px!important;
    }

</style>