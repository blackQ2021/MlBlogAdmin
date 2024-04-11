<template>
    <!-- 显示内容 -->
    <div class="image-box">
        <div class="image-search-bar">
            <!-- 图片归属搜索 -->
            <el-form :inline="true">
                <el-form-item>
                    <el-select v-model="search" placeholder="请选择图片归属">
                        <el-option label="文章" value="article" />
                        <el-option label="头像" value="avatar" />
                        <el-option label="友情链接" value="link" />
                        <el-option label="轮播图" value="loop" />
                        <el-option label="所有图片" value="" />
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="doArticleSearch">查询</el-button>
                </el-form-item>
            </el-form>
        </div>


        <div class="image-action-bar">
            <el-button type="danger" @click="checkTrash">回收站</el-button>
        </div>


        <div class="image-action-bar">
            <el-upload
                class="image-selector-uploader"
                action="/admin/image/article"
                :show-file-list="false"
                :on-success="uploadSuccess"
                :on-error="onUploadError"
                accept="image/*"
            >
                <el-button type="success">上传<a style="color:brown">文章</a>图片</el-button>
            </el-upload>
        </div>
        
        <div class="image-list-box">
            <el-table 
            :data="images" 
            style="width: 100%" 
            v-loading="loading"
            element-loading-text="Loading..."
            :element-loading-spinner="svg"
            element-loading-svg-view-box="-10, -10, 50, 50"
            element-loading-background="rgba(122, 122, 122, 0.8)">
                <el-table-column show-overflow-tooltip prop="name" label="图片名称" width="180" />
                <el-table-column label="图片" width="165" >
                    <template v-slot="scope">
                        <el-image class="image-image" :src="this.blog_constant.baseUrl + '/portal/image/' + scope.row.url" fit="contain" />
                    </template>
                </el-table-column>
                <!-- <el-table-column prop="original" align="center" label="图片分类" width="80" /> -->
                <el-table-column align="center" label="图片分类" width="80">
                    <template v-slot="scope">
                        <div v-if="scope.row.original==='loop'">
                            <el-tag type="warning" size="">轮播图</el-tag>
                        </div>
                        <div v-else-if="scope.row.original==='avatar'">
                            <el-tag type="warning" size="">头像</el-tag>
                        </div>
                        <div v-else-if="scope.row.original==='link'">
                            <el-tag type="warning" size="">友情链接</el-tag>
                        </div>
                        <div v-else-if="scope.row.original==='article'">
                            <el-tag type="warning" size="">文章</el-tag>
                        </div>
                        <div v-else>
                            <el-tag type="warning" size="">{{scope.row.original}}</el-tag>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column show-overflow-tooltip prop="path" label="路径" width="200" />
                <el-table-column show-overflow-tooltip prop="id" label="ID" width="190" />
                <el-table-column show-overflow-tooltip label="创建时间" width="120" >
                    <template v-slot="scope">
                        <span v-text="formatDate(scope.row.createTime)"></span>
                    </template>
                </el-table-column>

                <el-table-column show-overflow-tooltip label="更新时间" width="120" >
                    <template v-slot="scope">
                        <span v-text="formatDate(scope.row.updateTime)"></span>
                    </template>
                </el-table-column>
                
                <el-table-column align="center" fixed="right" label="操作" width="100">
                    <template v-slot="scope">
                        <el-button type="danger" v-if="this.state === '0'" size="" @click="deleteItem(scope.row)" round>彻底删除</el-button>
                        <el-button type="success" v-if="this.state === '0'" size="" @click="recoverImage(scope.row.id)"  round>还原</el-button>
                        <el-button type="danger" v-else size="" @click="deleteItem(scope.row)" round>删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="image-picker-navigation">
            <el-pagination 
                background
                medium
                @current-change = "onPageChange"
                v-model:current-page="pageNavigation.currentPage"
                v-model:page-size="pageNavigation.pageSize" 
                layout="prev, pager, next" 
                :total="pageNavigation.totalCount" />
        </div>        
        <div class="loop-dialog-box">
            <!-- 删除提示的dialog -->
            <el-dialog
                v-model="deleteDialogShow"
                title="删除提示"
                width="25%"
            >
                <span>你确定要删除: <strong style="color:black">{{deleteMessage}}</strong> 图片吗？</span>
                <template #footer>
                    <span class="dialog-footer">
                        <el-button @click="deleteDialogShow = false">取消</el-button>
                        <el-button type="primary" @click="doDeleteItem()">
                        确定
                        </el-button>
                    </span>
                </template>
            </el-dialog>
        </div>
    </div>
</template>
<script>
    import * as api from '../../api/api';
    import * as dateUtils from '../../utils/date';

    export default {
        data() {
            return {
                deleteDialogShow: false,
                deleteMessage: '',
                loopEditorDialogCommitText: '添加',
                loopEditorTitle: '添加图片',
                loopDialogShow: false,
                svg: `
                    <path class="path" d="
                    M 30 15
                    L 28 17
                    M 25.61 25.61
                    A 15 15, 0, 0, 1, 15 30
                    A 15 15, 0, 1, 1, 27.99 7.5
                    L 15 15
                    " style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
                `,
                loading: false,
                images: [],
                image: {
                    id: '',
                    name: '',
                    url: '',
                    content_type: ''     
                },
                deleteImageId: '',
                pageNavigation: {
                    currentPage: 1,
                    totalCount: 0,
                    pageSize: 5,
                },
                search: 'article',
                state: '',
                recover: '',
            }
        },
        methods: {
            doDeleteItem() {
                // 通过ID删除图片
                api.deleteImageById(this.deleteImageId, this.recover).then(result => {
                    if (result.code === api.success_code) {
                        this.deleteDialogShow = false;
                        this.$message.success(result.message);
                        if (this.state === '0') {
                            this.checkTrash();
                        } else {
                            this.listImage();
                        }
                    } else {
                        this.showWarning(result.message);
                    }
                })
            },
            recoverImage(imageId) {
                this.recover = '1';
                this.deleteImageId = imageId;
                this.doDeleteItem();
            },
            onPageChange(page) {
                this.pageNavigation.currentPage = page;
                if(this.state === '0') {
                    this.checkTrash();
                } else {
                    this.listImage();
                }
            },
            beforeUpload() {
                console.log('beforeUpload');  
            },
            onUploadError() {
                this.$message.error('图片上传失败');
            },
            uploadSuccess(response) {
                if (response.code === api.success_code) {
                    this.$message.success(response.message);
                    this.listImage();
                }
            },
            deleteItem(item) {
                this.recover = '';
                this.deleteMessage = item.name;
                this.deleteImageId = item.id;
                this.deleteDialogShow = true;          
            },
            formatDate(dateStr) {
                let date = new Date(dateStr);
                return dateUtils.formatDate(date, 'yyyy-MM-dd hh:mm:ss')
            },
            listImage() {
                this.loading = true;
                this.state = '';
                api.listImages(this.pageNavigation.currentPage, this.pageNavigation.pageSize, this.search, this.state).then(result => {
                    if (result.code === api.success_code) {
                        this.images = result.data.content;
                        this.pageNavigation.currentPage = result.data.number + 1;
                        this.pageNavigation.totalCount = result.data.totalElements;
                        this.pageNavigation.pageSize = result.data.size;
                        this.loading = false;
                    } else {
                        this.$message.error(result.message)
                    }
                })
            },
            checkTrash() {
                this.loading = true;
                this.state = '0';
                api.listImages(this.pageNavigation.currentPage, this.pageNavigation.pageSize, '', this.state).then(result => {
                    if (result.code === api.success_code) {
                        this.images = result.data.content;
                        this.pageNavigation.currentPage = result.data.number + 1;
                        this.pageNavigation.totalCount = result.data.totalElements;
                        this.pageNavigation.pageSize = result.data.size;
                        this.loading = false;
                    } else {
                        this.$message.error(result.message)
                    }
                })
            },
            doArticleSearch() {
                this.listImage();
            }
        },
        mounted() {
            this.listImage();
        },  
    }
</script>
<style>
    .image-title {
        text-decoration: none;
    }
    .image-image {
        width: 140px;
        height: 90px;
        padding: 2px;
        border-radius: 8px;
        border: rgb(189, 180, 195) solid 1px;
    }

    .image-dialog-box .avatar-uploader .avatar-uploader-icon {
        font-size: 28px;
        color: rgb(106, 132, 161);
        width: 100px;
        height: 100px;
        border-radius: 8px;
        line-height: 100px;
        border: #adc6e8 dashed 2px;
        text-align: center;
    }

    .image-dialog-box .el-upload img {
        width: 100px;
        height: 100px;
    }
    .image-action-bar {
        float:right;
        margin-right: 10px;
    }
    .image-search-bar {
        margin-top: 5px;
        float:left;
    }
</style>