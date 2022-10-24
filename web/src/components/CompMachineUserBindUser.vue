<template>
    <el-dialog :visible.sync="v"
               :title="dTitle"
               @opened="doOpened"
               @open="doOpen"
               @close="doClose"
    >
        <el-steps :active="stepIdx" finish-status="success" align-center>
            <el-step title="选择用户"></el-step>
            <el-step title="设置权限"></el-step>
        </el-steps>
        <el-transfer style="display: flex;justify-content: space-between"
                     v-show="stepIdx === 1"
                     class="step-form"
                     :titles="titles"
                     filterable
                     :filter-method="filterMethod"
                     :filter-placeholder="$t('searchUserPh')"
                     v-model="value"
                     :data="users">
        </el-transfer>

        <el-form v-show="stepIdx === 2" ref="ruleForm" label-width="250px" label-position="right" size="mini"
                 class="step-form">
            <template v-if="selectedUsers.length > 0">
                <el-form-item :label="v.name" v-for="(v,idx) in selectedUsers" :key="idx">
                    <el-radio-group v-model.number="v.sudo_type">
                        <el-radio :label="2">普通权限</el-radio>
                        <el-radio :label="4">SUDO权限</el-radio>
                        <el-radio :label="8">SUDO免密码</el-radio>
                    </el-radio-group>
                </el-form-item>
            </template>

            <h3 v-if="selectedUsers.length === 0" style="text-align: center">取消全部机器授权</h3>

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
        props: {machine: {type: Object, require: true}, visible: Boolean},
        name: "CompMachineUserBindUser",
        data() {
            return {
                selectedUsers: [],
                stepIdx: 1,
                value: [],
                titles: ["未分配", "已授权"],
                users: [],
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
                return this.$t('machineBindUser', {name: this.machine.name})
            },
        },
        methods: {
            fetchAllUser() {
                let page = 1;
                let size = 9999;
                this.$http.get("user", {params: {page, size}}).then(resp => {
                    if (resp) {
                        this.rawUsers = resp.data;
                        const data = [];
                        resp.data.forEach(v => {
                            data.push({
                                key: v.id,
                                label: `${v.real_name}-${v.email}`,
                                disabled: false,
                            });
                        });
                        this.users = data
                    }
                })
            },

            doClose() {
                this.$emit('afterClose')//子组件对openStatus修改后向父组件发送事件通知
            },
            doOpen() {
                this.stepIdx = 1;
                this.fetchAllUser();
                this.$http.get(`machine-user/user-ids?machine_id=${this.machine.id}`).then(res => {
                    if (res) {
                        this.rawValues = res.data;
                        let userIds = [];
                        res.data.forEach(v => {
                            userIds.push(v.user_id)
                        });
                        this.value = userIds;
                    }
                });
            },
            doOpened() {

            },
            doNext() {
                if (this.stepIdx === 1) {
                    this.stepIdx = 2;
                }
                const data = [];
                this.value.forEach(id => {
                    let m = this.rawUsers.find(i => {
                        return i.id === id
                    });
                    let r = this.rawValues.find(i => {
                        return i.user_id === id
                    });
                    if (!r) {
                        r = {sudo_type: 2}
                    }
                    if (m) {
                        let name = `${ m.name }-${m.email}`;
                        let sudo_type = r.sudo_type;
                        data.push({id, name, sudo_type})
                    }
                });
                this.selectedUsers = data;
            },
            handleFormSubmit() {
                let machine_id = this.machine.id;
                let relations = [];
                this.selectedUsers.forEach(i => {
                    relations.push({user_id: i.id, sudo_type: i.sudo_type})
                });
                this.$http.post("machine-user/bind-user", {relations, machine_id}).then(res => {
                    if (res) {
                        this.$message.success("success");
                        this.doClose()
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

    .step-form {
        padding: 1rem;
        margin: 2rem 1rem;
    }
</style>