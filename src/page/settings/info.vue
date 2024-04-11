<template>
    <!-- 显示内容 -->
    <div class="setting-user-info-box">
        <div class="user-info-part-list">
            <el-form
            v-if="userInfo!==null"
            label-width="120px"
            class="demo-ruleForm"
        >
            <el-form-item label="用户ID">
                <el-input v-model="userInfo.id" type="text" disabled/>
            </el-form-item>
            <el-form-item label="邮箱地址">
                <el-input
                    v-model="userInfo.email"
                    type="text"
                    autocomplete="off"
                    disabled
                />
                <el-form-item>
                    <el-button type="primary" class="update-email-btn" @click="toUpdateEmailPage">修改邮箱</el-button>
                </el-form-item>
            </el-form-item>
            <el-form-item label="头像">
                <el-avatar  @click="showAvatarDialog" :src="userInfo.avatar" class="user-info-avatar"></el-avatar>
            </el-form-item>
            <el-form-item label="用户名">
                <el-input
                    v-model="userInfo.userName"
                    type="text"
                    autocomplete="off"
                />
            </el-form-item>
            <el-form-item label="签名">
                <el-input type="text" v-model="userInfo.sign" autocomplete="off" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="updateUserInfo"
                    >修改用户信息</el-button
                >
            </el-form-item>
        </el-form>
        </div>
        <div class="user-info-dialog">
            <avatar-upload field="file"
                @crop-upload-success="cropUploadSuccess"
                @crop-upload-fail="cropUploadFail"
                v-model="showAvatarCutter"
                :width="300"
                :height="300"
                url="/admin/image/avatar"
                img-format="png"></avatar-upload>
        </div>
    </div>
</template>
<script>
    import * as api from '../../api/api';
    import avatarUpload from 'vue-image-crop-upload';

    export default {
        components: {
            'avatar-upload': avatarUpload
        },
        data() {
            return {
                lastUserName: '',
                showAvatarCutter: false,
                userInfo: null
            }
        },
        methods: {
            showAvatarDialog() {
                this.showAvatarCutter = true;

            },
            cropUploadSuccess(response) {
                // this.showAvatarCutter = false;
				if (response.code === api.success_code) {
                    // 上传成功
                    this.$message.success(response.message);
                    this.userInfo.avatar = this.blog_constant.baseUrl + '/portal/image/' + response.data.id;
                } else {
                    this.$message.error(response.message);
                }
            },
            cropUploadFail(){
                this.$message.error('上传失败');
			},
            getUserInfo() {
                api.checkToken().then(result => {
                    if (result.code === api.success_code) {
                        this.userInfo = result.data;
                        this.lastUserName = this.userInfo.userName;
                    } else {
                        this.$message.error(result.message)
                    }
                })
            },
            updateUserInfo() {
                if (this.userInfo.userName === '') {
                    this.$message.error('用户名不能为空')
                }
                // 检查数据
                // 检查用户名是否重复
                if (this.lastUserName === this.userInfo.userName) {
                    this.doUpdateUserInfo();
                } else {
                    api.checkUserName(this.userInfo.userName).then(result => {
                        if (result.code === api.failed_code ) {
                            // 说明成功
                            this.doUpdateUserInfo();
                        } else {
                            this.$message.error('用户名已存在')
                        }
                    })
                }
                
            },
            doUpdateUserInfo() {
                // 头像不可以为空
                if (this.userInfo.avatar === '') {
                    this.$message.error('头像不能为空')
                }
                api.updateuserInfo(this.userInfo, this.userInfo.id).then(result => {
                    if (result.code === api.success_code) {
                        this.getUserInfo();
                        this.$message.success(result.message)
                    } else {
                        this.$message.error(result.message)
                    }
                })
            },
            toUpdateEmailPage() {
                this.$router.push({
                    path: '/settings/email'
                })
            }
        },
        mounted() {
            this.getUserInfo();
        },
    }
</script>
<style>
    .user-info-avatar {
        cursor: pointer;
    }

    .update-email-btn {
        position: absolute;
        margin-left: 30px;
    }

    .setting-user-info-box {
        width: 30%;
    }
</style>