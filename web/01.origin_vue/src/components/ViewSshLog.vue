<template>
    <div>
        <el-row type="flex" justify="start" align="middle" class="toolbar">
            <el-button type="primary" size="small" @click="$router.go(-1)">{{$t('back')}}</el-button>
            <el-button type="danger" size="small" v-if="selectedRows && selectedRows.length >0" @click="doDeleteAll">
                {{$t('rmSelected')}}
            </el-button>
            <div class="search-bar">
                <el-input v-model.trim="q.client_ip"
                          class="table-search-input"
                          @change="fetchAllSshLog"
                          prefix-icon="el-icon-search"
                          size="small"
                          :placeholder="$t('sshLogClientIpPhS')"
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
                        @change="fetchAllSshLog"
                        :picker-options="pickerOptions">
                </el-date-picker>

                <el-button type="primary" size="small"
                           icon="el-icon-search"
                           @click="fetchAllSshLog"
                           :title="$t('btnSearch')">
                </el-button>
            </div>
        </el-row>
        <el-table :data="tableData" border
                  @selection-change="handleSelectionChange"
                  stripe size="mini" cell-class-name="fortress-cell">
            <el-table-column
                    type="selection"
                    width="55">
            </el-table-column>
            <el-table-column fixed prop="id" label="ID" :width="$store.state.idWidth">
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
            <el-table-column :label="$t('clusterSsh')" prop="ssh_user"></el-table-column>
            <el-table-column :label="$t('clientIp')" prop="client_ip"></el-table-column>
            <el-table-column :label="$t('startedAt')" width="140">
                <template slot-scope="scope">
                    <span v-text="scope.row.started_at.substring(2,19)"></span>
                </template>
            </el-table-column>

            <el-table-column :label="$t('endAt')" width="140">
                <template slot-scope="scope">
                    <span v-text="scope.row.created_at.substring(2,19)"></span>
                </template>
            </el-table-column>

            <el-table-column :label="$t('sessionDuration')" width="70">
                <template slot-scope="scope">
                    <span v-text="sessionDuration(scope.row)"></span>
                </template>
            </el-table-column>

            <el-table-column :label="$t('logLength')">
                <template slot-scope="scope">
                    <span v-text="countLogLineCount(scope.row)"></span>
                </template>
            </el-table-column>

            <el-table-column :label="$t('auditStatus')">
                <template slot-scope="scope">
                    {{ $t(`sshLogStatus${scope.row.status}`) }}
                </template>
            </el-table-column>
            <el-table-column fixed="right" :label="$t('action')" width="120">
                <template slot-scope="scope">
                    <el-button-group>

                        <el-button
                                title="view detail information"
                                @click="doView(scope.row)"
                                type="primary"
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


        <comp-ssh-log :obj="form" :visible.sync="termVisible" @afterClose="doAfterClose"></comp-ssh-log>

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
    import CompSshLog from './CompSshLog'
    import DialogFormMachine from "./DialogFormMachine";
    import DialogFormUser from "./DialogFormUser";

    export default {
        components: {CompSshLog, DialogFormMachine, DialogFormUser},
        name: 'ViewSshLog',
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
                range: [],
                q: {client_ip: ''},
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
            this.fetchAllSshLog();
        },
        created() {
        },
        methods: {
            handleSelectionChange(val) {
                this.selectedRows = val;
            },
            sessionDuration(row) {
                let d1 = Date.parse(row.created_at);
                let d2 = Date.parse(row.started_at);
                let delta = d1 - d2;
                return `${ Math.round(delta / 1000)}s`
            },
            countLogLineCount(row) {
                return row.t_log.length || 0;
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
                this.fetchAllSshLog()
            },

            sizeChange(val) {
                this.page = 1;
                this.size = val;
                this.fetchAllSshLog()
            },

            fetchAllSshLog() {
                let q = this.q;
                if (this.range.length === 2) {
                    q.from_time = this.range[0];
                    q.to_time = this.range[1]
                }
                q.page = this.page;
                q.size = this.size;
                q.user_id = this.user_id;
                q.machine_id = this.machine_id;
                this.$http
                    .get("ssh-log", {params: q})
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
                    this.$http.post(`ssh-log-rm`, ids).then(res => {
                        if (res) {
                            this.fetchAllSshLog();
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
                this.fetchAllSshLog();
                this.termVisible = false
            },
        }
    };
</script>
<style scoped>


</style>
