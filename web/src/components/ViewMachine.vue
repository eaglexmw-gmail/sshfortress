<template>
    <div>
        <el-row type="flex" justify="start" align="middle" class="toolbar">
            <el-button type="primary" size="small" @click="$router.go(-1)">{{$t('back')}}</el-button>
            <el-button type="success"
                       v-if="isAdmin"
                       size="small"
                       @click="openDialogForm({id:0},'create')"
                       title="添加机器">
                {{$t('btnAdd')}}
            </el-button>
            <div class="search-bar">
                <el-input v-model="q.name"
                          @blur="fetchAllMachine"
                          class="table-search-input"
                          prefix-icon="el-icon-search"
                          size="small"
                          :placeholder="$t('machineNamePhS')"
                          clearable>
                </el-input>
                <el-input v-model.trim="q.ssh_ip"
                          class="table-search-input"
                          @blur="fetchAllMachine"
                          prefix-icon="el-icon-search"
                          size="small"
                          :placeholder="$t('machineSshIpPhS')"
                          clearable>
                </el-input>
                <el-input v-model.trim="q.wan_ip"
                          class="table-search-input"
                          @blur="fetchAllMachine"
                          prefix-icon="el-icon-search"
                          size="small"
                          :placeholder="$t('machineWanIpPhS')"
                          clearable>
                </el-input>
                <el-input v-model.trim="q.lan_ip"
                          class="table-search-input"
                          @blur="fetchAllMachine"
                          prefix-icon="el-icon-search"
                          size="small"
                          :placeholder="$t('machineLanIpPhS')"
                          clearable>
                </el-input>
                <el-button type="primary" size="small"
                           icon="el-icon-search"
                           @click="fetchAllMachine"
                           :title="$t('btnSearch')">
                </el-button>
            </div>
        </el-row>
        <el-table :data="tableData" border style="width: 100%" stripe size="mini" cell-class-name="fortress-cell">
            <el-table-column fixed prop="id" label="ID" :width="$store.state.idWidth">
            </el-table-column>

            <el-table-column :label="$t('machineName')" prop="name"></el-table-column>
            <el-table-column :label="$t('machineSshIp')" prop="ssh_ip"></el-table-column>
            <el-table-column :label="$t('machineSshPort')" prop="ssh_port"></el-table-column>
            <el-table-column :label="$t('machineLanIp')" prop="lan_ip"></el-table-column>
            <el-table-column :label="$t('machineWanIp')" prop="wan_ip"></el-table-column>
            <el-table-column :label="$t('machineCate')">
                <template slot-scope="scope">
                    {{ txtCate(scope.row) }}
                </template>
            </el-table-column>
            <el-table-column :label="$t('machineType')">
                <template slot-scope="scope">
                    {{ machineUserType(scope.row) }}
                </template>
            </el-table-column>
            <el-table-column :label="$t('clusterSsh')">
                <template slot-scope="scope">
                    <el-link type="primary" icon="el-icon-view" @click="linkClusterSshInfo(scope.row)"
                             v-text="getSshUser(scope.row)"></el-link>
                </template>
            </el-table-column>
            <el-table-column :label="$t('clusterJumper')">
                <template slot-scope="scope">
                    <el-link v-if="scope.row.cluster_jumper_id > 0" type="primary" icon="el-icon-view"
                             @click="linkClusterJumperInfo(scope.row)"
                             v-text="scope.row.cluster_jumper.name"></el-link>
                    <span v-if="scope.row.cluster_jumper_id < 1" v-text="$t('clusterJumperNone')"></span>
                </template>
            </el-table-column>

            <el-table-column :label="$t('updatedAt')" width="140">
                <template slot-scope="scope">
                    <span v-text="scope.row.updated_at.substring(2,19)"></span>
                </template>
            </el-table-column>
            <el-table-column fixed="right" :label="$t('action')" width="210">
                <template slot-scope="scope">
                    <el-button-group>
                        <el-button
                                v-if="isAdmin"
                                :title="$t('btnEdit')"
                                @click="openDialogForm(scope.row,'edit')"
                                type="success"
                                size="mini"
                                v-text="$t('btnEdit')"
                        ></el-button>
                        <el-button
                                :title="$t('btnView')"
                                @click="openDialogForm(scope.row,'view')"
                                type="warning"
                                size="mini"
                                v-text="$t('btnView')"
                        ></el-button>
                        <el-button
                                :title="$t('hardware')"
                                @click="doHardware(scope.row)"
                                type="info"
                                size="mini"
                                v-text="$t('hardware')"
                        ></el-button>
                        <el-button
                                :title="$t('btnSsh')"
                                @click="doSshTerm(scope.row)"
                                type="primary"
                                size="mini"
                                v-text="$t('btnSsh')"
                        ></el-button>
                        <el-button
                                :title="$t('btnSftp')"
                                @click="doSftp(scope.row)"
                                type="success"
                                size="mini"
                                v-text="$t('btnSftp')"
                        ></el-button>

                    </el-button-group>
                    <el-button-group v-if="isAdmin">
                        <el-button
                                :title="$t('btnDelete')"
                                @click="doDelete(scope.row)"
                                type="danger"
                                size="mini"
                                v-text="$t('btnDelete')"
                        ></el-button>
                        <el-button
                                :title="$t('btnSshAudit')"
                                type="warning"
                                size="mini"
                                @click="$router.push({name:'sshLog',query:{'machine_id':scope.row.id}})"
                                v-text="$t('btnSshAudit')"
                        ></el-button>
                        <el-button
                                :title="$t('btnMachineUser')"
                                @click="doMachineBindUser(scope.row)"
                                type="primary"
                                size="mini"
                                v-text="$t('btnMachineUser')"
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


        <!--edit-->


        <comp-term :obj="form" :visible="termVisible" @afterClose="termVisible=false"></comp-term>

        <comp-machine-user-bind-user :machine="form" :visible="bindVisible"
                                     @afterClose="doClose"></comp-machine-user-bind-user>

        <dialog-form-machine :obj="form"
                             :type="dfType"
                             :visible="dfV"
                             :id="0"
                             @afterClose="doRefresh"
        ></dialog-form-machine>

        <dialog-form-cluster-ssh :obj="csObj" :id="0" :visible="csVisible" type="view"
                                 @afterClose="csVisible=false"></dialog-form-cluster-ssh>

        <dialog-form-cluster-jumper :obj="cjObj" :id="0" :visible="cjVisible" type="view"
                                    @afterClose="cjVisible=false"></dialog-form-cluster-jumper>

        <dialog-machine-hardware :machine="selectedRow" :visible="dmhV"
                                 @afterClose="dmhV=false"></dialog-machine-hardware>
    </div>

</template>

<script>
    import CompTerm from "./CompTerm";
    import CompMachineUserBindUser from "./CompMachineUserBindUser";
    import DialogFormMachine from "./DialogFormMachine";
    import DialogFormClusterSsh from "./DialogFormClusterSsh";
    import DialogMachineHardware from "./DialogMachineHardware";
    import DialogFormClusterJumper from "./DialogFormClusterJumper";

    export default {
        name: 'ViewMachine',
        components: {
            CompTerm,
            CompMachineUserBindUser,
            DialogFormClusterJumper,
            DialogFormMachine,
            DialogFormClusterSsh,
            DialogMachineHardware
        },
        data() {
            return {
                selectedRow: {id: 0},
                dmhV: false,
                csObj: {},
                csVisible: false,
                cjObj: {},
                cjVisible: false,
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
            this.fetchAllMachine();
        },
        created() {
        },
        methods: {
            linkClusterSshInfo(row) {
                this.csObj = row.cluster_ssh;
                this.csVisible = true;
            },
            linkClusterJumperInfo(row) {
                this.cjObj = row.cluster_jumper;
                this.cjVisible = true;
            },
            doRefresh() {
                this.dfV = false;
                if (this.dfType !== 'view') {
                    this.fetchAllMachine();
                }
            },
            pageChange(val) {
                this.page = val;
                this.fetchAllMachine()
            },
            txtCate(row) {
                if (row.cate === 2) {
                    return this.$t('machineCateLan');
                }
                if (row.cate === 4) {
                    return this.$t('machineCateWan');
                }
                return "";
            },
            doHardware(row) {
                this.selectedRow = row;
                this.dmhV = true;
            },
            machineUserType(row) {
                if (row.user_id === this.uid) {
                    return this.$t('owned');
                } else {
                    return this.$t('assigned');
                }
            },
            doSshTerm(row) {
                this.form = row;
                this.termVisible = true;
                // this.$router.push({'name': 'sshConsole', params: row})
            },
            doSftp(row) {
                let id = row.id;
                let sshIp = row.ssh_ip;
                let user = this.getSshUser(row);
                this.$router.push({'name': 'sftp', params: {id, sshIp, user}})
            },
            getSshUser(row){
                if (row.cluster_ssh){
                    return row.cluster_ssh.ssh_user || "";
                }
                return ""
            },
            sizeChange(val) {
                this.page = 1;
                this.size = val;
                this.fetchAllMachine()
            },
            doMachineBindUser(row) {
                this.form = row;
                this.bindVisible = true;
            },
            fetchAllMachine() {
                let q = this.q;
                q.page = this.page;
                q.size = this.size;
                this.$http
                    .get("machine", {params: q})
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
                    this.$http.delete(`machine/${row.id}`).then(res => {
                        if (res) {
                            this.fetchAllMachine();
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
                this.$notify.success("查看机器更多相相关信息:" + row.id)
            },
            doClose(flag) {
                this.bindVisible = flag;
                this.termVisible = flag
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
