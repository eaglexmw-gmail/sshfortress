<template>
    <el-dialog
            :visible.sync="v"
            :title="dTitle"
            @opened="doOpened"
            @open="doOpen"
            @close=" $emit('afterClose')"
    >
        <el-tabs v-model="activeName" stretch type="card">
            <el-tab-pane :label="$t(k)" :name="k" v-for="(v,k) in info" :key="k">
                <pre v-text="v"></pre>
            </el-tab-pane>
        </el-tabs>

    </el-dialog>
</template>

<script>
    export default {
        name: "DialogMachineHardware",
        props: {
            visible: Boolean,
            machine: {type: Object, require: true}
        },
        data() {
            return {
                activeName: 'hi_login',
                info: [],
                v: this.visible,
            };
        },
        watch: {
            visible(val) {
                this.v = val;//新增result的watch，监听变更并同步到myResult上
            }
        },
        computed: {
            dTitle() {
                return `${this.$t('hardware')}: ${this.machine.name || ""} (${this.machine.ssh_ip || ""}) ` || "";
            }
        },

        methods: {
            // doTabClick(tab, event) {
            //     console.log(tab, event);
            // },
            doOpen() {
                this.$http
                    .get(`/machine/${this.machine.id}/hardware`)
                    .then(resp => {
                        if (resp) {
                            this.info = resp.data
                        }
                    })
            },

            doOpened() {
            },
        },
    }
</script>

<style scoped>
    .el-tab-pane > pre {
        padding: 0.5rem;
        border-radius: 0.25rem;
        /*max-height: 50vh;*/
        background: black;
        color: #f5f7fa;
        overflow: auto;
    }
</style>