<template>
    <!-- 显示内容 -->
    <div class="article-post-box">
        <!-- 标题 -->
        <div class="article-title-part">
            <el-input
                v-model="article.title"
                maxlength="16"
                minlength="2"
                size="large"
                placeholder="请输入文章标题"
                show-word-limit
                type="text"
            />
        </div>
        <!-- 内容编辑部分 -->
        <div class="article-post-part">
            <mavon-editor 
                v-model="article.content"
                @change="onContentChange"
            />
        </div>
        <!-- 文章设置 -->
        <div class="article-post-settings-part">
            <el-form label-width="100px">
                <el-form-item label="文章分类">
                    <el-select v-model="article.categoryId" placeholder="请选择文章分类">
                        <el-option
                            v-for="item in categories"
                            :key="item.id"
                            :label="item.name" 
                            :value="item.id" />
                    </el-select>
                </el-form-item>
                <el-form-item label="文章摘要">
                    <el-input 
                        type="textarea"
                        rows="2"
                        maxlength="200"
                        show-word-limit
                        v-model="article.summary" />
                </el-form-item>
                <el-form-item label="封面">
                    <div class="article-cover-uploader" @click="showImageSelector">
                        <el-icon v-if="article.cover === ''" class="avatar-uploader-icon"><Plus /></el-icon>
                        <el-image fit="cover" v-else :src="blog_constant.baseUrl + '/portal/image/' +  article.cover"></el-image>
                    </div>
                </el-form-item>
                <el-form-item label="文章标签" class="label-input-box">
                    <el-tag
                        v-for="tag in labels"
                        :key="tag"
                        closable
                        :disable-transitions="false"
                        @close="deleteLabel(tag)"
                    >
                        {{ tag }}
                    </el-tag>
                    <el-input
                        v-if="labelInputVisible"
                        ref="InputRef"
                        v-model="labelNewValue"
                        class="ml-1"
                        @keyup.enter="handleLabelInputConfirm"
                    />
                    <el-button v-if="!labelInputVisible&&!isEnough" class="button-new-tag ml-1" @click="showLabelInput">
                        + 标签
                    </el-button>
                </el-form-item>
            </el-form>
        </div>
        <!-- 发布/草稿/预览 -->
        <div class="article-post-action-bar">
            <el-button plain @click="preView">全屏预览</el-button>
            <el-button plain @click="saveArticleDraft">保存草稿</el-button>
            <el-button type="primary" @click="commitArticle">发布文章</el-button>
        </div>
        <div class="article-post-dialog-box">
            <el-dialog
                v-model="isImageSelectorShow"
                width="50%"
            >
                <div class="image-selector-box">
                    <div class="image-action-bar">
                            <el-upload
                            class="image-selector-uploader"
                            action="/admin/image/article"
                            :show-file-list="false"
                            :on-success="uploadSuccess"
                            :on-error="onUploadError"
                            accept="image/*"
                        >
                            <el-button>上传图片</el-button>
                        </el-upload>
                    </div>
                    <div class="image-selector-list">
                        <el-radio-group v-model="selectImageIndex" >
                            <el-radio-button :label="index" v-for="(item, index) in images" :key="index">
                                <el-image :src="blog_constant.baseUrl + '/portal/image/' + item.url"></el-image>
                            </el-radio-button>
                        </el-radio-group>
                    </div>
                    <div class="image-picker-navigation">
                        <el-pagination 
                            background
                            small
                            @current-change = "onPageChange"
                            v-model:current-page="pageNavigation.currentPage"
                            v-model:page-size="pageNavigation.pageSize" 
                            layout="prev, pager, next" 
                            :total="pageNavigation.totalCount" />
                    </div>
                </div>
                <template #footer>
                    <span class="dialog-footer">
                        <el-button @click="isImageSelectorShow = false">取消</el-button>
                        <el-button type="primary" @click="onImageSelector">
                        确定
                        </el-button>
                    </span>
                </template>
            </el-dialog>
        </div>
    </div>
</template>
<script>  
    import * as api from '../../api/api'

    export default {
        data() {
            return {
                selectImageIndex: 0,
                isImageSelectorShow: false,
                labels: [],
                isEnough: false,
                labelInputVisible: false,
                labelNewValue: '',
                categories: [],
                article: {
                    title: '',
                    content: '',
                    categoryId: '',
                    summary: '',
                    cover: '',
                    label: '',
                    state: '1',
                    type: '1'
                },
                images: [],
                pageNavigation: {
                    currentPage: 1,
                    totalCount: 0,
                    pageSize: 5,
                },
                articleId: this.$route.query.articleId,
            }
        },
        methods: {
            onContentChange(value,render) {
                console.log(value);
                console.log(render);
            },
            preView() {
                
            },
            splitLabels() {
                // 处理标签
                let tempLabels = '';
                this.labels.forEach((item, index) => {
                    tempLabels += item;
                    if (index !== this.labels.length - 1) {
                        tempLabels += '-' 
                    }
                })
                this.article.label = tempLabels;
            },
            saveArticleDraft() {
                // 检查标题
                if (this.article.title === '') {
                    this.$message.error('文章标题不可以为空');
                    return;
                }
                // 处理标签
                if (this.labels !== '') {
                    this.splitLabels();
                } else {
                    this.article.label = '';
                }
                // 修改状态
                this.article.state = '2';
                // 更新 or 新建
                if (this.articleId !== undefined) {
                    api.updateArticleById(this.articleId, this.article).then(result => {
                        if (result.code === api.success_code) {
                            this.$message.success(result.message);
                            this.$router.push({
                                path: '/content/manage-article'
                            })
                        } else {
                            this.$message.error(result.message);
                        }
                    })
                } else {
                    // 
                    api.saveArticleDraft(this.article).then(result => {
                        if (result.code === api.success_code) {
                            this.$message.success(result.message);
                            this.$router.push({
                                path: '/content/manage-article'
                            })
                        } else {
                            this.$message.error(result.message);
                        }
                    })
                }
            },
            commitArticle() {
                // 检查内容 标题 内容 分类 摘要 封面 标签   
                if (this.article.title === '') {
                    this.$message.error('文章标题不可以为空');
                    return;
                }
                if (this.article.content === '') {
                    this.$message.error('文章内容不可以为空');
                    return;
                }
                if (this.article.categoryId === '') {
                    this.$message.error('文章分类不可以为空');
                    return;
                }
                if (this.article.summary === '') {
                    this.$message.error('文章摘要不可以为空');
                    return;
                }
                if (this.article.cover === '') {
                    this.$message.error('文章封面不可以为空');
                    return;
                }
                if (this.labels.length === 0) {
                    this.$message.error('请设置文章标签，方便检索');
                    return;
                }
                // 处理标签
                this.splitLabels();
                // 提交数据
                api.postArticle(this.article).then(result => {
                    if (result.code === api.success_code) {
                        this.$message.success(result.message);
                        this.$router.push({
                            path: '/content/manage-article'
                        })
                    } else {
                        this.$message.error(result.message);
                    }
                })
            },
            onPageChange(page) {
                this.pageNavigation.currentPage = page;
                this.listImages();
            },
            onUploadError() {
                this.$message.error('图片上传失败');
            },
            uploadSuccess(response) {
                if (response.code === api.success_code) {
                    this.$message.success(response.message);
                    this.listImages();
                }
            },
            onImageSelector() {
                this.isImageSelectorShow = false;
                // 从数组中得到图片信息
                let item = this.images[this.selectImageIndex];
                this.article.cover = item.url;

            },
            showImageSelector() {
                // 显示图片选择器
                this.isImageSelectorShow = true;
            },
            deleteLabel(label) {
                // 从数组里删除
                this.labels.splice(this.labels.indexOf(label), 1);
                if (this.labels.length < 5) {
                    this.isEnough = false; 
                    this.labelInputVisible = true;
                }
            },
            handleLabelInputConfirm() {
                // 回车的时候
                if (this.labels.length < 5) {
                    this.labels.push(this.labelNewValue);
                    this.labelNewValue = '';
                }
                if (this.labels.length >= 5) {
                    this.labelInputVisible = false;
                    this.isEnough = true; 
                }
            },
            showLabelInput() {
                // 判断个数 5
                // 控制输入框的显示
                if (this.labels.length < 5) {
                    this.labelInputVisible = true;
                } else {
                    this.labelInputVisible = false;
                }
            },
            listCategories() {
                api.listCategories().then(result => {
                    if (result.code === api.success_code) {
                        this.categories = result.data;
                    }
                })
            },
            listImages() {
                api.listImages(this.pageNavigation.currentPage, this.pageNavigation.pageSize, 'article').then(result => {
                    if (result.code === api.success_code) {
                        this.images = result.data.content;
                        this.pageNavigation.currentPage = result.data.number + 1;
                        this.pageNavigation.totalCount = result.data.totalElements;
                        this.pageNavigation.pageSize = result.data.size;
                    } else {
                        this.$message.error(result.message)
                    }
                })
            },
            getArticle() {
                if (this.articleId !== '') {
                    console.log(this.articleId);
                    api.getArticleById(this.articleId).then(result => {
                        if (result.code === api.success_code) {
                            this.article.title = result.data.title;
                            this.article.content = result.data.content;
                            this.article.categoryId = result.data.categoryId;
                            this.article.summary = result.data.summary;
                            this.article.cover = result.data.cover;
                            this.labels = result.data.labels;
                        } else {
                            this.$message.error(result.message)
                        }
                    })
                }
            }
        },
        mounted() {
            // 获取文章分类
            this.listCategories();
            this.listImages();
            if (this.articleId !== undefined) {
                this.getArticle();
            }
        }
    }
</script>
<style>
    .article-post-part .markdown-body {
        height: 500px;
        margin-bottom: 30px;
    }

    .article-post-settings-part {
        width: 49%;
        margin-bottom: 50px;
    }

    .article-post-action-bar {
        float: right;
        position: fixed;
        bottom: 0;
        right: 40px;
        text-align: right;
        padding: 10px;
    }
    .article-cover-uploader img{
        width: 180px;
        height: 100px;
        border-radius: 8px;
    }
    .article-cover-uploader {
        font-size: 28px;
        color: rgb(106, 132, 161);
        width: 180px;
        height: 100px;
        border-radius: 8px;
        line-height: 100px;
        border: #adc6e8 dashed 2px;
        text-align: center;
        cursor: pointer;
    }
    .label-input-box .el-tag {
        height: 32px;
        margin-right: 15px;
    }
    .label-input-box .ml-1{
        width: 60px;
        height: 32px;
    }
    .article-post-part .v-note-op {
        position: sticky;
        top: 0;
    }
    .image-selector-list img{
        width: 100px;
        height: 100px;
        float: left;
        border-radius: 5px;
        /* margin: 10px; */
    }
    .image-selector-list {
        top: 0;
        line-height: 0;
    }
    /* .article-post-dialog-box .el-dialog__header {
        display: none;
    } */
    .article-post-dialog-box .el-dialog__body {
        padding-top: 0;
        padding-bottom: 0;
    }
    .image-selector-list .el-radio-button__inner,
    .image-selector-list .el-radio-button:first-child .el-radio-button__inner,
    .image-selector-list .el-radio-button:last-child .el-radio-button__inner {
        border: none;
        margin: 6px;
        padding: 4px;
        border-radius: 6px;
    }
    .image-picker-navigation .el-pagination{
        margin-top: 10px;
        justify-content: center;
    }
</style>    