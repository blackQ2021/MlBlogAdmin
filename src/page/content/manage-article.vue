<template>
    <!-- 显示内容 -->
    <div class="article-list-box">
        <div class="article-action-bar">
            <!-- 发表文章、搜索 -->
            <el-form :inline="true">
                <el-form-item>
                    <el-input v-model="search.keyword" placeholder="请输入标题关键字" />
                </el-form-item>
                <el-form-item>
                    <el-select v-model="search.state" placeholder="请选择状态">
                        <el-option label="已删除" value="0" />
                        <el-option label="已发布" value="1" />
                        <el-option label="草稿" value="2" />
                        <el-option label="置顶" value="3" />
                        <el-option label="所有状态" value="" />
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-select v-model="search.categoryId" placeholder="请选择文章分类">
                        <el-option
                            v-for="item in categories"
                            :key="item.id"
                            :label="item.name" 
                            :value="item.id" />
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="doArticleSearch">查询</el-button>
                    <el-button type="danger" @click="cleanSearch">清除</el-button>
                </el-form-item>
            </el-form>
        </div>
        <div class="article-list-part">
            <el-table 
            :data="articles" 
            style="width: 100%" 
            v-loading="loading"
            element-loading-text="Loading..."
            :element-loading-spinner="svg"
            element-loading-svg-view-box="-10, -10, 50, 50"
            element-loading-background="rgba(122, 122, 122, 0.8)">
                <el-table-column fixed show-overflow-tooltip prop="title" label="文章标题" width="150" />
                <el-table-column show-overflow-tooltip prop="id" label="ID" width="190" />
                <el-table-column align="center" label="状态" width="100" >
                    <template v-slot="scope">
                        <div v-if="scope.row.state==='0'">
                            <el-tag type="danger" size="">已删除</el-tag>
                        </div>
                        <div v-if="scope.row.state==='1'">
                            <el-tag type="success" size="">已发布</el-tag>
                        </div>
                        <div v-if="scope.row.state==='2'">
                            <el-tag type="info" size="">草稿</el-tag>
                        </div>
                        <div v-if="scope.row.state==='3'">
                            <el-tag type="warning" size="">置顶</el-tag>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column show-overflow-tooltip prop="summary" label="摘要" width="250" />
                <el-table-column align="center" prop="viewCount" label="浏览量" width="120" />
                <el-table-column label="创建时间" width="170" >
                    <template v-slot="scope">
                        <span v-text="formatDate(scope.row.createTime)"></span>
                    </template>
                </el-table-column>

                <el-table-column label="更新时间" width="170" >
                    <template v-slot="scope">
                        <span v-text="formatDate(scope.row.updateTime)"></span>
                    </template>
                </el-table-column>
                <el-table-column fixed="right" label="Operations" width="200">
                    <template v-slot="scope">
                        <el-button type="success" size="" @click="edit(scope.row)" round>编辑</el-button>
                        <el-button type="danger" size="" v-if="scope.row.state!=='0'" @click="deleteItem(scope.row)" round>删除</el-button>
                        <el-button type="danger" size="" v-if="scope.row.state==='0'" @click="deleteItem(scope.row)" disabled round>删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="article-page-navigation">
            <el-pagination 
            background
            @current-change = "onPageChange"
            v-model:current-page="pageNavigation.currentPage"
            v-model:page-size="pageNavigation.pageSize" 
            layout="prev, pager, next" 
            :total="pageNavigation.totalCount" />
        </div>
        <div class="article-dialog-part">
            <!-- 删除提示的dialog -->
            <el-dialog
                v-model="deleteDialogShow"
                title="删除提示"
                width="25%"
            >
                <span>你确定要删除: {{deleteMessage}} 文章吗？</span>
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
                articles: [],
                article: {
                    title: '',
                    cover: '',
                    state: '',
                    categoryId: '',
                    labels: '',
                    summary: '',
                    content: ''
                },
                search: {
                    keyword: '',
                    state: '',
                    categoryId: ''
                },
                categories: [],
                pageNavigation: {
                    currentPage: 1,
                    totalCount: 0,
                    pageSize: 8,
                },
                deleteDialogShow: false,
                deleteTargetId: ''
            }
        },
        methods: {
            listCategories() {
                api.listCategories().then(result => {
                    if (result.code === api.success_code) {
                        this.categories = result.data;
                        this.categories.push({
                            id: '',
                            name: '所有分类'
                        })
                    }
                })
            },
            cleanSearch() {
                this.search.categoryId = '';
                this.search.state = '';
                this.search.keyword = '';
                this.listArticles();
            },
            doArticleSearch() {
                this.listArticles();
            },
            listArticles() {
                this.loading = true;
                // 获取文章列表
                api.listArticles(this.pageNavigation.currentPage, this.pageNavigation.pageSize, this.search.state, this.search.keyword, this.search.categoryId).then(result => {
                    this.handleArticleListResult(result);
                });
            },
            handleArticleListResult(result) {
                if (result.code === api.success_code) {
                        this.articles = result.data.contents;
                        this.pageNavigation.currentPage = result.data.currentPage;
                        this.pageNavigation.totalCount = result.data.totalCount;
                        this.pageNavigation.pageSize = result.data.pageSize;
                    } else {
                        this.$message.error(result.message)
                    }
                this.loading = false;
                console.log(this.pageNavigation)
            },
            onPageChange(page) {
                this.pageNavigation.currentPage = page;
                this.listArticles();
            },
            formatDate(dateStr) {
                let date = new Date(dateStr);
                return dateUtils.formatDate(date, 'yyyy-MM-dd hh:mm:ss')
            },
            deleteItem(item) {
                // 不是立马删除，而是提示警告
                this.deleteDialogShow = true;
                this.deleteMessage = item.title;
                this.deleteTargetId = item.id;
            },
            doDeleteItem() {
                api.deleteArticle(this.deleteTargetId).then(result => {
                    if (result.code === api.success_code) {
                        this.$message({
                            type: 'success',
                            center: true,
                            message: result.message
                        });
                        this.listArticles();
                    }
                });
                this.deleteDialogShow = false;
            },

            // -----------------
            edit(item) {
                console.log(item.id);
                this.$router.push({
                    path: '/content/post-article',
                    query: {articleId: item.id},
                })
            }
        },
        mounted() {
            this.listCategories();
            this.listArticles();
        },
    }
</script>
<style>
    .article-page-navigation{
        margin-top: 20px;
    }

    .article-page-navigation .el-pagination{
        justify-content: center;
    }     
</style>