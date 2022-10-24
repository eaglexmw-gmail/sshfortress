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
            <el-form-item :label="$t('userName')" prop="name" required>
                <el-input v-model.trim="form.name"
                          autocomplete="off"
                          minlength="4"
                          maxlength="12"
                          show-word-limit
                          :disabled="isView || form.id > 0"></el-input>
            </el-form-item>
            <el-form-item :label="$t('email')" prop="email" required>
                <el-input v-model.trim="form.email" autocomplete="off" :disabled="isView || form.id > 0"></el-input>
            </el-form-item>
            <el-form-item :label="$t('realName')" prop="real_name" required>
                <el-input v-model="form.real_name" autocomplete="off" :disabled="isView"></el-input>
            </el-form-item>
            <el-form-item :label="$t('password')" prop="input_password">
                <el-input type="password"
                          prefix-icon="el-icon-c-scale-to-original"
                          show-password
                          v-model.trim="form.input_password"
                          autocomplete="off"
                          :disabled="isView"></el-input>
            </el-form-item>
            <el-form-item :label="$t('passwordR')" prop="input_password_r">
                <el-input type="password"
                          prefix-icon="el-icon-c-scale-to-original"
                          show-password
                          v-model.trim="form.input_password_r"
                          autocomplete="off"
                          :disabled="isView"></el-input>
            </el-form-item>
            <!--<el-form-item :label="$t('sshPassword')" prop="input_ssh_password">-->
            <!--<el-input v-model.trim="form.input_ssh_password" autocomplete="off" :disabled="isView"></el-input>-->
            <!--</el-form-item>-->

            <el-form-item :label="$t('mobile')" prop="mobile" required>
                <el-input v-model.trim="form.mobile" autocomplete="off" :disabled="isView"></el-input>
            </el-form-item>


            <el-form-item :label="$t('userRole')" prop="role" required v-if="!isMyself">
                <el-select v-model.number="form.role" :placeholder="$t('rolePlaceholder')" :disabled="isView">
                    <el-option :label="$t('roleAdmin')" :value="2"></el-option>
                    <el-option :label="$t('roleUser')" :value="4"></el-option>

                </el-select>
            </el-form-item>

            <el-form-item :label="$t('sshFilter')" required prop="ssh_filter_group_id">
                <el-select v-model.number="form.ssh_filter_group_id" :placeholder="$t('sshFilterPh')"
                           :disabled="isView">
                    <el-option :value="item.id" :label="`${item.name}--${item.remark}`"
                               :key="idx" v-for="(item, idx) in filterGroupList"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('expiredAt')" prop="expired_at" required v-if="!isMyself">
                <el-date-picker
                        :disabled="isView"
                        v-model="form.expired_at"
                        type="datetime"
                        :placeholder="$t('expiredAtPlaceholder')">
                </el-date-picker>
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
        name: "DialogFormUser",
        props: {
            obj: {type: Object, require: true},
            type: {type: String, require: true},
            visible: Boolean,
            id: {type: Number, require: true}
        },

        data() {
            let validatePass = (rule, value, callback) => {

                if (value === '' && this.form.id === 0) {
                    callback(new Error('请输入密码'));
                } else {
                    if (this.$refs.ruleForm.input_password_r !== '') {
                        this.$refs.ruleForm.validateField('input_password_r');
                    }
                    callback();
                }
            };
            let validatePassR = (rule, value, callback) => {

                if (value === '' && this.form.id === 0) {
                    callback(new Error('请再次输入密码'));
                } else if (value !== this.form.input_password) {
                    callback(new Error('两次输入密码不一致!'));
                } else {
                    callback();
                }
            };
            return {
                sshList: [],
                v: this.visible,
                isView: false,
                form: this.obj,
                filterGroupList: [],
                rules: {
                    name: [
                        {required: true, trigger: 'blur'},
                        {min: 5, max: 20, message: '长度在 5 到 20 个字符', trigger: 'blur'}
                    ],
                    input_password: [
                        {validator: validatePass, trigger: 'change'}
                    ],
                    input_password_r: [
                        {validator: validatePassR, trigger: 'change'},
                    ],
                    input_ssh_password: [
                        {type: 'string', min: 6, max: 20, message: '长度在6到20个字符', trigger: 'blur'}
                    ],
                    email: [
                        {type: 'email', message: '请输入正确Email', trigger: 'blur'}
                    ],
                    role: [{type: 'enum', enum: [2, 4], trigger: 'blur', required: true}],
                    ssh_filter_group_id: [
                        {type: 'integer', message: this.$t('sshFilterPh'), min: 1, trigger: 'blur', required: true}
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
            isMyself() {
                return this.obj.id === this.$store.getters.userId
            },
            dTitle() {
                if (this.isMyself) {
                    return this.$t('updateMyselfInfo')
                }
                switch (this.type) {
                    case "create":
                        return this.$t('addUserAccount');
                    case "view":
                        return this.$t('viewUserAccount');
                    case "edit":
                        return this.$t('updateUserAccount');
                    default:
                        return ""
                }
            },
        },
        methods: {
            fetchSshFilterGroups() {
                let q = {};
                q.page = 1;
                q.size = 9999;
                this.$http.get(`filter-group`, {params: q}).then(resp => {
                    if (resp) {
                        this.filterGroupList = resp.data
                    }
                })
            },
            doOpen() {
                this.fetchSshFilterGroups();
                this.form = this.obj;
                this.isView = this.type === 'view';
                if (this.isView && this.id > 0) {
                    this.$http.get(`user/${this.id}`).then(resp => {
                        if (resp) {
                            this.form = resp.data
                        }
                    })
                }
            },
            postFormData() {
                let method = 'post';
                let url = 'user';
                if (this.type === "edit") {
                    method = "patch";
                }
                if (this.type === "create") {
                    method = "post"
                }
                let data = this.form;
                this.$http({method, url, data}).then(res => {
                    if (res) {
                        if (this.isMyself) {
                            this.$store.commit("setUser", res.data)
                        }
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