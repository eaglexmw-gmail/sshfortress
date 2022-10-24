<template>
    <div>
        <el-row type="flex" justify="start" align="middle" class="toolbar">
            <el-button type="primary" size="small" @click="$router.go(-1)">{{$t('back')}}</el-button>
            <el-button type="danger" size="small" v-if="selectedRows && selectedRows.length >0" @click="doDeleteAll">
                {{$t('rmSelected')}}
            </el-button>
            <div class="search-bar">
                <el-select v-model="q.login_type"
                           style="margin-right: 1rem"
                           size="small"
                           clearable
                           @change="fetchLoginLog"
                           :placeholder="$t('siginLogTypePhS')">
                    <el-option
                            v-for="(v,idx) in ['password','github']"
                            :key="idx"
                            :label="v"
                            :value="v">
                    </el-option>
                </el-select>

                <el-input v-model.trim="q.client_ip"
                          class="table-search-input"
                          @change="fetchLoginLog"
                          prefix-icon="el-icon-search"
                          size="small"
                          :placeholder="$t('siginLogClientIpPhS')"
                          clearable>
                </el-input>
                <el-input v-model.trim="q.email"
                          class="table-search-input"
                          @change="fetchLoginLog"
                          prefix-icon="el-icon-search"
                          size="small"
                          :placeholder="$t('siginLogEmailPhS')"
                          clearable>
                </el-input>
                <el-input v-model.trim="q.user_name"
                          class="table-search-input"
                          @change="fetchLoginLog"
                          prefix-icon="el-icon-search"
                          size="small"
                          :placeholder="$t('siginLogUserNamePhS')"
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
                        @change="fetchLoginLog"
                        :picker-options="pickerOptions">
                </el-date-picker>

                <el-button type="primary" size="small"
                           icon="el-icon-search"
                           @click="fetchLoginLog"
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

            <el-table-column :label="$t('clientIp')" prop="client_ip"></el-table-column>
            <el-table-column :label="$t('loginType')" prop="login_type"></el-table-column>
            <el-table-column :label="$t('userId')">
                <template slot-scope="scope">
                    <el-link type="primary" icon="el-icon-view" @click="linkUserInfo(scope.row)"
                             v-text="scope.row.user_name"></el-link>
                </template>
            </el-table-column>
            <el-table-column :label="$t('email')" prop="email"></el-table-column>
            <el-table-column :label="$t('userAgent')" prop="user_agent"></el-table-column>

            <el-table-column :label="$t('createdAt')" width="140">
                <template slot-scope="scope">
                    <span v-text="scope.row.created_at.substring(2,19)"></span>
                </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作" width="80">
                <template slot-scope="scope">
                    <el-button-group v-if="isAdmin">
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
                          :id="0"
                          @afterClose="dfvUser=false"
        ></dialog-form-user>

    </div>

</template>

<script>
    import DialogFormUser from "./DialogFormUser";
    export default {
        components: {DialogFormUser},
        name: 'ViewSigninLog',
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
                objUser: {},
                dfvUser: false,
                csObj: {},
                csVisible: false,
                bindVisible: false,
                termVisible: false,
                formTitle: "机器添加",
                dfV: false,
                dfType: "",
                total: 0,
                page: 1,
                size: 10,
                tableData: [],
                form: {ssh_port: 22, cate: 2},
                q: {},
                range: [],
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
            uid() {
                return this.$store.getters.userId;
            },
            qUid() {
                return this.$route.query.user_id
            },

            cluster_ssh_id() {
                return this.$route.query.cluster_ssh_id || 0;
            },

        },
        mounted() {
            this.fetchLoginLog();
        },
        created() {
        },
        methods: {
            handleSelectionChange(val) {
                this.selectedRows = val;
            },
            linkUserInfo(row) {
                this.objUser = row.user;
                this.dfvUser = true;
            },
            pageChange(val) {
                this.page = val;
                this.fetchLoginLog()
            },
            sizeChange(val) {
                this.page = 1;
                this.size = val;
                this.fetchLoginLog()
            },
            fetchLoginLog() {
                let q = this.q;
                q.page = this.page;
                q.size = this.size;
                if (this.range.length === 2) {
                    q.from_time = this.range[0];
                    q.to_time = this.range[1];
                }
                this.$http
                    .get("signin-log", {params: q})
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
                    this.$http.post(`signin-log-rm`, ids).then(res => {
                        if (res) {
                            this.fetchLoginLog();
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
        }
    };
</script>
<style scoped>


</style>
