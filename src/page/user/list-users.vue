<template>
    <!-- 显示内容 -->
    <div class="user-list-box">
        <!-- 搜索部分 -->
        <div class="user-search-pat">
              <el-form :inline="true" size="" class="demo-form-inline">
                <el-form-item label="用户名">
                    <el-input v-model="search.userName" placeholder="请输入用户名" />
                </el-form-item>
                <el-form-item label="邮箱地址">
                    <el-input v-model="search.email" placeholder="请输入邮箱地址" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="doSearch">搜 索</el-button>
                    <el-button type="danger" @click="cleanSearch">清 空</el-button>
                </el-form-item>
            </el-form>
        </div>
        <div class="list-box margin-bottom">
            <el-table 
            :data="userList" 
            style="width: 100%" 
            v-loading="loading"
            element-loading-text="Loading..."
            :element-loading-spinner="svg"
            element-loading-svg-view-box="-10, -10, 50, 50"
            element-loading-background="rgba(122, 122, 122, 0.8)">
                <el-table-column fixed label="头像" width="75" >
                    <template v-slot="scope">
                        <el-avatar :size="50" :src="scope.row.avatar" />
                    </template>
                </el-table-column>
                <el-table-column show-overflow-tooltip="hidden" fixed prop="userName" label="用户名" width="120" />
                <el-table-column show-overflow-tooltip="hidden" prop="id" label="ID" width="190" />
                <el-table-column align="center" label="状态" width="70" >
                    <template v-slot="scope">
                        <div v-if="scope.row.state==='0'">
                            <el-tag type="danger" size="">禁用</el-tag>
                        </div>
                        <div v-if="scope.row.state==='1'">
                            <el-tag type="success" size="">正常</el-tag>
                        </div>
                    </template>
                </el-table-column>                            
                <el-table-column show-overflow-tooltip="hidden" label="签名" width="200" >
                    <template v-slot="scope">
                        <div v-if="scope.row.sign">
                            <span v-text="scope.row.sign"></span>
                        </div>
                        <div v-else>
                            <span>这个人很懒，什么也没有写...</span>
                        </div>
                    </template>
                </el-table-column> 
                <el-table-column show-overflow-tooltip="hidden" prop="email" label="邮箱" width="200" />
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
                        <el-button type="success" size="" @click="resetPassword(scope.row)" round>重置密码</el-button>
                        <el-button type="danger" size="" v-if="scope.row.state!=='0'" @click="deleteItem(scope.row)" round>删除</el-button>
                        <el-button type="danger" size="" v-if="scope.row.state==='0'" @click="deleteItem(scope.row)" disabled round>删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="page-navigation-box">
            <el-pagination 
            background
            @current-change = "onPageChange"
            v-model:current-page="pageNavigation.currentPage"
            v-model:page-size="pageNavigation.pageSize" 
            layout="prev, pager, next" 
            :total="pageNavigation.totalCount" />
        </div>
        <div class="user-list-dialog-box">
            <!-- 删除提示的dialog -->
            <el-dialog
                v-model="deleteDialogShow"
                title="删除提示"
                width="25%"
            >
                <span>你确定要删除: {{deleteUserName}} 用户吗？</span>
                <template #footer>
                    <span class="dialog-footer">
                        <el-button @click="deleteDialogShow = false">取消</el-button>
                        <el-button type="primary" @click="doDeleteItem()">
                        确定
                        </el-button>
                    </span>
                </template>
            </el-dialog>
            <!-- 重置密码的dialog -->
            <el-dialog
                v-model="resetPasswordDialogShow"
                title="密码重置"
                width="25%"
            >
                <div class="reset-password-box">
                    <span><h3>修 改：{{targetResetUserName}} 用户的密码</h3></span>
                    <el-form label-width="" size="">
                        <el-form-item label="新密码">
                            <el-input type="password" v-model="resetPasswordValue" placeholder="请输入新密码" />
                        </el-form-item>
                    </el-form>
                </div>
                <template #footer>
                    <span class="dialog-footer">
                        <el-button @click="resetPasswordDialogShow = false">取消</el-button>
                        <el-button type="primary" @click="doResetPassword()">
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
    import { hex_md5 } from '../../utils/md5'

    export default {
        data() {
            return {
                search: {
                    userName: '',
                    email: ''
                },
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
                userList: [],
                pageNavigation: {
                    currentPage: 1,
                    totalCount: 0,
                    pageSize: 5,
                },
                deleteDialogShow: false,
                deleteUserName: '',
                targetDeleteUserId: '',
                resetPasswordDialogShow: false,
                resetPasswordValue: '',
                targetResetUserName: '',
                targetResetUserId: ''
            }
        },
        methods: {
            doResetPassword() {
                if (this.resetPasswordValue === '') {
                    this.$message.error('新密码不能为空');
                    return;
                }
                api.resetPassword(this.targetDeleteUserId, hex_md5(this.resetPasswordValue)).then(result => {
                    if (result.code === api.success_code) {
                        this.resetPasswordDialogShow = false;
                        this.$message.success(result.message)
                    } else {
                        this.$message.error(result.message)
                    }
                })
            },
            doDeleteItem() {
                api.deleteUserById(this.targetDeleteUserId).then(result => {
                    this.deleteDialogShow = false;  
                    if (result.code === api.success_code) {
                        this.$message.success(result.message);
                        this.listUsers();
                    } else {
                        this.$message.error(result.message)
                    }
                }) 
            },
            onPageChange(page) {
                this.pageNavigation.currentPage = page;
                this.listUsers();
            },
            doSearch() {
                api.doUserSearch(this.search.userName, this.search.email).then(result => {
                    this.loading = true;             
                    this.handleUserListResult(result);               
                });
            },
            cleanSearch() {
                this.search.userName = '';
                this.search.email = '';
                this.listUsers();
            },
            deleteItem(item) {
                this.targetDeleteUserId = item.id;
                this.deleteUserName = item.userName;
                this.deleteDialogShow = true;
            },
            resetPassword(item) {   
                this.resetPasswordDialogShow = true;
                this.targetResetUserName = item.userName;
                this.targetResetUserId = item.id;
            },
            listUsers() {
                this.loading = true;
                api.listUsers(this.pageNavigation.currentPage, this.pageNavigation.pageSize).then(result => {
                    this.handleUserListResult(result);
                })
            },
            handleUserListResult(result) {
                if (result.code === api.success_code) {
                        this.userList = result.data.content;
                        this.pageNavigation.currentPage = result.data.number + 1;
                        this.pageNavigation.totalCount = result.data.totalElements;
                        this.pageNavigation.pageSize = result.data.size;
                    } else {
                        this.$message.error(result.message)
                    }
                this.loading = false;
                console.log(this.pageNavigation)
            },
            formatDate(dateStr) {
                let date = new Date(dateStr);
                return dateUtils.formatDate(date, 'yyyy-MM-dd hh:mm:ss')
            }
        },
        mounted() {
            this.listUsers();
        },
    }

</script>
<style scoped>
    .el-pagination{
        justify-content: center;
    }

    .reset-password-box h3{
        margin-bottom: 25px;
        font-size: 20px;
    }
</style>