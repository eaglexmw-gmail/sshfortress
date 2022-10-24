<template>
    <el-aside width="200">
        <el-menu :default-openeds="['1','2','3']" router>
            <el-submenu index="1">
                <template slot="title"><i class="el-icon-s-grid"></i>{{$t('systemManage')}}</template>
                <el-menu-item-group>
                    <template slot="title">{{$t('cluster')}}</template>
                    <!--<el-menu-item index="/dash">{{$t('dash')}}</el-menu-item>-->
                    <el-menu-item index="/config">{{$t('config')}}</el-menu-item>
                    <el-menu-item index="/cluster-ssh">{{$t('clusterSsh')}}</el-menu-item>
                    <el-menu-item index="/cluster-jumper">{{$t('clusterJumper')}}</el-menu-item>
                    <el-menu-item index="/machine">{{$t('machineList')}}</el-menu-item>
                    <el-menu-item index="/filter-group">{{$t('filterGroup')}}</el-menu-item>

                </el-menu-item-group>

            </el-submenu>
            <el-submenu index="2">
                <template slot="title"><i class="el-icon-user"></i>{{$t('authAdmin')}}</template>
                <el-menu-item-group>
                    <template slot="title">{{$t('userAdmin')}}</template>
                    <el-menu-item index="/user">{{$t('userList')}}</el-menu-item>
                    <el-menu-item index="/feedback">{{$t('feedback')}}</el-menu-item>
                </el-menu-item-group>
            </el-submenu>


            <el-submenu index="3">
                <template slot="title"><i class="el-icon-video-camera-solid"></i>{{$t('audit')}}</template>
                <el-menu-item-group>
                    <template slot="title">{{$t('audit')}}</template>
                    <el-menu-item index="/ssh-log" v-text="$t('sshLog')"></el-menu-item>
                    <el-menu-item index="/sftp-log" v-text="$t('sftpLog')"></el-menu-item>
                    <el-menu-item index="/signin-log" v-text="$t('signinLog')"></el-menu-item>
                </el-menu-item-group>
            </el-submenu>
        </el-menu>
    </el-aside>
</template>

<script>
    //管理员需要展示的导航栏
    export default {
        name: "CompNavAdmin"
    }
</script>

<style scoped>

</style>