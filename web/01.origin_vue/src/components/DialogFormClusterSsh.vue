<template>
    <el-dialog
            :visible.sync="v"
            :title="dTitle"
            @opened="doOpened"
            @open="doOpen"
            @close=" $emit('afterClose')"
    >
        <el-form :model="form" :label-width="$store.state.dialogFormLabelWidth" :rules="rules" ref="ruleForm"
                 status-icon>
            <el-form-item :label="$t('sshUser')" prop="ssh_user">
                <el-input v-model.trim="form.ssh_user" autocomplete="off" :disabled="isView"></el-input>
            </el-form-item>
            <el-form-item :label="$t('sshType')" required>
                <el-radio-group v-model="form.ssh_type" :disabled="isView">
                    <el-radio label="password">{{$t('sshTypePassword')}}</el-radio>
                    <el-radio label="key">{{$t('sshTypeKey')}}</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item :label="$t('sshPassword')" prop="input_ssh_password" v-show="form.ssh_type === 'password'">
                <el-input type="password"
                          prefix-icon="el-icon-c-scale-to-original"
                          show-password
                          v-model.trim="form.input_ssh_password"
                          autocomplete="off"
                          :disabled="isView"></el-input>
            </el-form-item>

            <el-form-item :label="$t('sshKey')" prop="input_ssh_key" v-show="form.ssh_type === 'key'">
                <el-input v-model.trim="form.input_ssh_key"
                          type="textarea"
                          :rows="5"
                          :placeholder="$t('sshKeyPhS')"
                          :disabled="isView"
                          maxlength="2048"
                          show-word-limit
                          autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item :label="$t('sshKeyPassword')" prop="input_ssh_key_password" v-show="form.ssh_type === 'key'">
                <el-input type="password"
                          prefix-icon="el-icon-c-scale-to-original"
                          show-password
                          minlength="4"
                          maxlength="20"
                          show-word-limit
                          v-model.trim="form.input_ssh_key_password"
                          autocomplete="off"
                          :disabled="isView"></el-input>
            </el-form-item>
            <el-form-item :label="$t('remark')">
                <el-input v-model="form.remark" autocomplete="off" :disabled="isView"></el-input>
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
        name: "DialogFormClusterSsh",
        //type:create update view
        props: {obj: {type: Object, require: true}, id: {type: Number, require: true}, type: String, visible: Boolean},

        data() {
            return {
                v: this.visible,
                isView: false,
                form: this.obj,
                rules: {
                    ssh_user: [
                        {required: true, trigger: 'blur'},
                        {min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur'}
                    ],
                    input_ssh_key_password: [
                        {type: 'string', min: 3, max: 20, message: '长度在3到20个字符', trigger: 'blur'}
                    ],
                    input_ssh_password: [
                        {type: 'string', min: 3, max: 20, message: '长度在3到20个字符', trigger: 'blur'}
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
                        return this.$t('clusterSshCreate');
                    case "view":
                        return this.$t('clusterSshView');
                    case "edit":
                        return this.$t('clusterSshUpdate');
                    default:
                        return ""
                }
            },
        },
        methods: {

            doOpen() {
                this.form = this.obj;
                this.isView = this.type === 'view';

                if (this.isView && this.id > 0 && !!this.obj) {
                    this.$http.get(`cluster-ssh/${this.id}`).then(resp => {
                        if (resp) {
                            this.form = resp.data
                        }
                    })
                }
            },
            postFormData() {
                let method = 'post';
                let url = 'cluster-ssh';
                if (this.type === "edit") {
                    method = "patch";
                }
                if (this.type === "create") {
                    method = "post"
                }
                let data = this.form;
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