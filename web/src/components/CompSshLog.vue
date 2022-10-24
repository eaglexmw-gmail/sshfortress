<template>
    <el-dialog :visible.sync="v"
               :title="termTitle"
               @opened="doOpened"
               @open="doOpen"
               @close="doClose"
               width="80%"
               center
    >
        <el-slider v-model="sliderV"
                   v-if="sliderMax >0"
                   :min="sliderMin"
                   :max="sliderMax"
                   show-input
                   @change="doSliderChange"
        ></el-slider>

        <div ref="terminal"></div>
        <div slot="footer" class="dialog-footer">
            <el-button @click="v = false" v-t="{path:'cancel'}"></el-button>
            <el-radio-group v-model="status" @change="doChangeStatus">
                <el-radio-button :label="v" :key="v" v-for="v in marks">{{$t(`sshLogStatus${v}`)}}</el-radio-button>
            </el-radio-group>
        </div>
    </el-dialog>
</template>

<script>
    import {Terminal} from "xterm";
    import * as fit from "xterm/lib/addons/fit/fit";
    import * as webLinks from "xterm/lib/addons/webLinks/webLinks";
    import * as search from "xterm/lib/addons/search/search";
    import "xterm/dist/xterm.css"

    export default {
        props: {obj: {type: Object, require: true}, visible: Boolean},
        name: "CompSshLog",
        data() {
            return {
                sliderV: 0,
                sliderMin: 0,
                sliderMax: 0,
                status: parseInt(this.obj.status),
                marks: [2, 4, 8, 16, 32],
                searchKey: "",
                v: this.visible,
                term: null,
                thisV: this.visible
            };
        },
        watch: {
            visible(val) {
                this.v = val;//新增result的watch，监听变更并同步到myResult上
            }
        },
        computed: {
            logText() {
                return this.obj.log;
            },
            termTitle() {
                return `网页终端日志:${this.obj.started_at} - ${this.obj.created_at}`
            }
        },

        methods: {

            doLink(ev, url) {
                if (ev.type === 'click') {
                    window.open(url)
                }
            },
            doClose() {
                if (this.term) {
                    this.term.dispose()
                }
                this.$emit('afterClose')
            },
            doOpen() {
                let ts = this.obj.t_log;

                if (ts && Array.isArray(ts)) {
                    const len = ts.length;
                    this.sliderMax = len + 1;
                    this.sliderMin = 0;
                    this.sliderV = len + 1;
                }
                this.status = parseInt(this.obj.status);
            },
            doChangeStatus() {
                let id = this.obj.id;
                let status = parseInt(this.status);
                this.$http.patch("ssh-log", {id, status}).then(res => {
                    if (res) {
                        this.$message.success("日志标记成功");
                        this.v = false;
                    }
                })

            },
            doOpened() {
                Terminal.applyAddon(fit);
                Terminal.applyAddon(webLinks);
                Terminal.applyAddon(search);
                //TODO 网页终端添加搜索功能
                this.term = new Terminal({
                    disableStdin: true,
                    fontSize: 18,
                    cursorBlink: false,
                    cursorStyle: 'bar',
                    bellStyle: "sound",
                });
                this.term.open(this.$refs.terminal);
                this.term.fit(); // first resizing
                this.term.webLinksInit(this.doLink);
                // term.on("resize", this.onTerminalResize);
                this.doSliderChange()
            },
            doSliderChange() {
                let tlogs = this.obj.t_log;
                let thres = this.sliderV;
                let term = this.term;
                term.clear();
                if (tlogs && Array.isArray(tlogs)) {
                    tlogs.forEach((msg, idx) => {
                        if (idx <= thres) {
                            term.write(msg)
                        }
                    })
                }
            },

        },
    }
</script>

<style>


</style>