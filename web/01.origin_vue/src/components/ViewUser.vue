<template>
    <div>
        <el-row type="flex" justify="start" align="middle" class="toolbar">
            <el-button type="primary" size="small" @click="$router.go(-1)">{{$t('back')}}</el-button>
            <el-button type="success" size="small" @click="openDialogForm({id:0},'create')" title="create a user">
                {{$t('btnAdd')}}
            </el-button>
            <div class="search-bar">
                <el-input v-model.trim="q.name"
                          class="table-search-input"
                          @blur="fetchAllUser"
                          prefix-icon="el-icon-search"
                          size="small"
                          :placeholder="$t('userNamePhS')"
                          clearable>
                </el-input>
                <el-input v-model.trim="q.email"
                          class="table-search-input"
                          @blur="fetchAllUser"
                          prefix-icon="el-icon-search"
                          size="small"
                          :placeholder="$t('userEmailPhS')"
                          clearable>
                </el-input>
                <el-input v-model="q.real_name"
                          class="table-search-input"
                          @blur="fetchAllUser"
                          prefix-icon="el-icon-search"
                          size="small"
                          :placeholder="$t('userRealNamePhS')"
                          clearable>
                </el-input>
                <el-input v-model.trim="q.mobile"
                          class="table-search-input"
                          @blur="fetchAllUser"
                          prefix-icon="el-icon-search"
                          size="small"
                          :placeholder="$t('userMobilePhS')"
                          clearable>
                </el-input>
                <el-button type="primary" size="small"
                           icon="el-icon-search"
                           @click="fetchAllUser"
                           :title="$t('btnSearch')">
                </el-button>
            </div>
        </el-row>
        <el-table :data="tableData" border style="width: 100%" stripe size="mini" cell-class-name="fortress-cell">
            <el-table-column fixed prop="id" label="ID" :width="$store.state.idWidth">
            </el-table-column>
            <el-table-column prop="name" :label="$t('userName')"></el-table-column>
            <el-table-column prop="real_name" :label="$t('realName')"></el-table-column>
            <el-table-column prop="ancestor_path" :label="$t('userAncestorPath')"></el-table-column>
            <el-table-column :label="$t('userRole')">
                <template slot-scope="scope">
                    <span v-text="parseRoleName(scope.row)"></span>
                </template>
            </el-table-column>
            <el-table-column prop="ssh_password" :label="$t('sshPassword')"></el-table-column>
            <el-table-column prop="email" :label="$t('email')" width="140"></el-table-column>
            <el-table-column prop="mobile" :label="$t('mobile')"></el-table-column>
            <!--<el-table-column prop="member_of" :label="$t('ldapInfo')"></el-table-column>-->
            <el-table-column :label="$t('updatedAt')" width="140">
                <template slot-scope="scope">
                    <span v-text="scope.row.updated_at.substring(2,19)"></span>
                </template>
            </el-table-column>

            <el-table-column :label="$t('expiredAt')" width="140">
                <template slot-scope="scope">
                    <span v-text="scope.row.expired_at.substring(2,19)"></span>
                </template>
            </el-table-column>


            <el-table-column :label="$t('sshFilter')">
                <template slot-scope="scope">
                    <el-link v-if="scope.row.ssh_filter_group_id > 0" type="primary"
                             @click="linkSshFilterGroupView(scope.row)"
                             v-text="scope.row.ssh_filter_group.name"></el-link>
                    <span v-if="scope.row.ssh_filter_group_id < 1" v-text="$t('sshFilterGroupNone')"></span>
                </template>
            </el-table-column>


            <el-table-column fixed="right" :label="$t('action')" width="190">
                <template slot-scope="scope">
                    <el-button-group>
                        <el-button
                                title="更新用户的密码和ssh密码ssh key"
                                @click="openDialogForm(scope.row,'edit')"
                                type="success"
                                size="mini"
                                v-text="$t('btnEdit')"
                        ></el-button>

                        <el-button
                                title="查看用户信息,SSH登录信息,网页端登录信息"
                                @click="openDialogForm(scope.row,'view')"
                                type="warning"
                                size="mini"
                                v-text="$t('btnView')"
                        ></el-button>
                        <el-button
                                title="授权的机器列表,跳转到机器列表"
                                @click="doBindMachine(scope.row)"
                                type="primary"
                                size="mini"
                                v-text="$t('btnUserMachines')"
                        ></el-button>
                        <el-button
                                title="SSH审计"
                                type="warning"
                                size="mini"
                                @click="$router.push({name:'sshLog',query:{'user_id':scope.row.id}})"
                                v-text="$t('btnSshAudit')"
                        ></el-button>
                        <el-button
                                title="删除web账号和ssh账号,授权的机器,账号是软删除"
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


        <comp-machine-user-bind-machine :user="form" :visible.sync="bindVisible"
                                        @afterClose="bindVisible=false"></comp-machine-user-bind-machine>

        <dialog-form-user :obj="form" :id="0" :visible="dfv" :type="dfType"
                          @afterClose="doDfAfterClose"></dialog-form-user>

        <dialog-form-filter-group :obj="sfgObj"
                                  type="view"
                                  :visible="sfgV"
                                  :id="sfgObj.id"
                                  @afterClose="sfgV=false"></dialog-form-filter-group>

    </div>

</template>

<script>
    import CompMachineUserBindMachine from "./CompMachineUserBindMachine";
    import DialogFormUser from "./DialogFormUser";
    import DialogFormFilterGroup from "./DialogFormFilterGroup";

    export default {
        name: 'ViewUser',
        components: {CompMachineUserBindMachine, DialogFormUser, DialogFormFilterGroup},
        data() {

            return {
                sfgObj: {},
                sfgV: false,
                dfv: false,
                dfType: 'view',
                bindVisible: false,
                total: 0,
                page: 1,
                size: 10,
                tableData: [],
                form: {},
                q: {},
            };
        },
        computed: {
            machine_id() {
                return this.$route.params.machine_id || 0;
            },
            machine_name() {
                return this.$route.query.machine_name || "";
            },
        },
        mounted() {
            this.fetchAllUser();
        },
        created() {
        },
        methods: {
            linkSshFilterGroupView(row) {
                this.sfgObj = row.ssh_filter_group;
                this.sfgV = true;
            },
            doAfterClose() {
                this.dfv = false;
                if (this.dfType !== 'view') {
                    this.fetchAllMachine();
                }
            },
            doBindMachine(row) {
                this.form = row;
                this.bindVisible = true
            },
            parseRoleName(row) {
                const roles = {2: "管理员", 4: "用户"};
                return roles[row.role] || "";
            },

            doView() {
                this.$notify.success("查看用户")
            },
            pageChange(val) {
                this.page = val;
                this.fetchAllUser()
            },
            sizeChange(val) {
                this.page = 1;
                this.size = val;
                this.fetchAllUser()
            },
            fetchAllUser() {
                let q = this.q;
                q.page = this.page;
                q.size = this.size;
                this.$http
                    .get("user", {params: q})
                    .then(resp => {
                        if (resp) {
                            this.total = resp.total;
                            this.size = resp.size;
                            this.page = resp.page;
                            this.tableData = resp.data
                        }
                    })
            },

            doClose(flag) {
                this.bindVisible = flag;
            },
            doDelete(row) {
                this.$confirm(this.$t("confirmDeleteMsg"), this.$t("confirmDeleteTitle"), {
                    confirmButtonText: this.$t("ok"),
                    cancelButtonText: this.$t("cancel"),
                    type: 'warning'
                }).then(() => {
                    this.$http.delete(`user/${row.id}`).then(res => {
                        if (res) {
                            this.fetchAllUser();
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
            openDialogForm(row, type) {
                this.form = row;
                this.dfType = type;
                this.dfv = true
            },
            doDfAfterClose() {
                this.dfv = false;
                if (this.dfType === 'create') {
                    this.fetchAllUser()
                }

            },

        }
    };
</script>
<style scoped>


</style>
