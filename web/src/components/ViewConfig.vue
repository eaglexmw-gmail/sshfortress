<template>
    <div>
        <el-row type="flex" justify="start" align="middle" class="toolbar">
            <el-button type="primary" size="small" @click="$router.go(-1)">{{$t('back')}}</el-button>

            <div class="search-bar">
                <el-input v-model="q.remark"
                          @blur="fetchAllConfig"
                          class="table-search-input"
                          prefix-icon="el-icon-search"
                          size="small"
                          placeholder="search description"
                          clearable>
                </el-input>
                <el-input v-model.trim="q.key"
                          class="table-search-input"
                          @blur="fetchAllConfig"
                          prefix-icon="el-icon-search"
                          size="small"
                          placeholder="search key"
                          clearable>
                </el-input>
                <el-input v-model.trim="q.value"
                          class="table-search-input"
                          @blur="fetchAllConfig"
                          prefix-icon="el-icon-search"
                          size="small"
                          placeholder="search value"
                          clearable>
                </el-input>
                <el-button type="primary" size="small"
                           icon="el-icon-search"
                           @click="fetchAllConfig"
                           :title="$t('btnSearch')">
                </el-button>
            </div>

        </el-row>
        <el-table :data="tableData" border style="width: 100%" stripe size="mini" cell-class-name="fortress-cell">
            <el-table-column fixed prop="id" label="ID" :width="$store.state.idWidth">
            </el-table-column>
            <el-table-column :label="$t('configKey')" prop="key"></el-table-column>
            <el-table-column :label="$t('configValue')" prop="value"></el-table-column>
            <el-table-column :label="$t('configRemark')" prop="remark"></el-table-column>

            <el-table-column fixed="right" :label="$t('action')" width="120">
                <template slot-scope="scope">
                    <el-button-group>
                        <el-button
                                :title="$t('btnEdit')"
                                @click="openDialogForm(scope.row,'edit')"
                                type="success"
                                size="mini"
                                v-text="$t('btnEdit')"
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

        <dialog-form-config :obj="form"
                            :type="dfType"
                            :visible="dfV"
                            :id="0"
                            @afterClose="doRefresh"></dialog-form-config>

    </div>
</template>

<script>
    import DialogFormConfig from './DialogFormConfig'

    export default {
        components: {DialogFormConfig},
        name: 'ViewConfig',
        data() {

            return {
                q: {key: "", value: "", remark: ""},
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
            this.fetchAllConfig();
        },

        methods: {
            doRefresh() {
                this.dfV = false;
                if (this.dfType !== 'view') {
                    this.fetchAllConfig();
                }
            },
            pageChange(val) {
                this.page = val;
                this.fetchAllConfig()
            },
            sizeChange(val) {
                this.page = 1;
                this.size = val;
                this.fetchAllConfig()
            },
            fetchAllConfig() {
                let q = this.q;
                q.page = this.page;
                q.size = this.size;
                this.$http
                    .get("config", {params: q})
                    .then(resp => {
                        if (resp) {
                            this.total = resp.total;
                            this.size = resp.size;
                            this.page = resp.page;
                            this.tableData = resp.data
                        }
                    })
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
