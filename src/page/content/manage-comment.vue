<template>
    <!-- 显示内容 -->
    <div class="comment-box">
        <div class="comment-action-bar">
            <!-- 发表文章、搜索 -->
            <el-form :inline="true">
                <el-form-item>
                    <el-input v-model="search.articleId" placeholder="请输入文章ID" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="doCommentSearch">查询</el-button>
                </el-form-item>
            </el-form>
        </div>
        <div class="comment-list-box">
            
            <el-table 
            :data="comments" 
            style="width: 100%" 
            v-loading="loading"
            element-loading-text="Loading..."
            :element-loading-spinner="svg"
            element-loading-svg-view-box="-10, -10, 50, 50"
            element-loading-background="rgba(122, 122, 122, 0.8)">
                
                <el-table-column fixed show-overflow-tooltip prop="content" label="评论内容" width="200" />
                <el-table-column show-overflow-tooltip prop="articleId" label="评论文章ID" width="190" />
                <el-table-column align="center" label="状态" width="80" >
                    <template v-slot="scope">
                        <div v-if="scope.row.state==='1'">
                            <el-tag type="success" size="">发表中</el-tag>
                        </div>
                        <div v-if="scope.row.state==='3'">
                            <el-tag type="warning" size="">置顶中</el-tag>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column align="center" show-overflow-tooltip prop="userName" label="评论人" width="80" />
                <el-table-column align="center" label="头像" width="75" >
                    <template v-slot="scope">
                        <el-avatar :size="50" :src="scope.row.userAvatar" />
                    </template>
                </el-table-column>
                <el-table-column show-overflow-tooltip prop="userId" label="评论人ID" width="120" />
                <el-table-column show-overflow-tooltip label="评论时间" width="170" >
                    <template v-slot="scope">
                        <span v-text="formatDate(scope.row.createTime)"></span>
                    </template>
                </el-table-column>

                <el-table-column show-overflow-tooltip label="更新时间" width="170" >
                    <template v-slot="scope">
                        <span v-text="formatDate(scope.row.updateTime)"></span>
                    </template>
                </el-table-column>
                <el-table-column fixed="right" label="Operations" width="200">
                    <template v-slot="scope">
                        <el-button type="warning" size="" @click="top(scope.row.id)" round>置顶/取消</el-button>
                        <el-button type="danger" size="" @click="deleteItem(scope.row)" round>删除</el-button>
                    </template>
                </el-table-column>

            </el-table>
        </div>

        <div>
            <div class="page-navigation-box">
                <el-pagination 
                background
                @current-change = "onPageChange"
                v-model:current-page="pageNavigation.currentPage"
                v-model:page-size="pageNavigation.pageSize" 
                layout="prev, pager, next" 
                :total="pageNavigation.totalCount" />
            </div>
        </div>
        
        <div class="comment-dialog-box">
            <!-- 删除提示的dialog -->
            <el-dialog
                v-model="deleteDialogShow"
                title="删除提示"
                width="25%"
            >
                <span>你确定要删除: 
                    <strong style="color:black">{{deleteMessage}} </strong>
                    评论吗？
                </span>
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
                loading: false,
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
                comments: [],
                pageNavigation: {
                    currentPage: 1,
                    totalCount: 0,
                    pageSize: 5,
                },
                deleteDialogShow: false,
                deleteMessage: '',
                deleteTargetId: '',
                comment: {
                    id: '',
                    parentContent: '',
                    articleId: '',
                    state: '',
                    content: '',
                    userId: '',
                    userName: '',
                    userAvatar: '',
                },
                search: {
                    articleId: '',
                },
            }
        },
        methods: {
            top(topId){
                api.topCommentById(topId).then(result => {
                    if (result.code === api.success_code) {
                        this.$message({
                            type: 'success',
                            center: true,
                            message: result.message
                        });
                        this.listComments();
                    } else {
                        this.showWarning(result.message);
                    }
                })
            },
            onPageChange(page) {
                this.pageNavigation.currentPage = page;
                if (this.search.articleId !== '') {
                    this.doCommentSearch();
                }else{
                    this.listComments();
                }
            },
            deleteItem(item) {
                // 不是立马删除，而是提示警告
                this.deleteDialogShow = true;
                this.deleteMessage = item.content;
                this.deleteTargetId = item.id;
                // console.log(item);
            },
            formatDate(dateStr) {
                let date = new Date(dateStr);
                return dateUtils.formatDate(date, 'yyyy-MM-dd hh:mm:ss')
            },
            doDeleteItem() {
                api.deleteCommentById(this.deleteTargetId).then(result => {
                    if (result.code === api.success_code) {
                        this.$message({
                            type: 'success',
                            center: true,
                            message: result.message
                        });
                        this.listComments();
                    }
                });
                this.deleteDialogShow = false;
            },
            doCommentSearch() {
                this.loading = true;
                // 获取特定文章评论列表
                if (this.search.articleId !== '') {
                    api.listCommentsByArticleId(this.search.articleId, this.pageNavigation.currentPage, this.pageNavigation.pageSize).then(result => {
                        console.log(result);
                        if (result.code === api.success_code) {
                            this.handleCommentListResult2(result);
                        } else {
                            this.$message.error(result.message)
                        }
                        this.loading = false;
                    })
                } else {
                    this.listComments();
                }
            },
            handleCommentListResult2(result) {
                if (result.code === api.success_code) {
                    // PageList => contents
                        console.log(result)
                        this.comments = result.data.contents;
                        this.pageNavigation.currentPage = result.data.currentPage;
                        this.pageNavigation.totalCount = result.data.totalCount;
                        this.pageNavigation.pageSize = result.data.pageSize;
                    } else {
                        this.$message.error(result.message)
                    }
                this.loading = false;
            },
            listComments() {
                this.loading = true;
                // 获取评论列表
                api.listComments(this.pageNavigation.currentPage, this.pageNavigation.pageSize).then(result => {
                    if (result.code === api.success_code) {
                        this.handleCommentListResult(result);
                    } else {
                        this.$message.error(result.message)
                    }
                    this.loading = false;
                })
            },
            handleCommentListResult(result) {
                if (result.code === api.success_code) {
                    // Page => content
                        this.comments = result.data.content;
                        this.pageNavigation.currentPage = result.data.number + 1;
                        this.pageNavigation.totalCount = result.data.totalElements;
                        this.pageNavigation.pageSize = result.data.size;
                    } else {
                        this.$message.error(result.message)
                    }
                this.loading = false;
            },
            showWarning(msg) {
                this.$message({
                    message: msg,
                    type: 'warning',
                    center: true
                })
            }
        },
        mounted() {
            // 获取分类列表
            this.listComments();
        },
    }
</script>
<style>
    .el-pagination{
        justify-content: center;
        margin-top: 10px;
    }
    .comment-list-box .el-table {
        min-height: 200px;
    }
</style>