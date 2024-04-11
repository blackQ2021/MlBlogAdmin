<template>
    <!-- 后台登录入口，只有登录，没有注册，也没有找回密码 -->
    <!-- 只有门户一个用户入口，如果是管理员则跳转到管理中心，否则，跳转到首页/重定向的页面 -->
    <!-- 如果是门户的登录，则有登录、注册、找回密码这些功能. -->
    <!-- 显示内容 -->
    <div class="admin-login-box">
        <!-- 顶部内容 -->
        <div class="admin-login-header-box">
            <div class="admin-login-header-center center">
                <div class="admin-login-logo">
                    博客系统|登录
                </div>
            </div>
        </div>
        <!-- 中间内容 -->
        <div class="admin-login-center-box center">
            <div class="center login-center-box">
                <el-col :span="10">
                    <el-form
                        label-width="75px"                       
                        style="max-width: 460px"
                        class="login-center-form-box"
                    >
                        <el-form-item label="账号">
                            <el-input v-model="inisUser.userName" placeholder="用户名/邮箱" />
                        </el-form-item>
                        <el-form-item label="密码">
                            <el-input v-model="inisUser.password" placeholder="请输入密码" />
                        </el-form-item>
                        <el-form-item label="验证码">
                            <el-input v-model="loginInfo.verifyCode" placeholder="请输入验证码"  @keypress.enter="doLogin" />
                            <img :src="captchaPath" alt="" @click="updateVerifyCode" class="captcha-code">
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" @click="doLogin">登 录</el-button>
                        </el-form-item>
                    </el-form>
                </el-col>
            </div>
        </div>
        <!-- 底部内容 -->
        
    </div>
</template>
<script>
    import { doLogin, success_code } from '../../api/api';
    export default {
        data() {
            return {
                inisUser: {
                    userName: '',
                    password: '',
                },
                loginInfo: {
                    verifyCode: '',
                    captcha_key: ''
                },
                captchaPath: '',
            }
        },
        methods: {
            toastE(msg) {
                this.$message({
                    message: msg,
                    center: true,
                    type: 'error'
                });
            },
            doLogin() {
                // 发起登录
                if (this.inisUser.userName === '') {
                    this.toastE('用户名不能为空');
                    return;
                }
                if (this.inisUser.password === '') {
                    this.toastE('密码不能为空');
                    return;
                }
                if (this.loginInfo.verifyCode === '') {
                    this.toastE('验证码不能为空');
                    return;
                }
                // 向服务器提交数据
                // 处理结果
                // Send a POST request
                doLogin(this.loginInfo.verifyCode, this.loginInfo.captcha_key, this.inisUser).then(result => {
                    // 处理登录结果
                    // 判断状态
                    if (result.code === success_code) {
                        this.$message({
                        message: result.message,
                        center: true,
                        type: 'success'
                        });
                        // 如果是成功
                        //成功则跳转--->判断角色，如果普通用户，跳转到门户首页，如果是管理员，跳转到管理中心
                        this.$router.push({path: '/index'})
                    } else {
                        // 更新验证码
                        this.updateVerifyCode();
                        this.toastE(result.message);
                    }
                    //其他,就给出提示 
                });
            },
            updateVerifyCode() {
                this.captchaPath = '/user/captcha?captcha_key=' + this.loginInfo.captcha_key + "&random=" + Date.parse(new Date());
                console.log(this.captchaPath)
            }
        },
        mounted() {
            // 检查登录是否有效
            // 如果已经登录，就跳转到对应的页面
            this.loginInfo.captcha_key = Date.parse(new Date());
            this.updateVerifyCode();
        },
    }

</script>
<style>
    .captcha-code {
        cursor: pointer;
        width: 100px;
        height: 32px;
        left: 110%;
        position: absolute;
    }

    .admin-login-header-box {
        width: 100%;
        height: 60px;
        background: rgb(86, 197, 211);
        margin-bottom: 20px;
    }

    .center {
        margin: 0 auto;
        width: 55%;
    }
    
    .admin-login-header-center{
        line-height: 60px;

    }

    .admin-login-logo {
        color: rgb(100, 114, 115);
        font-size: 25px;
        font-weight: 600;
    }

    .login-center-box {
        border-radius: 10px;
        padding: 20px;
        width: 100%;
        background: rgb(201, 201, 228);
        box-shadow: 0 1px 10px rgba(150, 186, 229, 0.818);
    }

    .login-center-form-box label {
        background: #b5d2d7;
        border-radius: 20px;
        box-shadow: 0 5px 10px rgba(130, 237, 210, 0.818);
        margin-right: 15px;
        padding: 0 0 0 0;
        justify-content: space-around;
        align-items: flex-end;
    }

    .el-form-item__content button{
        margin-left: 15px;
    }
</style>