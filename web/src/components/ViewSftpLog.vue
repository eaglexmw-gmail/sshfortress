<template>
    <div>
        <el-row type="flex" justify="start" align="middle" class="toolbar">
            <el-button type="primary" size="small" @click="$router.go(-1)">{{$t('back')}}</el-button>
            <el-button type="danger" size="small" v-if="selectedRows && selectedRows.length >0" @click="doDeleteAll">
                {{$t('rmSelected')}}
            </el-button>
            <div class="search-bar">
                <el-select v-model="q.action"
                           style="margin-right: 1rem"
                           size="small"
                           clearable
                           @change="fetchAllSftpLog"
                           :placeholder="$t('sftpLogActionPhS')">
                    <el-option
                            v-for="(v,idx) in ['ls','mkdir','upload','rm-file','rm-dir','dl-file','dl-dir','rename','cate']"
                            :key="idx"
                            :label="$t(v)"
                            :value="v">
                    </el-option>
                </el-select>

                <el-input v-model="q.path"
                          class="table-search-input"
                          @change="fetchAllSftpLog"
                          prefix-icon="el-icon-search"
                          size="small"
                          :placeholder="$t('sftpLogPathPhS')"
                          clearable>
                </el-input>

                <el-date-picker
                        style="margin-right: 1rem"
                        size="small"
                        value-format="yyyy-MM-dd HH:mm:ss"
                        v-model="range"
                        type="daterange"
                        align="right"
                        unlink-panels
                        :range-separator="$t('to')"
                        :start-placeholder="$t('sshLogStartTimePhS')"
                        :end-placeholder="$t('sshLogEndTimePhS')"
                        @change="fetchAllSftpLog"
                        :picker-options="pickerOptions">
                </el-date-picker>

                <el-button type="primary" size="small"
                           icon="el-icon-search"
                           @click="fetchAllSftpLog"
                           :title="$t('btnSearch')">
                </el-button>
            </div>
        </el-row>
        <el-table :data="tableData"
                  ref="multipleTable"
                  @selection-change="handleSelectionChange"
                  border
                  stripe size="mini" cell-class-name="fortress-cell">
            <el-table-column
                    type="selection"
                    width="55">
            </el-table-column>

            <el-table-column :label="$t('machineId')">
                <template slot-scope="scope">
                    <el-link type="primary" icon="el-icon-view" @click="linkMachineInfo(scope.row)"
                             v-text="scope.row.machine.name"></el-link>
                </template>
            </el-table-column>
            <el-table-column :label="$t('userId')">
                <template slot-scope="scope">
                    <el-link type="primary" icon="el-icon-view" @click="linkUserInfo(scope.row)"
                             v-text="scope.row.user.name"></el-link>
                </template>
            </el-table-column>

            <el-table-column :label="$t('clientIp')" prop="client_ip"></el-table-column>

            <el-table-column :label="$t('sftpAction')">
                <template slot-scope="scope">
                    {{ $t(scope.row.action) }}
                </template>
            </el-table-column>

            <el-table-column :label="$t('auditStatus')">
                <template slot-scope="scope">
                    {{ txtCate(scope.row) }}
                </template>
            </el-table-column>
            <el-table-column :label="$t('sftpPath')" prop="path"></el-table-column>

            <el-table-column :label="$t('sshUser')" prop="ssh_user"></el-table-column>
            <el-table-column :label="$t('updatedAt')" width="140">
                <template slot-scope="scope">
                    <span v-text="scope.row.updated_at.substring(2,19)"></span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('createdAt')" width="140">
                <template slot-scope="scope">
                    <span v-text="scope.row.created_at.substring(2,19)"></span>
                </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作" width="80">
                <template slot-scope="scope">
                    <el-button-group>
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

        <dialog-form-machine :obj="objMachine"
                             type="view"
                             :visible="dfvMachine"
                             :id="0"
                             @afterClose="dfvMachine=false"
        ></dialog-form-machine>
        <dialog-form-user :obj="objUser"
                          type="view"
                          :visible="dfvUser"
                          :id="0"
                          @afterClose="dfvUser=false"
        ></dialog-form-user>
    </div>

</template>

<script>
    import DialogFormMachine from "./DialogFormMachine";
    import DialogFormUser from "./DialogFormUser";

    export default {
        components: {DialogFormMachine, DialogFormUser},
        name: 'ViewSftpLog',
        data() {
            return {
                selectedRows: null,
                pickerOptions: {
                    shortcuts: [
                        {
                            text: this.$t('last1day'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                start.setDate(start.getDate() - 1);
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('last3day'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                start.setDate(start.getDate() - 3);
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('last7day'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                start.setDate(start.getDate() - 7);
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('last1month'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                start.setMonth(start.getMonth() - 1);
                                picker.$emit('pick', [start, end]);
                            }
                        },
                    ]
                },
                q: {path: "", action: ""},
                range: [],
                objUser: {},
                dfvUser: false,
                objMachine: {},
                dfvMachine: false,
                termVisible: false,
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
            this.fetchAllSftpLog();
        },
        created() {
        },
        methods: {
            handleSelectionChange(val) {
                this.selectedRows = val;
            },
            countLogLineCount(row) {
                return row.log.split("\n").length
            },
            linkMachineInfo(row) {
                this.objMachine = row.machine;
                this.dfvMachine = true;
            },
            linkUserInfo(row) {
                this.objUser = row.user;
                this.dfvUser = true;
            },
            doCreate() {
                this.form = {id: 0, cate: 2, ssh_port: 22};
                this.formTitle = this.$t('machineAddTitle');
            },

            pageChange(val) {
                this.page = val;
                this.fetchAllSftpLog()
            },
            txtCate(row) {
                let li = {0: "未标记", 2: "正常", 4: "警告", 8: "危险", 16: "致命"};
                return li[row.status];
            },
            sizeChange(val) {
                this.page = 1;
                this.size = val;
                this.fetchAllSftpLog()
            },

            fetchAllSftpLog() {
                let q = this.q;
                q.page = this.page;
                q.size = this.size;
                q.user_id = this.user_id;
                q.machine_id = this.machine_id;
                if (this.range.length === 2) {
                    q.from_time = this.range[0];
                    q.to_time = this.range[1];
                }
                this.$http
                    .get("sftp-log", {params: q})
                    .then(resp => {
                        if (resp) {
                            this.total = resp.total;
                            this.size = resp.size;
                            this.page = resp.page;
                            this.tableData = resp.data
                        }

                    })
            },
            doDeleteAll() {
                if (!this.selectedRows || this.selectedRows.length === 0) {
                    return;
                }
                const ids = [];
                this.selectedRows.forEach(vv => {
                    ids.push(vv.id)
                });
                this.privateRm(ids)
            },
            privateRm(ids) {
                if (!ids || !Array.isArray(ids)) {
                    return
                }
                this.$confirm(this.$t("confirmDeleteMsg"), this.$t("confirmDeleteTitle"), {
                    confirmButtonText: this.$t("ok"),
                    cancelButtonText: this.$t("cancel"),
                    type: 'warning'
                }).then(() => {
                    this.$http.post(`sftp-log-rm`, ids).then(res => {
                        if (res) {
                            this.fetchAllSftpLog();
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

            doDelete(row) {
                this.privateRm([row.id])
            },
            doView(row) {
                this.form = row;
                this.termVisible = true
            },
            doAfterClose() {
                this.fetchAllSftpLog();
                this.termVisible = false
            },
        }
    };
</script>
<style scoped>


</style>
