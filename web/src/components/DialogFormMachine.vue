<template>
    <el-dialog
            :visible.sync="v"
            :title="dTitle"
            @opened="doOpened"
            @open="doOpen"
            @close=" $emit('afterClose')"
    >
        <el-form
                :model="form"
                :label-width="$store.state.dialogFormLabelWidth"
                :rules="rules"
                ref="ruleForm"
                status-icon
        >
            <el-form-item :label="$t('machineName')" prop="name" required>
                <el-input v-model="form.name" autocomplete="off" :disabled="isView"></el-input>
            </el-form-item>
            <el-form-item :label="$t('machineSshIp')" prop="ssh_ip" required>
                <el-input v-model.trim="form.ssh_ip" autocomplete="off" :disabled="isView"></el-input>
            </el-form-item>
            <el-form-item :label="$t('machineCate')" required>
                <el-radio-group v-model="form.cate" :disabled="isView">
                    <el-radio :label="2">{{$t('machineCateLan')}}</el-radio>
                    <el-radio :label="4">{{$t('machineCateWan')}}</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item :label="$t('machineSshPort')" prop="ssh_port" required>
                <el-input type="number" v-model.number="form.ssh_port" autocomplete="off" :disabled="isView"></el-input>
            </el-form-item>
            <el-form-item :label="$t('machineLanIp')" prop="lan_ip">
                <el-input v-model.trim="form.lan_ip" autocomplete="off" :disabled="isView"></el-input>
            </el-form-item>
            <el-form-item :label="$t('machineWanIp')" prop="wan_ip">
                <el-input v-model.trim="form.wan_ip" autocomplete="off" :disabled="isView"></el-input>
            </el-form-item>

            <el-form-item :label="$t('machineClusterSsh')" required>
                <el-select v-model.number="form.cluster_ssh_id" :placeholder="$t('machineClusterSshPlace')"
                           :disabled="isView">
                    <el-option :value="item.id" :label="`${item.ssh_type}--${item.ssh_user}--${item.remark}`"
                               :key="idx" v-for="(item, idx) in sshList"></el-option>
                </el-select>
            </el-form-item>

            <el-form-item :label="$t('machineClusterJumper')">
                <el-select v-model.number="form.cluster_jumper_id" :placeholder="$t('machineClusterJumperIdPh')"
                           :disabled="isView">
                    <el-option :value="0" :label="$t('clusterJumperNone')"></el-option>
                    <el-option :value="item.id" :label="`${item.name}--${item.ssh_addr}--${item.remark}`"
                               :key="idx" v-for="(item, idx) in jumperList"></el-option>
                </el-select>
            </el-form-item>

        </el-form>
        <div slot="footer" class="dialog-footer" v-if="!isView">
            <el-button @click="$emit('afterClose')" v-t="{path:'cancel'}"></el-button>
            <el-button type="primary" @click="handleFormSubmit" v-t="{path:'submit'}"></el-button>
        </div>


    </el-dialog>
</template>

<script>
    export default {
        name: "DialogFormMachine",
        props: {
            obj: {type: Object, require: true},
            type: {type: String, require: true},
            visible: Boolean,
            id: {type: Number, require: true}
        },

        data() {
            return {
                jumperList: [],
                sshList: [],
                v: this.visible,
                isView: false,
                form: this.obj,
                rules: {
                    name: [
                        {min: 4, max: 255, message: '长度在 4 到 255 个字符', trigger: 'blur'}
                    ],
                    ssh_ip: [
                        {min: 4, max: 255, message: '长度在 4 到 255 个字符', trigger: 'blur'}
                    ],
                    ssh_port: [
                        {type: 'number', min: 1, max: 65535, message: '1~65535', trigger: 'blur'}

                    ],

                    email: [
                        {type: 'email', message: '请输入正确Email', trigger: 'blur'}
                    ],
                    mobile: [
                        {type: 'string', pattern: /^1[3456789]\d{9}$/, message: '请输入有效的手机号码', trigger: 'blur'}
                    ],

                },
            };
        },
        watch: {
            visible(val) {
                this.v = val;//新增result的watch，监听变更并同步到myResult上
            }
        },
        computed: {
            dTitle() {
                switch (this.type) {
                    case "create":
                        this.form.ssh_port = 22;
                        return this.$t('machineCreate');
                    case "view":
                        return this.$t('machineView');
                    case "edit":
                        return this.$t('machineUpdate');
                    default:
                        return ""
                }
            },
        },
        methods: {
            fetchAllClusterSsh() {
                let page = 1;
                let size = 9999;
                let where = '';
                this.$http
                    .get("cluster-ssh", {params: {where, page, size}})
                    .then(resp => {
                        if (resp) {
                            this.sshList = resp.data
                        }
                    })
            },
            fetchAllClusterJumper() {
                let page = 1;
                let size = 9999;
                this.$http
                    .get("cluster-jumper", {params: {page, size}})
                    .then(resp => {
                        if (resp) {
                            this.jumperList = resp.data
                        }
                    })
            },
            doOpen() {
                this.fetchAllClusterSsh();
                this.fetchAllClusterJumper();
                this.form = this.obj;
                this.isView = this.type === 'view';
                if (this.isView && this.id > 0) {
                    this.$http.get(`machine/${this.id}`).then(resp => {
                        if (resp) {
                            this.form = resp.data
                        }
                    })
                }
            },
            postFormData() {
                let method = 'post';
                let url = 'machine';
                if (this.type === "edit") {
                    method = "patch";
                }
                if (this.type === "create") {
                    method = "post"
                }
                let data = this.form;
                delete data.cluster_ssh;
                delete data.cluster_jumper;
                data.cluster_ssh = null;
                this.$http({method, url, data}).then(res => {
                    if (res) {
                        this.$message.success("success");
                        this.v = false
                    }
                })
            },
            doOpened() {
            },
            handleFormSubmit() {
                this.$refs.ruleForm.validate(valid => {
                    if (valid) {
                        this.postFormData()
                    } else {
                        this.$notify.error("表单错误");
                    }
                });
            },

        },
    }
</script>

<style scoped>

</style>