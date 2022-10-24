<template>
    <div>
        <el-row type="flex" justify="start" align="middle" class="toolbar">
            <el-button type="primary" size="small" @click="$router.go(-1)">{{$t('back')}}</el-button>
            <div class="search-bar">
                <el-input v-model.trim="q.page_url"
                          class="table-search-input"
                          @blur="fetchAllFeedback"
                          prefix-icon="el-icon-search"
                          size="small"
                          :placeholder="$t('feedbackPageUrlPhS')"
                          clearable>
                </el-input>
                <el-input v-model.trim="q.email"
                          class="table-search-input"
                          @blur="fetchAllFeedback"
                          prefix-icon="el-icon-search"
                          size="small"
                          :placeholder="$t('feedbackEmailPhS')"
                          clearable>
                </el-input>
                <el-input v-model.trim="q.user_name"
                          class="table-search-input"
                          @blur="fetchAllFeedback"
                          prefix-icon="el-icon-search"
                          size="small"
                          :placeholder="$t('feedbackUserNamePhS')"
                          clearable>
                </el-input>
                <el-input v-model="q.content"
                          class="table-search-input"
                          @blur="fetchAllFeedback"
                          prefix-icon="el-icon-search"
                          size="small"
                          :placeholder="$t('feedbackContentPhS')"
                          clearable>
                </el-input>
                <el-button type="primary" size="small"
                           icon="el-icon-search"
                           @click="fetchAllFeedback"
                           :title="$t('btnSearch')">
                </el-button>
            </div>
        </el-row>
        <el-table :data="tableData" border style="width: 100%" stripe size="mini" cell-class-name="fortress-cell">
            <el-table-column fixed prop="id" label="ID" :width="$store.state.idWidth">
            </el-table-column>

            <el-table-column :label="$t('feedbackUser')" width="120">
                <template slot-scope="scope">
                    <el-link type="primary" icon="el-icon-view" @click="linkUserInfo(scope.row.user_id)"
                             v-text="scope.row.user_name"></el-link>
                </template>
            </el-table-column>
            <el-table-column :label="$t('feedbackAtUser')" width="60">
                <template slot-scope="scope">
                    <el-link type="primary"
                             v-if="scope.row.at_user_id > 0"
                             icon="el-icon-view"
                             @click="linkUserInfo(scope.row.at_user_id)"
                             v-text="scope.row.at_user_id"></el-link>
                </template>
            </el-table-column>

            <el-table-column :label="$t('feedbackStatus')" width="120">
                <template slot-scope="scope">
                    <span v-t="{path:`feedbackStatus${scope.row.status}`}"></span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('feedbackEmail')" prop="email" width="150"></el-table-column>

            <el-table-column :label="$t('feedbackPageUrl')" prop="page_url" width="150"></el-table-column>
            <el-table-column :label="$t('content')" prop="content"></el-table-column>

            <el-table-column :label="$t('createdAt')" width="140">
                <template slot-scope="scope">
                    <span v-text="scope.row.created_at.substring(2,19)"></span>
                </template>
            </el-table-column>

            <el-table-column fixed="right" :label="$t('action')" width="120">
                <template slot-scope="scope">
                    <el-button-group>

                        <el-button
                                title="查看详细信息"
                                @click="doView(scope.row)"
                                type="warning"
                                size="mini"
                                v-text="$t('btnView')"
                        ></el-button>

                        <el-button
                                title="delete a row"
                                @click="doDelete(scope.row)"
                                type="danger"
                                size="mini"
                                v-text="$t('btnDelete')"
                        ></el-button>
                    </el-button-group>


                </template>
            </el-table-column>
        </el-table>
        <el-pagination
                style="margin-top: 20px"
                @size-change="sizeChange"
                @current-change="pageChange"
                :current-page="page"
                :page-sizes="[10,15, 30, 45, 60]"
                :page-size="size"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">
        </el-pagination>


        <dialog-form-user :obj="objUser"
                          type="view"
                          :visible="dfvUser"
                          :id="selectedUserId"
                          @afterClose="dfvUser=false"
        ></dialog-form-user>


        <dialog-form-feedback :visible="dfvFeedback" :obj="selectedRow" :type="dfFeedbackType"
                              @afterClose="dfvFeedback=false"></dialog-form-feedback>

    </div>

</template>

<script>
    import DialogFormUser from "./DialogFormUser";
    import DialogFormFeedback from "./DialogFormFeedback";

    export default {
        components: {DialogFormUser, DialogFormFeedback},
        name: 'ViewFeedback',
        data() {
            return {
                q: {},
                selectedRow: null,
                dfFeedbackType: "",
                selectedUserId: 0,
                objUser: {},
                dfvUser: false,
                dfvFeedback: false,
                formTitle: "机器添加",
                total: 0,
                page: 1,
                size: 10,
                tableData: [],
                form: {ssh_port: 22, cate: 2},
            };
        },
        computed: {
            user() {
                return this.$store.state.user;
            },
            email() {
                return this.$store.getters.userEmail;
            },
            isAdmin() {
                return this.$store.getters.userIsAdmin;
            },
            user_id() {
                return parseInt(this.$route.query.user_id) || 0;
            },
            machine_id() {
                return parseInt(this.$route.query.machine_id) || 0;
            },
        },
        mounted() {
            this.fetchAllFeedback();
        },
        created() {
        },
        methods: {
            linkUserInfo(id) {
                this.objUser = {id};
                this.selectedUserId = id;
                this.dfvUser = true;
            },
            doCreate() {
                this.form = {id: 0, cate: 2, ssh_port: 22};
                this.formTitle = this.$t('machineAddTitle');
            },
            pageChange(val) {
                this.page = val;
                this.fetchAllFeedback()
            },

            sizeChange(val) {
                this.page = 1;
                this.size = val;
                this.fetchAllFeedback()
            },

            fetchAllFeedback() {
                let q = this.q;
                q.page = this.page;
                q.size = this.size;
                this.$http
                    .get("feedback", {params: q})
                    .then(resp => {
                        if (resp) {
                            this.total = resp.total;
                            this.size = resp.size;
                            this.page = resp.page;
                            this.tableData = resp.data
                        }

                    })
            },
            doDelete(row) {
                this.$confirm(this.$t("confirmDeleteMsg"), this.$t("confirmDeleteTitle"), {
                    confirmButtonText: this.$t("ok"),
                    cancelButtonText: this.$t("cancel"),
                    type: 'warning'
                }).then(() => {
                    this.$http.delete(`feedback/${row.id}`).then(res => {
                        if (res) {
                            this.fetchAllFeedback();
                            this.$message.success(res.msg)
                        }
                    })
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: this.$t("confirmDeleteCancel")
                    });
                });
            },
            doView(row) {
                this.dfFeedbackType = 'update';
                this.dfvFeedback = true;
                this.selectedRow = row;
            },
            doAfterClose() {
                this.fetchAllFeedback();
                this.dfvFeedback = false
            },
        }
    };
</script>
<style scoped>


</style>
