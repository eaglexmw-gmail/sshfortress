<template>
    <el-aside width="200">
        <el-menu :default-openeds="['1','2']" router>

            <el-submenu index="1">
                <template slot="title"><i class="el-icon-c-scale-to-original"></i>{{$t('remoteControl')}}</template>
                <el-menu-item-group>
                    <template slot="title">Ssh & Sftp helper</template>
                    <!--<el-menu-item index="/dash">{{$t('dash')}}</el-menu-item>-->
                    <el-menu-item index="/machine">{{$t('machineList')}}</el-menu-item>
                </el-menu-item-group>
            </el-submenu>
            <el-submenu index="2">
                <template slot="title"><i class="el-icon-film"></i>{{$t('audit')}}</template>
                <el-menu-item-group>
                    <template slot="title">{{$t('audit')}}</template>
                    <el-menu-item index="/ssh-log" v-text="$t('sshLog')"></el-menu-item>
                </el-menu-item-group>
            </el-submenu>
        </el-menu>
    </el-aside>
</template>

<script>
    //普通用户:需要展示的导航栏
    export default {
        name: "CompNavUser"
    }
</script>

<style scoped>

</style>