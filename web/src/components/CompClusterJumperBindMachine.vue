<template>
    <el-dialog :visible.sync="v"
               :title="dTitle"
               @opened="doOpened"
               @open="doOpen"
               @close="$emit('afterClose')"
    >

        <el-transfer style="display: flex;justify-content: space-between"
                     class="step-form"
                     :titles="titles"
                     filterable
                     :filter-method="filterMethod"
                     :filter-placeholder="$t('searchMachinePh')"
                     v-model="value"
                     :data="machines">
        </el-transfer>


        <div slot="footer" class="dialog-footer">
            <el-button @click="v = false" v-t="{path:'cancel'}"></el-button>
            <el-button type="primary" @click="handleFormSubmit" v-t="{path:'submit'}"></el-button>
        </div>
    </el-dialog>
</template>

<script>
    export default {
        props: {obj: {type: Object, require: true}, visible: Boolean},
        name: "CompClusterJumperBindMachine",
        data() {
            return {
                value: [],
                titles: ["未分配", "已绑定"],
                machines: [],
                rawUsers: [],
                filterMethod(query, item) {
                    return item.label.indexOf(query) > -1;
                },
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
                return this.$t('clusterJumperBindMachine', this.obj)
            },
        },
        methods: {
            doOpen() {
                let page = 1;
                let size = 9999;
                this.$http.get("machine", {params: {page, size}}).then(resp => {
                    if (resp) {
                        this.rawUsers = resp.data;
                        const data = [];
                        const vids = [];
                        const csId = this.obj.id;
                        resp.data.forEach(v => {
                            data.push({
                                key: v.id,
                                label: `${v.name}-${v.ssh_ip}`,
                                disabled: false,
                            });
                            if (v.cluster_jumper_id === csId) {
                                vids.push(v.id)
                            }
                        });
                        this.machines = data;
                        this.value = vids;
                    }
                })
            },
            doOpened() {

            },
            handleFormSubmit() {
                let cluster_jumper_id = this.obj.id;
                let machine_ids = this.value;
                this.$http.post("cluster-jumper-bind", {cluster_jumper_id, machine_ids}).then(res => {
                    if (res) {
                        this.$message.success("success");
                        this.v = false
                    }
                })
            },

        },
    }
</script>

<style>
    .el-transfer-panel {
        width: 45% !important;
    }

</style>