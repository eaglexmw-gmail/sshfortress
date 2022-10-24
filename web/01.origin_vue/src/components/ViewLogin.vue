<template>
    <div>
        <canvas ref="nes" width="256" height="240" class="game" @click="toggleForm">
        </canvas>
        <el-form :model="form" ref="form"
                 v-show="isShowForm"
                 class="demo-ruleForm login">
            <h2>Ssh Fortress</h2>

            <el-form-item prop="user">
                <el-input v-model="form.email" prefix-icon="el-icon-user-solid"
                          placeholder="username or email"></el-input>
            </el-form-item>
            <el-form-item prop="input_password">
                <el-input v-model="form.input_password" prefix-icon="el-icon-c-scale-to-original"
                          show-password></el-input>
            </el-form-item>
            <el-form-item prop="captcha" style="display: flex;align-content: center;align-items: center">
                <el-row type="flex" justify="space-between">
                    <el-col :span="16">
                        <el-input v-model.trim="captcha_value" :placeholder="$t('ignoreCase')"></el-input>
                    </el-col>
                    <el-col :span="8">
                        <el-link @click.stop="fetchCaptcha" :underline="false">
                            <img :src="captcha_img"
                                 style="margin-left:18px; border: 1px solid #d7dae2;border-radius: 4px;">
                        </el-link>
                    </el-col>
                </el-row>

            </el-form-item>

            <el-form-item>


                <div style="display: flex;justify-items: center;justify-content: space-between;width:100%">
                    <el-button type="primary"
                               :loading="loading"
                               style="width: 30%"
                               v-on:keyup.enter="handleLogin"
                               @click.native.prevent="handleLogin" v-text="$t('login')">

                    </el-button>
                    <el-button type="warning"
                               :loading="loading"
                               style="width: 30%"

                               v-on:keyup.enter="handleLogin"
                               @click.native.prevent="handleLoginGithub" v-text="$t('loginGithub')">

                    </el-button>
                    <el-button type="success"
                               style="width: 30%"
                               @click="$router.push({name:'anyTerm'})"
                               v-text="$t('anyTerm')">
                    </el-button>
                </div>

            </el-form-item>
        </el-form>
    </div>
</template>

<script>
    import * as jsnes from "jsnes"
    //const canvas_id = "nes-canvas";
    let SCREEN_WIDTH = 256;//256;
    let SCREEN_HEIGHT = 240;//240
    let FRAMEBUFFER_SIZE = SCREEN_WIDTH * SCREEN_HEIGHT;

    let canvas_ctx, image;
    let framebuffer_u8, framebuffer_u32;

    let SAMPLE_COUNT = 4 * 1024;
    let SAMPLE_MASK = SAMPLE_COUNT - 1;
    let audio_samples_L = new Float32Array(SAMPLE_COUNT);
    let audio_samples_R = new Float32Array(SAMPLE_COUNT);
    let audio_write_cursor = 0;

    let nes = new jsnes.NES({
        onFrame: function (framebuffer_24) {
            for (let i = 0; i < FRAMEBUFFER_SIZE; i++) framebuffer_u32[i] = 0xFF000000 | framebuffer_24[i];
        },
        onAudioSample: function (l, r) {
            audio_samples_L[audio_write_cursor] = l;
            audio_samples_R[audio_write_cursor] = r;
            audio_write_cursor = (audio_write_cursor + 1) & SAMPLE_MASK;
        },
    });

    function onAnimationFrame() {
        window.requestAnimationFrame(onAnimationFrame);
        image.data.set(framebuffer_u8);
        canvas_ctx.putImageData(image, 0, 0);
        nes.frame();
    }

    function keyboard(callback, event) {
        let player = 1;
        switch (event.key) {
            case "w": // w UP
                callback(player, jsnes.Controller.BUTTON_UP);
                break;
            case "s": // s Down
                callback(player, jsnes.Controller.BUTTON_DOWN);
                break;
            case "a": // a Left
                callback(player, jsnes.Controller.BUTTON_LEFT);
                break;
            case "d": // s Right
                callback(player, jsnes.Controller.BUTTON_RIGHT);
                break;
            case "u": // u 'a' - qwerty, dvorak
            case "j": // j 'q' - azerty
                callback(player, jsnes.Controller.BUTTON_B);
                break;
            case "i": // i's' - qwerty, azerty
            case "k": // k 'o' - dvorak
                callback(player, jsnes.Controller.BUTTON_A);
                break;
            case "f": // f
                callback(player, jsnes.Controller.BUTTON_SELECT);
                break;
            case "h": // h
                callback(player, jsnes.Controller.BUTTON_START);
                break;
            default:
                break;
        }
    }

    // function nes_init(canvas_id) {
    //     let canvas = document.getElementById(canvas_id);
    //     canvas_ctx = canvas.getContext("2d");
    //     image = canvas_ctx.getImageData(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    //
    //     canvas_ctx.fillStyle = "black";
    //     canvas_ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    //
    //     // Allocate framebuffer array.
    //     let buffer = new ArrayBuffer(image.data.length);
    //     framebuffer_u8 = new Uint8ClampedArray(buffer);
    //     framebuffer_u32 = new Uint32Array(buffer);
    //
    //     // Setup audio.
    //     let audio_ctx = new window.AudioContext();
    //     let script_processor = audio_ctx.createScriptProcessor(AUDIO_BUFFERING, 0, 2);
    //     script_processor.onaudioprocess = audio_callback;
    //
    //     script_processor.connect(audio_ctx.destination);
    // }

    function nes_boot(rom_data) {
        nes.loadROM(rom_data);
        window.requestAnimationFrame(onAnimationFrame);
    }

    // function nes_load_data(canvas_id, rom_data){
    //     nes_init(canvas_id);
    //     nes_boot(rom_data);
    // }


    export default {
        data() {
            return {
                isShowForm: true,
                script_processor: null,
                audio_ctx: null,
                github_client_id: "",
                github_client_secret: "",
                captcha_id: "",
                captcha_value: "",
                captcha_img: "",
                loading: false,
                form: {
                    email: 'admin@sshfortress.cn',
                    input_password: 'admin'
                }
            };
        },
        computed: {
            sid() {
                const urlParams = new URLSearchParams(window.location.search);
                const myParam = urlParams.get('sid');
                return myParam || false;
            },
            ref() {
                return `${window.location.origin}${window.location.pathname}${window.location.hash}`
            },
            code() {
                const urlParams = new URLSearchParams(window.location.search);
                const myParam = urlParams.get('code');
                return myParam || false;
            },
        },
        mounted() {

            this.nesStart();
            this.$http.get('meta').then(res => {
                if (res) {
                    this.github_client_id = res.data.github_client_id;
                    this.github_callback_url = res.data.github_callback_url;
                    //使用github Oauth登录
                    this.fetchGithubUserLoginByCodeOrDoNothing()
                }
            });


            this.fetchCaptcha();
        },
        beforeDestroy() {
            //this.nesClose()
        },
        methods: {
            toggleForm() {
                this.isShowForm = !this.isShowForm;
                if (!this.isShowForm) {
                    this.$notify({
                        title: 'Console Pad',
                        message: this.$t('consolePad'),
                        duration: 6000,
                    });
                }
                //this.nesStart()
            },
            nesStart() {
                //let canvas = document.getElementById(canvas_id);
                document.addEventListener('keydown', (event) => {
                    keyboard(nes.buttonDown, event)
                });
                document.addEventListener('keyup', (event) => {
                    keyboard(nes.buttonUp, event)
                });
                let canvas = this.$refs.nes;
                canvas_ctx = canvas.getContext("2d");
                image = canvas_ctx.getImageData(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

                canvas_ctx.fillStyle = "black";
                canvas_ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

                // Allocate framebuffer array.
                let buffer = new ArrayBuffer(image.data.length);
                framebuffer_u8 = new Uint8ClampedArray(buffer);
                framebuffer_u32 = new Uint32Array(buffer);

                // Setup audio.
                // this.audio_ctx = new window.AudioContext();
                // this.script_processor = this.audio_ctx.createScriptProcessor(AUDIO_BUFFERING, 0, 2);
                // this.script_processor.onaudioprocess = audio_callback;
                // this.script_processor.connect(this.audio_ctx.destination);
                //todo:: 修复声音

                let req = new XMLHttpRequest();
                let games = ['contra', "sd", 'smb'];
                let name = games[Math.floor(Math.random() * games.length)];
                let path = `/${name}.nes`;
                req.open("GET", path);
                req.overrideMimeType("text/plain; charset=x-user-defined");
                req.onerror = () => {
                    this.$message.error("load nes file failed")
                };
                req.onload = function () {
                    if (this.status === 200) {
                        nes_boot(this.responseText);
                    } else if (this.status === 0) {
                        // Aborted, so ignore error
                    } else {
                        req.onerror();
                    }
                };
                req.send();
            },
            nesClose() {
                document.removeEventListener("keydown");
                document.removeEventListener("keyup");
                this.script_processor.disconnect(this.audio_ctx.destination);
                this.script_processor = null;
                this.audio_ctx.close();
                this.audio_ctx = null
            },
            fetchCaptcha() {
                this.$http.get('captcha').then(res => {
                    if (res) {
                        this.captcha_id = res.data.id;
                        this.captcha_img = res.data.image;
                    }
                });
            },
            fetchGithubUserLoginByCodeOrDoNothing() {
                //使用github Oauth登录
                if (this.code) {
                    let data = {code: this.code};
                    this.$http.get('login-github', {params: data}).then(res => {
                        if (res) {
                            localStorage.setItem("token", res.data.token);
                            localStorage.setItem("expire_ts", res.data.expire_ts);
                            localStorage.setItem("expire", res.data.expire);
                            this.$store.commit('setUser', res.data);
                            this.$router.push({name: "machine"});
                        }
                    })
                }
            },
            handleLogin() {
                this.loading = true;
                let url = `login?captcha_id=${this.captcha_id}&captcha_value=${this.captcha_value}`;
                this.$http.post(url, this.form).then(res => {
                    if (res) {
                        localStorage.setItem("token", res.data.token);
                        localStorage.setItem("expire_ts", res.data.expire_ts);
                        localStorage.setItem("expire", res.data.expire);
                        this.$store.commit('setUser', res.data);
                        this.$router.push({name: "machine"});
                    }
                    this.loading = false;
                })
            },
            handleLoginGithub() {
                const url = `https://github.com/login/oauth/authorize?client_id=${this.github_client_id}&scope=user:email&allow_signup=true`;
                window.location.href = url
            },

        }
    }

</script>


<style scoped>
    .el-form-item__content {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        width: 100%
    }

    .game {
        position: fixed;
        width: 100%;
        height: 100%;
    }

    .login {
        box-shadow: rgba(0, 0, 0, 0.12) 0px 2px 4px, rgba(0, 0, 0, 0.04) 0px 0px 6px;
        width: 517px;
        height: 325px;
        background-color: white;
        padding: 2rem 2rem 0 2rem;
        margin: auto;
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
    }

    form > h2 {
        font-size: 26px;
        font-weight: 400;
        margin: 0 auto 20px;
        text-align: center;
        font-weight: 700;
    }

</style>
