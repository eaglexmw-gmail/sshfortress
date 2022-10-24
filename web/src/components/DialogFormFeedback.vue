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
            <el-form-item :label="$t('feedbackPageUrl')" prop="page">
                <el-input v-model.trim="form.page_url" autocomplete="off" :disabled="type === 'update'"></el-input>
            </el-form-item>

            <el-form-item :label="$t('email')" prop="email">
                <el-input type="email" v-model.trim="form.email" autocomplete="off"
                          :disabled="type === 'update'"></el-input>
            </el-form-item>

            <el-form-item :label="$t('feedbackUser')" prop="user_name">
                <el-input v-model="form.user_name" autocomplete="off" :disabled="type === 'update'"></el-input>
            </el-form-item>

            <el-form-item :label="$t('content')" prop="content">
                <el-input v-model="form.content" type="textarea" :rows="5"
                          :disabled="type === 'update'"
                          placeholder="leave your valuable ideas here"
                          autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item :label="$t('feedbackStatus')" prop="status" v-if="type==='update'">
                <el-radio-group v-model="form.status" @change="doChangeStatus">
                    <el-radio-button :label="v" :key="v" v-for="v in statusList">{{$t(`feedbackStatus${v}`)}}
                    </el-radio-button>
                </el-radio-group>

            </el-form-item>

        </el-form>
        <div slot="footer" class="dialog-footer" v-if="type==='create'">
            <el-button @click="$emit('afterClose')" v-t="{path:'cancel'}"></el-button>
            <el-button type="primary" @click="handleFormSubmit" v-t="{path:'submit'}"></el-button>
        </div>
    </el-dialog>
</template>

<script>
    export default {
        name: "DialogFormFeedback",
        props: {visible: Boolean, obj: Object, type: String},

        data() {
            return {
                statusList: [0, 2, 4, 8, 16],
                v: this.visible,
                form: {page: this.$route.path},
                rules: {
                    // email: [
                    //     {required: true, trigger: 'blur', type: "email"},
                    // ],
                    // page: [
                    //     {required: true},
                    // ],
                    // content: [
                    //     {required: true},
                    // ],
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
                return this.$t('feedback');
            },
        },
        methods: {
            doOpen() {
                switch (this.type) {
                    case 'view':
                        this.form = this.obj;
                        break;
                    case 'create':
                        this.form.page_url = this.$route.path;
                        this.form.email = this.$store.getters.userEmail;
                        this.form.user_name = this.$store.getters.userName;
                        break;
                    case 'update':
                        this.form = this.obj;
                        break;
                    default:
                        this.$notify.error("wrong type");
                        this.v = false;
                }
            },
            doChangeStatus() {
                let method = 'patch';
                let url = 'feedback';
                let data = this.form;
                this.$http({method, url, data}).then(res => {
                    if (res) {
                        this.$message.success("success");
                        this.v = false
                    }
                })
            },
            postFormData() {
                let method = 'post';
                let url = 'feedback';
                let data = this.form;
                this.$http({method, url, data}).then(res => {
                    if (res) {
                        this.$message.success("success");
                        this.v = false
                    }
                })
            },
            doOpened() {
                switch (this.type) {
                    case 'view':
                        this.form = this.obj;
                        break;
                    case 'create':
                        this.form.page_url = this.$route.path;
                        this.form.email = this.$store.getters.userEmail;
                        this.form.user_name = this.$store.getters.userName;
                        break;
                    case 'update':
                        this.form = this.obj;
                        break;
                    default:
                        this.$notify.error("wrong type");
                        this.v = false;
                }
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