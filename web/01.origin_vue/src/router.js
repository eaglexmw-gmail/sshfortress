import Vue from "vue";
import Router from "vue-router";
import ViewLogin from "@/components/ViewLogin";
import Main from "@/components/Main";
import ViewSftp from "@/components/ViewSftp";
import ViewSshLog from "@/components/ViewSshLog";
import ViewUser from "@/components/ViewUser";
import ViewMachine from "@/components/ViewMachine";
import ViewClusterSsh from "@/components/ViewClusterSsh";
import ViewSigninLog from "@/components/ViewSigninLog";
import ViewSftpLog from "@/components/ViewSftpLog";
import ViewFeedback from "@/components/ViewFeedback";
import ViewClusterJumper from "@/components/ViewClusterJumper";
import ViewDash from "@/components/ViewDash";
import ViewFilterGroup from "@/components/ViewFilterGroup";
import ViewAnyTerm from "@/components/ViewAnyTerm";
import ViewConfig from "@/components/ViewConfig";

Vue.use(Router);

const vueRouter = new Router({
    mode: "hash",
    routes: [
        {
            path: "/any-term",
            name: "anyTerm",
            component: ViewAnyTerm,
        },
        {
            path: "/login",
            name: "login",
            component: ViewLogin,
        },
        {
            path: "/",
            name: "main",
            meta: {
                title: "Home"
            },
            component: Main,
            //redirect: {name: 'sshList'},
            children: [
                {
                    path: "sftp/:id/:sshIp/:user",
                    name: "sftp",
                    props: true,
                    meta: {
                        breads: ['main', 'machine', 'sftp'],
                    },
                    component: ViewSftp
                },
                {
                    path: "ssh-log",
                    name: "sshLog",
                    meta: {
                        breads: ['main', 'sshLog'],
                    },
                    component: ViewSshLog
                },
                {
                    path: "dash",
                    name: "dash",
                    meta: {
                        breads: ['main', 'dash'],
                    },
                    component: ViewDash
                },
                {
                    path: "feedback",
                    name: "feedback",
                    meta: {
                        breads: ['main', 'feedback'],
                    },
                    component: ViewFeedback
                },
                {
                    path: "sftp-log",
                    name: "sftpLog",
                    meta: {
                        breads: ['main', 'sftpLog'],
                    },
                    component: ViewSftpLog
                },
                {
                    path: "user",
                    name: "user",
                    meta: {
                        breads: ['main', 'user'],
                    },
                    component: ViewUser
                },
                {
                    path: "machine",
                    name: "machine",
                    meta: {
                        breads: ['main', 'machine'],
                    },
                    component: ViewMachine
                },
                {
                    path: "signin-log",
                    name: "signinLog",
                    meta: {
                        breads: ['main', 'signinLog'],
                    },
                    component: ViewSigninLog
                },
                {
                    path: "cluster-ssh",
                    name: "clusterSsh",
                    meta: {
                        breads: ['main', 'clusterSsh'],
                    },
                    component: ViewClusterSsh
                },
                {
                    path: "config",
                    name: "config",
                    meta: {
                        breads: ['main', 'config'],
                    },
                    component: ViewConfig
                },
                {
                    path: "cluster-jumper",
                    name: "clusterJumper",
                    meta: {
                        breads: ['main', 'clusterJumper'],
                    },
                    component: ViewClusterJumper
                },
                {
                    path: "filter-group",
                    name: "filterGroup",
                    meta: {
                        breads: ['main', 'filterGroup'],
                    },
                    component: ViewFilterGroup
                },

            ]
        }
    ]
});


export default vueRouter;
