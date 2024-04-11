<template>
    <!-- 显示内容 -->
    <div class="settings-web-info-box">
        <el-form
            label-position="right"
            label-width="100px"
            style="max-width: 400px"
        >
            <el-form-item label="网站标题">
                <el-input v-model="websiteTitle" />
            </el-form-item>
            <el-form-item label="网站关键字">
                <el-input v-model="keywords" placeholder="关键字 “,” 用隔开" />
            </el-form-item>
            <el-form-item label="网站描述">
                <el-input type="textarea" :rows="3" v-model="description" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="updateSeoInfo">更 新</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>
<script>
    import * as api from '../../api/api'

    export default {
        data() {
            return {
                websiteTitle: '',
                keywords: '',
                description: '',
                oldInfo: {
                    websiteTitle: '',
                    keywords: '',
                    description: ''
                }
            }
        },
        methods: {
            updateSeoInfo() {
                // 检查数据
                if (this.websiteTitle === '') {
                    this.$message.error('网站标题不可以为空');
                    return;
                }
                if (this.keywords === '') {
                    this.$message.error('关键词不可以为空');
                    return;
                }
                if (this.description === '') {
                    this.$message.error('网站描述不可以为空');
                    return;
                }
                let isSeoInfoUpdate = false;
                if (this.description !== this.oldInfo.description || this.keywords !== this.oldInfo.keywords) {
                    // seo关键字或描述不一样
                    isSeoInfoUpdate = true;
                    api.updateSeoInfo(this.description, this.keywords).then(result => {
                    if (result.code === api.success_code) {
                        // 更新成功
                        this.$message.success(result.message);
                        this.getWebsiteTitle();
                    }
                })
                }
                // 如果是更新SEO信息，就不做标题更新提示
                // 提交数据
                if (this.websiteTitle !== this.oldInfo.websiteTitle) {
                    api.updateWebsiteTitle(this.websiteTitle).then(result => {
                        if (result.code === api.success_code) {
                            if (!isSeoInfoUpdate) {
                                this.$message.success(result.message);           
                            }
                            this.getWebsiteTitle();
                        }
                    })
                }
            },
            getWebsiteInfo() {
                api.getSeoInfo().then(result => {
                    if (result.code === api.success_code) {
                        this.keywords = result.data['web_site_keywords'];
                        this.description = result.data['web_site_description'];
                        this.oldInfo.keywords = this.keywords;
                        this.oldInfo.description = this.description;
                    }
                });
            },
            getWebsiteTitle() {
                api.getWebsiteTitle().then(result => {
                    if (result.code === api.success_code) {
                        this.websiteTitle = result.data.value;
                        this.oldInfo.websiteTitle = this.websiteTitle;
                    }
                })
            }
        },
        mounted() {
            this.getWebsiteInfo();
            this.getWebsiteTitle();
        },
    }
</script>
<style>
    /* .settings-web-info-box {

    } */
</style>