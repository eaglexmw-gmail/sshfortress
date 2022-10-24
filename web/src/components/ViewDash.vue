<template>
    <div>
        <el-row :gutter="15">

            <el-col :span="12">
                <iframe src="http://pan.mojotv.cn:3000/d-solo/cJOZ0cOWk/mojotvFortress?orgId=1&theme=light&panelId=10"
                        frameborder="0"></iframe>
            </el-col>
            <el-col :span="12">
                <iframe src="http://pan.mojotv.cn:3000/d-solo/cJOZ0cOWk/mojotvFortress?orgId=1&theme=light&panelId=2"
                        frameborder="0"></iframe>
            </el-col>

        </el-row>

        <el-row :gutter="15">

            <el-col :span="24">
                <iframe src="http://pan.mojotv.cn:3000/d-solo/cJOZ0cOWk/mojotvFortress?orgId=1&theme=light&panelId=4"
                        frameborder="0"></iframe>
            </el-col>



        </el-row>
        <el-row :gutter="15">


            <el-col :span="12">
                <iframe src="http://pan.mojotv.cn:3000/d-solo/cJOZ0cOWk/mojotvFortress?orgId=1&theme=light&panelId=6"
                        frameborder="0"></iframe>
            </el-col>


            <el-col :span="12">
                <iframe src="http://pan.mojotv.cn:3000/d-solo/cJOZ0cOWk/mojotvFortress?orgId=1&theme=light&panelId=14"
                        frameborder="0"></iframe>
            </el-col>

        </el-row>
        <el-row :gutter="15">
            <el-col :span="12">
                <iframe src="http://pan.mojotv.cn:3000/d-solo/cJOZ0cOWk/mojotvFortress?orgId=1&theme=light&panelId=8"
                        frameborder="0"></iframe>
            </el-col>
            <el-col :span="12">
                <iframe src="http://pan.mojotv.cn:3000/d-solo/cJOZ0cOWk/mojotvFortress?orgId=1&theme=light&panelId=12"
                        frameborder="0"></iframe>
            </el-col>


        </el-row>


    </div>

</template>

<script>
    //todo:: 添加控制面板
    export default {
        name: "ViewDash"
    }
</script>

<style scoped>
    .el-row {
        margin-bottom: 15px !important;
    }

    .el-col {
    }
    iframe {
        /*border-radius: 2px;*/
        border: 1px solid #d7dae2 !important;
        box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 12px 0px;
        width: 100%;
        height: 40vh;
        /*pointer-events: none;*/
    }
</style>