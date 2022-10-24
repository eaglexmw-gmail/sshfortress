
<template>
    <section>
        <el-row justify="space-between" type="flex" class="toolbar" align="middle">
            <el-col :span="6">
                <el-button v-t="{path:'back'}" @click="$router.go(-1)" type="primary" size="small"></el-button>
            </el-col>
            <el-col :span="18"><h2> Sftp: {{user}} @ {{sshIp}}</h2></el-col>
        </el-row>

        <el-tree
                class="sftp-tree"
                :load="loadNode"
                lazy
                :indent="30"
                :default-expanded-keys="['/']"
                :data="data"
                :props="defaultProps"
                node-key="path">
            <el-row :gutter="20" :class="{'custom-tree-node':true,'isdir':data.is_dir}" slot-scope="{ node, data }"
                    justify="center" type="flex">
                <el-col :span="1">
                    <el-link icon="el-icon-folder" type="success" v-if="data.is_dir"></el-link>
                    <el-link icon="el-icon-document-checked" type="primary" v-if="!data.is_dir"></el-link>
                </el-col>
                <el-col :span="4">
                    <i class="file-name">{{ node.label }}</i>

                </el-col>
                <el-col :span="4" title="file size (byte)">
                    <i class="file-size">{{ data.size }}</i>

                </el-col>
                <el-col :span="3" title="mod">
                    <i class="file-mod">{{ data.mod }}</i>

                </el-col>
                <el-col :span="4" title="modify time">
                    <i class="file-time">{{ data.time }}</i>
                </el-col>

                <el-col :span="1">
                    <el-link
                            v-if="data.is_dir"
                            type="warning"
                            title="upload"
                            @click.stop="handleUploadDialog(data)"
                            icon="el-icon-upload">
                    </el-link>
                </el-col>
                <el-col :span="1">

                    <el-link
                            type="success"
                            @click.stop="handleDownload(data)"
                            title="download"
                            icon="el-icon-download">
                    </el-link>
                </el-col>
                <el-col :span="1">
                    <el-link
                            v-if="!data.is_dir"
                            type="primary"
                            title="cat"
                            @click.stop="handleSftpCat(data)"
                            icon="el-icon-view">
                    </el-link>
                </el-col>
                <el-col :span="1">
                    <el-link
                            v-if="node.level != 1"
                            type="danger"
                            @click.stop="handleDelete(data)"
                            title="rm"
                            icon="el-icon-delete-solid">

                    </el-link>
                </el-col>
                <el-col :span="1">
                    <el-link
                            v-if="node.level != 1"
                            title="rename"
                            type="info"
                            @click.stop="handleRename(data)"
                            icon="el-icon-edit">
                    </el-link>
                </el-col>
                <el-col :span="1">
                    <el-link
                            title="mkdir"
                            v-if="data.is_dir"
                            type="primary"
                            @click.stop="handleMkdir(data)"
                            icon="el-icon-folder-add">
                    </el-link>
                </el-col>
            </el-row>
        </el-tree>

        <el-dialog
                :title="dUploadTitle"
                :visible.sync="uploadDialogVisible"
                width="30%"
                center>
            <el-upload
                    name="file"
                    multiple
                    :on-error="handleUploadError"
                    :on-success="handleUploadSuccess"
                    :action="uploadUrl"
                    :file-list="fileList">
                <el-button size="small" type="primary" v-text="$t('upload')"></el-button>
                <div slot="tip" class="el-upload__tip" v-text="$t('uploadTip')"></div>
            </el-upload>
        </el-dialog>

        <el-dialog
                :title="dFileViewTitle"
                :visible.sync="catDialogVisible"
                width="50%"
                center>
            <pre v-text="catData" class="cat-view"></pre>
        </el-dialog>

    </section>


</template>


<script>
    export default {
        name: "ViewSftp",
        props: ['id', 'sshIp', 'user'],
        data() {
            return {
                dUploadTitle: "",
                dFileViewTitle: "",
                logData: "",
                uploadUrl: '',
                fileList: [],
                catDialogVisible: false,
                catData: "",
                uploadDialogVisible: false,
                logDialogV: false,
                data: [{name: "$HOME", path: "~", is_dir: true}, {name: "/", path: "/", is_dir: true}],
                path: "",
                defaultProps: {
                    label: 'name',
                    isLeaf(data) {
                        return !data.is_dir
                    }
                }
            };
        },
        mounted() {
        },
        created() {
        },
        methods: {
            loadNode(node, resolve) {
                if (node.level === 0) {
                    return resolve([
                        {name: "$HOME", path: "$HOME", is_dir: true},
                        {name: "/", path: "/", is_dir: true}
                    ]);
                } else {
                    let path = node.data.path;
                    this.$http
                        .get(`sftp/${this.id}`, {params: {path}})
                        .then(res => {
                            if (res) {
                                resolve(res.data)
                            }
                        })
                }
            },
            handleSftpCat(data) {
                let path = data.path;
                this.$http.get(`sftp/${this.id}/cat`, {params: {path}}).then(res => {
                    if (res) {
                        this.catData = res.data;
                    }
                    this.dFileViewTitle = this.$t('fileViewTitle', {path});
                    this.catDialogVisible = true
                })
            },
            handleUploadSuccess(res, file) {
                if (!res.ok) {
                    this.$message.error(res.msg + file.name)
                }
            },
            handleUploadError(err, file) {
                this.$message.error(err + file.name)
            },
            handleDelete(data) {
                let path = data.path;
                let dirOrFile = data.is_dir ? "dir" : "file";
                this.$http.get(`sftp/${this.id}/rm`, {params: {path, dirOrFile}}).then(res => {
                    if (res) {
                        this.$message.success(path + " has been deleted!")
                    }
                })
            },
            handleMkdir(data) {
                this.$prompt(data.path, 'mkdir', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    inputPlaceholder: data.path
                }).then(({value}) => {
                    let path = `${data.path}/${value}`;
                    this.$http.get(`sftp/${this.id}/mkdir`, {params: {path}}).then(res => {
                        if (res) {
                            this.$message.success(path + " has been made!")
                        }
                    })
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: 'mkdir command has been canceled'
                    });
                });
            },
            handleRename(data) {
                this.$prompt(data.path, this.$t("renameOrMove"), {
                    confirmButtonText: this.$t('OK'),
                    cancelButtonText: this.$t('Cancel'),
                    inputValue: data.path
                }).then(({value}) => {
                    let opath = data.path;
                    let npath = value;
                    this.$http.get(`sftp/${this.id}/rename`, {params: {opath, npath}}).then(res => {
                        if (res) {
                            this.$message.success(opath + " has been rename to " + npath)
                        }
                    })
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: 'rename command has been canceled'
                    });
                });

            },
            handleDownload(data) {
                let token = this.$store.getters.jwt;
                let type = data.is_dir ? "dir" : 'file';
                window.open(`/api/sftp/${this.id}/dl?path=${data.path}&type=${type}&_t=${token}`, '_blank');
            },
            handleUploadDialog(data) {
                this.dUploadTitle = this.$t('uploadTitle', data);
                let token = this.$store.getters.jwt;
                this.uploadDialogVisible = true;
                this.uploadUrl = `/api/sftp/${this.id}/up?path=${data.path}&_t=${token}`
            }

        }
    };
</script>
<style scoped>

    .custom-tree-node {
        width: 100%;
    }

    .sftp-tree {
        border-radius: 4px;
        color: white;
        padding: 30px;
        background: black;
        margin: 40px 30px 30px 30px;
    }

    .el-col > a {
        margin-right: 20px;
    }

    .file-name {
        margin: 8px !important;
    }

    .isdir {
        font-weight: lighter;
    }


</style>