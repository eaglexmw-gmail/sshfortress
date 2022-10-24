<template>
    <el-dialog :visible.sync="v"
               :title="dTitle"
               @opened="doOpened"
               @open="doOpen"
               @close="$emit('afterClose')"
    >

        <el-steps :active="stepIdx" finish-status="success" align-center>
            <el-step title="选择机器"></el-step>
            <el-step title="设置权限"></el-step>
        </el-steps>
        <el-transfer style="display: flex;justify-content: space-between"
                     class="step-form"
                     v-show="stepIdx === 1"
                     :titles="titles"
                     filterable
                     :filter-method="filterMethod"
                     :filter-placeholder="$t('searchMachinePh')"
                     v-model="value"
                     :data="machines">
        </el-transfer>


        <el-form v-show="stepIdx === 2" ref="ruleForm" label-width="250px" label-position="right" size="mini"
                 class="step-form">
            <template v-if="selectedMachines.length > 0">
                <el-form-item :label="v.name" v-for="(v,idx) in selectedMachines" :key="idx">
                    <el-radio-group v-model.number="v.sudo_type">
                        <el-radio :label="2">普通权限</el-radio>
                        <el-radio :label="4">SUDO权限</el-radio>
                        <el-radio :label="8">SUDO免密码</el-radio>
                    </el-radio-group>
                </el-form-item>
            </template>

            <h3 v-if="selectedMachines.length === 0" style="text-align: center">取消全部机器授权</h3>

        </el-form>


        <div slot="footer" class="dialog-footer">
            <el-button @click="v = false" v-t="{path:'cancel'}"></el-button>
            <el-button type="success" @click="stepIdx=1" v-t="{path:'previous'}" v-show="stepIdx === 2"></el-button>
            <el-button type="success" @click="doNext" v-t="{path:'next'}" v-show="stepIdx === 1"></el-button>
            <el-button type="primary" @click="handleFormSubmit" v-t="{path:'submit'}"
                       v-show="stepIdx === 2"></el-button>
        </div>
    </el-dialog>
</template>

<script>


    export default {
        props: {user: {type: Object, require: true}, visible: Boolean},
        name: "CompMachineUserBindMachine",
        data() {
            return {
                selectedMachines: [],//第二部选择的机器
                stepIdx: 1,
                value: [],
                titles: ["未分配", "已授权"],
                machines: [],
                filterMethod(query, item) {
                    return item.label.indexOf(query) > -1;
                },
                rawMachines: [],
                rawValues: {},//保存user machine 之间关系的
                v: this.visible,
            };
        },
        watch: {
            visible(val) {
                this.v = val;//新增result的watch，监听变更并同步到myResult上
            },
            stepIdx(val) {
                if (val === 2) {
                    //数据组装
                }
            }
        },
        computed: {
            dTitle() {
                return this.$t('userBindMachine', {email: this.user.email})
            },
        },

        methods: {
            fetchAllMachine() {
                let page = 1;
                let size = 9999;
                this.$http.get("machine", {params: {page, size}}).then(resp => {
                    if (resp) {
                        this.rawMachines = resp.data;
                        const data = [];
                        resp.data.forEach(v => {
                            data.push({
                                key: v.id,
                                label: `${ v.name }-${v.ssh_ip}`,
                                disabled: false,
                            });
                        });
                        this.machines = data;
                    }
                })
            },
            doOpen() {
                this.stepIdx = 1;
                this.$http.get(`machine-user/machine-ids?user_id=${this.user.id}`).then(res => {
                    if (res) {
                        let machineIds = [];
                        res.data.forEach(v => {
                            machineIds.push(v.machine_id)
                        });
                        this.value = machineIds;
                        this.rawValues = res.data;
                    }
                });
                this.fetchAllMachine()
            },
            doOpened() {

            },
            doNext() {
                if (this.stepIdx === 1) {
                    this.stepIdx = 2;
                }
                const data = [];
                this.value.forEach(id => {
                    let m = this.rawMachines.find(i => {
                        return i.id === id
                    });
                    let r = this.rawValues.find(i => {
                        return i.machine_id === id
                    });
                    if (!r) {
                        r = {sudo_type: 2}
                    }
                    if (m) {
                        let name = `${ m.name }-${m.ssh_ip}`;
                        let sudo_type = r.sudo_type;
                        data.push({id, name, sudo_type})
                    }
                });
                this.selectedMachines = data;
            },
            handleFormSubmit() {
                let user_id = this.user.id;
                let relations = [];
                this.selectedMachines.forEach(i => {
                    relations.push({machine_id: i.id, sudo_type: i.sudo_type})
                });
                this.$http.post("machine-user/bind-machine", {user_id, relations}).then(res => {
                    if (res) {
                        this.$message.success("success");
                        this.v = false;
                    }
                })
            },
        },

    }
</script>

<style scoped>
    .el-transfer-panel {
        width: 45% !important;
    }

    .step-form {
        padding: 1rem;
        margin: 2rem 1rem;
    }

</style>