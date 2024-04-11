<template>
    <!-- 显示内容 -->
    <div class="setting-email-box">
        <el-row>
            <el-col :span="8">
                <el-form
                    label-width="120px"
                >
                    <el-form-item
                        label="新邮箱地址"
                    >
                        <el-input v-model="newEmail" />
                        <el-form-item>
                            <el-button v-if="!isCountDowning" type="primary" class="email-verify-code" @click="getVerifyCode">获取验证码</el-button>
                            <el-button v-else type="primary" class="email-verify-code" @click="getVerifyCode" disabled>
                                {{countDownText}}
                            </el-button>
                        </el-form-item>
                    </el-form-item>
                    <el-form-item
                        label="验证码"
                    >
                        <el-input v-model="verifyCode" />
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="updateEmailAddress">修改邮箱</el-button>
                    </el-form-item>
                </el-form>
            </el-col>
        </el-row>
    </div>
</template>
<script>
    import * as api from '../../api/api'

    export default {
        data() {
            return {
                isCountDowning: false, 
                newEmail: '',
                verifyCode: '',
                countDownText: '重新发送(60)'
            }
        },
        methods: {
            getVerifyCode() {
                // 校验邮箱地址
                let reg = /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/
                if (!reg.test(this.newEmail)) {
                    this.$message.error('邮箱地址格式错误');
                    return;
                }
                // 倒计时
                // 发起请求
                api.getVerifyCode(this.newEmail, 'update').then(result => {
                    if (result.code === api.success_code) {
                        this.startCountDown();
                        this.$message.success(result.message)
                    } else {
                        this.$message.error(result.message)
                    }
                })
                // 禁止按钮可以使用，开始倒计时
            },
            startCountDown() {
                let time = 60;
                this.isCountDowning = true;
                let that = this;
                let interval = setInterval(function () {
                    time--;
                    if (time <= 0) {
                        that.isCountDowning = false;
                        clearInterval(interval);
                    }
                    // console.log('倒计时 ==> ' + time)
                    that.countDownText = '重新发送(' + time + ')';
                }, 1000);
            },
            updateEmailAddress() {
                // 内容校验
                if (this.newEmail === '') {
                    this.$message.error('邮箱地址不可以为空');
                    return;
                }
                if (this.verifyCode === '') {
                    this.$message.error('验证码不可以为空');
                    return;
                }
                api.updateEmailAddress(this.newEmail, this.verifyCode).then(result => {
                    console.log(result);
                    if (result.code === api.success_code) {
                        // 更新成功
                        // 给出toast
                        this.$message.success(result.message)
                        // 重置表单
                        this.verifyCode = '';
                        this.newEmail = '';
                        this.isCountDowning = false;
                    } else {
                        this.verifyCode = '';
                        this.$message.error(result.message);
                    }
                });
            }
        },
    }
</script>
<style>
    .email-verify-code {
        position: absolute;
        margin-left: 30px;
    }

    .setting-email-box .el-row {
        margin-top: 30px;
    }
</style>