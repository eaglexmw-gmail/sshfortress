<template>
    <div>
        <el-row type="flex" justify="start" align="middle" class="toolbar">
            <el-button type="primary" size="small" @click="$router.go(-1)">{{$t('back')}}</el-button>
            <el-button type="success" size="small" @click="openDialogForm({id:0,ssh_type: 'password'},'create')"
                       title="向当前机器添加SSH用户">{{$t('btnAdd')}}
            </el-button>
            <div class="search-bar">
                <el-input v-model="q.remark"
                          @blur="fetchAllClusterSsh"
                          class="table-search-input"
                          prefix-icon="el-icon-search"
                          size="small"
                          :placeholder="$t('sshRemarkPhS')"
                          clearable>
                </el-input>
                <el-input v-model.trim="q.ssh_user"
                          class="table-search-input"
                          @blur="fetchAllClusterSsh"
                          prefix-icon="el-icon-search"
                          size="small"
                          :placeholder="$t('sshUserPhS')"
                          clearable>
                </el-input>
                <el-button type="primary" size="small"
                           icon="el-icon-search"
                           @click="fetchAllClusterSsh"
                           :title="$t('btnSearch')">
                </el-button>
            </div>

        </el-row>
        <el-table :data="tableData" border style="width: 100%" stripe size="mini" cell-class-name="fortress-cell">
            <el-table-column fixed prop="id" label="ID" :width="$store.state.idWidth">
            </el-table-column>
            <el-table-column :label="$t('sshRemark')" prop="remark"></el-table-column>
            <el-table-column :label="$t('sshUser')" prop="ssh_user"></el-table-column>
            <el-table-column :label="$t('sshType')" prop="ssh_type"></el-table-column>
            <!--<el-table-column :label="$t('sshPassword')" prop="ssh_password"></el-table-column>-->
            <!--<el-table-column :label="$t('sshKey')" prop="ssh_key"></el-table-column>-->
            <!--<el-table-column :label="$t('sshKeyPassword')" prop="ssh_key_password"></el-table-column>-->
            <el-table-column :label="$t('updatedAt')" width="140">
                <template slot-scope="scope">
                    <span v-text="scope.row.updated_at.substring(2,19)"></span>
                </template>
            </el-table-column>
            <el-table-column fixed="right" :label="$t('action')" width="190">
                <template slot-scope="scope">
                    <el-button-group>
                        <el-button
                                :title="$t('btnEdit')"
                                @click="openDialogForm(scope.row,'edit')"
                                type="success"
                                size="mini"
                                v-text="$t('btnEdit')"
                        ></el-button>
                        <el-button
                                title="view detail"
                                @click="openDialogForm(scope.row,'view')"
                                type="warning"
                                size="mini"
                                v-text="$t('btnView')"
                        ></el-button>
                        <el-button
                                title="assign machines"
                                @click="assignMachine(scope.row)"
                                type="primary"
                                size="mini"
                                v-text="$t('assignMachines')"
                        ></el-button>
                        <el-button
                                :title="$t('btnDelete')"
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

        <dialog-form-cluster-ssh :obj="form"
                                 :type="dfType"
                                 :visible="dfV"
                                 :id="0"
                                 @afterClose="doRefresh"></dialog-form-cluster-ssh>
        <comp-cluster-ssh-bind-machine :obj="form" :visible="compV"
                                       @afterClose="compV=false"></comp-cluster-ssh-bind-machine>
    </div>
</template>

<script>
    import DialogFormClusterSsh from './DialogFormClusterSsh'
    import CompClusterSshBindMachine from './CompClusterSshBindMachine'

    export default {
        components: {DialogFormClusterSsh, CompClusterSshBindMachine},
        name: 'ViewClusterSsh',
        data() {

            return {
                q: {remark: "", ssh_user: ""},
                compV: false,
                dfType: "",
                dfV: false,
                total: 0,
                page: 1,
                size: 10,
                tableData: [],
                form: {},
            };
        },
        mounted() {
            this.fetchAllClusterSsh();
        },

        methods: {
            assignMachine(row) {
                this.form = row;
                this.compV = true
            },
            doRefresh() {
                this.dfV = false;
                if (this.dfType !== 'view') {
                    this.fetchAllClusterSsh();
                }
            },
            pageChange(val) {
                this.page = val;
                this.fetchAllClusterSsh()
            },
            sizeChange(val) {
                this.page = 1;
                this.size = val;
                this.fetchAllClusterSsh()
            },
            fetchAllClusterSsh() {
                let q = this.q;
                q.page = this.page;
                q.size = this.size;
                this.$http
                    .get("cluster-ssh", {params: q})
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
                    this.$http.delete(`cluster-ssh/${row.id}`).then(res => {
                        if (res) {
                            this.fetchAllClusterSsh();
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
                this.dfV = true
            },
        }
    };
</script>
<style scoped>


</style>
