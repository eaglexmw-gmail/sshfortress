<template>
    <el-container>
        <comp-nav-admin v-if="isAdmin"></comp-nav-admin>
        <comp-nav-user v-if="!isAdmin"></comp-nav-user>
        <el-container style="height: 100vh">
            <el-header>
                <el-breadcrumb separator="/">
                    <template v-if="breads">
                        <el-breadcrumb-item v-for="bc in breads" :key="bc" :to="{ name: bc }">
                            {{$t(`${bc}`)}}
                        </el-breadcrumb-item>
                    </template>
                </el-breadcrumb>

                <div class="header-addons">
                    <!--change lange-->
                    <el-dropdown>

                        <span v-text="language" style="margin-right: 2rem;"
                        > </span>
                        <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item>
                                <el-link @click="setLang('zh-CN')" type="success">中文</el-link>
                            </el-dropdown-item>
                            <el-dropdown-item>
                                <el-link @click="setLang('en-US')" type="danger">English</el-link>
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>

                    <el-tooltip content="Help" placement="top">
                        <el-link icon="el-icon-question" class="addon-icon" :underline="false" target="_blank"
                                 href="https://fortress.mojotv.cn/01-01-what-is-fortress.html"></el-link>
                    </el-tooltip>
                    <el-tooltip :content="$t('anyTerm')" placement="top">
                        <el-link icon="el-icon-s-promotion" class="addon-icon" :underline="false" target="_blank"
                                 @click="$router.push({name:'anyTerm'})"></el-link>
                    </el-tooltip>

                    <el-tooltip :content="$t('feedback')" placement="top">
                        <el-link icon="el-icon-s-comment" class="addon-icon" :underline="false"
                                 @click="doFeedback"></el-link>
                    </el-tooltip>

                    <!--用户-->
                    <el-dropdown @command="handleCommand">

                        <img v-if="user" src="@/assets/logo.jpg"
                             style="width: 40px;height: 40px;border: 1px solid #d6d6d6;border-radius: 20px"
                             title="user.email">

                        <i v-if="!user" class="el-icon-setting"></i>
                        <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item command="logout" v-text="$t('userLogout')"></el-dropdown-item>
                            <el-dropdown-item command="updateMyself" v-text="$t('userUpdate')"></el-dropdown-item>
                            <el-dropdown-item command="page" v-text="'Source Code'"></el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>
                </div>

            </el-header>
            <el-main id="felix">
                <router-view></router-view>
            </el-main>
            <!--<el-footer height="30">-->
            <!--<p>Felix's frontend and backend are created by Eric Zhou</p>-->
            <!--<p>more about felix-->
            <!--<el-link type="primary" href="//github.com/dejavuzhou/felix">github.com/dejavuzhou/felix</el-link>-->
            <!--</p>-->
            <!--</el-footer>-->
        </el-container>


        <dialog-form-user :obj="user" type="edit" :visible="dfvMyself" :id="0"
                          @afterClose="afterUpdateMyselfDfClose"></dialog-form-user>

        <dialog-form-feedback :obj="null" type="create" :visible="dfvFeedback"
                              @afterClose="dfvFeedback=false"></dialog-form-feedback>
    </el-container>
</template>

<script>
    import CompNavAdmin from "./CompNavAdmin"
    import CompNavUser from "./CompNavUser"
    import DialogFormUser from "./DialogFormUser"
    import DialogFormFeedback from "./DialogFormFeedback"

    export default {
        components: {CompNavUser, CompNavAdmin, DialogFormUser, DialogFormFeedback},
        name: "Main",
        data() {
            return {
                language:this.getLanguage(),
                dfvFeedback: false,
                dfvMyself: false,
            }
        },
        computed: {
            sid() {
                const urlParams = new URLSearchParams(window.location.search);
                const myParam = urlParams.get('sid');
                return myParam || false;
            },
            code() {
                const urlParams = new URLSearchParams(window.location.search);
                const myParam = urlParams.get('code');
                return myParam || false;
            },
            ref() {
                return `${window.location.origin}${window.location.pathname}${window.location.hash}`
            },
            userNameAndRole() {
                let role = this.$t(`userRole${this.user.role}`);
                let userName = this.user.real_name;
                return `${userName}(${role})`;
            },
            isAdmin() {
                return this.$store.getters.userIsAdmin;
            },
            user() {
                const def = {email: "fortress@mojotv.cn", name: 'Fortress', role: 2 | 4};
                let js = localStorage.getItem("user");
                if (!js) {
                    return def;
                }
                return JSON.parse(js) || def
            },
            breads() {
                return this.$route.meta.breads || null;
            },

        },
        created() {
            let lang = localStorage.getItem("language") || 'en-US';
            this.$i18n.locale = lang;
        },

        mounted() {
            let sid = this.sid;
            if (!sid && this.$route.path === "/") {
                this.$router.push({name: 'machine'});
                return
            }
            if (this.code) {
                window.location.href = `/${window.location.hash}`;
                return
            }

        },
        beforeUpdate() {
            let routeName = this.$route.name;
            console.log(routeName);
            console.log(this.$t(routeName))
            window.document.title = this.$t(routeName)
        },
        methods: {
            getLanguage() {
                let lang = localStorage.getItem("language") || "en-US";
                if (lang.startsWith("zh-")) {
                    return "中文"
                } else {
                    return "English"
                }
            },
            doFeedback() {
                this.dfvFeedback = true;
            },
            afterUpdateMyselfDfClose() {
                this.$forceUpdate();
                this.dfvMyself = false;
            },
            setLang(lang) {
                localStorage.setItem("language", lang);
                this.$i18n.locale = lang;
                this.language = this.getLanguage()
            },
            handleCommand(cmd) {
                if (cmd === "logout") {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    localStorage.removeItem("expire_ts");
                    localStorage.removeItem("expire");
                    this.$router.push({name: "login"});
                } else if (cmd === "email") {
                    window.location.href = `mailto://${this.user.name}`
                }
                else if (cmd === "page") {
                    window.location.href = "https://github.com/mojocn/sshfortress"
                } else if (cmd === "updateMyself") {
                    this.dfvMyself = true;
                }
            },
        }
    }
</script>

<style>
    .header-addons {
        display: flex;
        align-items: center;
    }

    .addon-icon > i {
        margin: auto 20px auto auto;
        font-size: 22px;
    }

</style>