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
            <el-form-item :label="$t('configKey')" prop="key">
                <el-input v-model.trim="form.key" autocomplete="off" :disabled="true"></el-input>
            </el-form-item>
            <el-form-item :label="$t('configValue')" prop="value">
                <el-input v-model="form.value" autocomplete="off" :disabled="isView"></el-input>
            </el-form-item>

            <el-form-item :label="$t('configRemark')" prop="remark">
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
        name: "DialogFormConfig",
        //type:create update view
        props: {obj: {type: Object, require: true}, id: {type: Number, require: true}, type: String, visible: Boolean},

        data() {
            return {
                v: this.visible,
                isView: false,
                form: this.obj,
                rules: {
                    key: [
                        {required: true, trigger: 'blur'},
                    ],
                    value: [],
                    remark: [],
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
                return this.$t('configUpdate');
            },
        },
        methods: {
            doOpen() {
                this.form = this.obj;
                this.isView = this.type === 'view';
                if (this.isView && this.id > 0 && !!this.obj) {
                    this.$http.get(`config/${this.id}`).then(resp => {
                        if (resp) {
                            this.form = resp.data
                        }
                    })
                }
            },
            postFormData() {
                let method = 'post';
                let url = 'config';
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