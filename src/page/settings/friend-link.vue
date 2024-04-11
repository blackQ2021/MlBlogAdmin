<template>
    <div class="settings-friend-link-box">
        <div class="friend-link-action-bar">
            <el-button type="primary" @click="showFriendLinkDialog">添加友情链接</el-button>
        </div>
        <div class="friend-link-list-box">
            <el-table 
            :data="links" 
            style="width: 100%" 
            v-loading="loading"
            element-loading-text="Loading..."
            :element-loading-spinner="svg"
            element-loading-svg-view-box="-10, -10, 50, 50"
            element-loading-background="rgba(122, 122, 122, 0.8)">
                <el-table-column fixed label="网站名称" width="170" >
                    <template v-slot="scope">
                        <a class="friend-link-name" :href="scope.row.url" target="_blank">{{scope.row.name}}</a>
                    </template>
                </el-table-column>
                <el-table-column prop="id" label="ID" width="180" />

                <el-table-column label="logo" width="100" >
                    <template v-slot="scope" >
                        <div class="friend-link-logo-bar">
                            <el-image class="friend-link-logo" :src="blog_constant.baseUrl + scope.row.logo" fit="contain" />
                        </div>
                    </template>
                </el-table-column>

                <el-table-column label="状态" width="80" >
                    <template v-slot="scope">
                        <div v-if="scope.row.state==='0'">
                            <el-tag type="danger" size="">禁用</el-tag>
                        </div>
                        <div v-if="scope.row.state==='1'">
                            <el-tag type="success" size="">正常</el-tag>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="order" label="顺序" width="80" />
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
                        <el-button type="danger" size="" @click="deleteItem(scope.row)" round>删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="friend-link-dialog-box">
            <el-dialog
                v-model="friendLinkDialogShow"
                :title="friendEditorTitle"
                width="35%"
                :close-on-click-modal=false
            >
                <div>
                    <el-form
                        label-position="left"
                        label-width="100px"
                    >
                        <el-form-item label="友链名称">
                            <el-input v-model="link.name" />
                        </el-form-item>
                        <el-form-item label="目标链接">
                            <el-input v-model="link.url" />
                        </el-form-item>
                        <el-form-item label="顺序">
                            <el-input-number v-model="link.order" :min="1" :max="50" />
                        </el-form-item>
                        <el-form-item label="状态">
                            <el-select v-model="link.state" placeholder="请选择状态">
                                <el-option label="禁用" value="0" />
                                <el-option label="正常" value="1" />
                            </el-select>
                        </el-form-item>
                        <el-form-item label="logo">
                            <div class="friend-link-image-upload" @click="showLinkLogoDialog ">
                                <el-icon v-if="link.logo === ''" class="avatar-uploader-icon"><Plus /></el-icon>
                                <el-image v-else :src="blog_constant.baseUrl + link.logo"></el-image>
                            </div>
                        </el-form-item>
                    </el-form>
                </div>
                <template #footer>
                <span class="dialog-footer">
                    <el-button @click="onEditorClose">取 消</el-button>
                    <el-button type="primary" @click="handleLoopEditorCommit">
                    {{friendLinkEditorDialogCommitText}}
                    </el-button>
                </span>
                </template>
            </el-dialog>
            <!-- 删除提示的dialog -->
            <el-dialog
                v-model="deleteDialogShow"
                title="删除提示"
                width="25%"
            >
                <span>你确定要删除: {{deleteMessage}} 友情链接吗？</span>
                <template #footer>
                    <span class="dialog-footer">
                        <el-button @click="deleteDialogShow = false">取消</el-button>
                        <el-button type="primary" @click="doDeleteItem()">
                        确定
                        </el-button>
                    </span>
                </template>
            </el-dialog>
            <!-- logo -->
            <avatar-upload field="file"
                @crop-upload-success="cropUploadSuccess"
                @crop-upload-fail="cropUploadFail"
                v-model="showLinkLogoCutter"
                :width="150"
                :height="70"
                url="/admin/image/link"
                img-format="png"></avatar-upload>
        </div>
    </div>    
</template>
<script>
    import * as api from '../../api/api';
    import * as dateUtils from '../../utils/date';
    import avatarUpload from 'vue-image-crop-upload';

    export default {
        components: {
            'avatar-upload': avatarUpload
        },
        data() {
            return {
                showLinkLogoCutter: false,
                friendLinkEditorDialogCommitText: '',
                friendEditorTitle: '',
                friendLinkDialogShow: false,
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
                links: [],
                link: {
                    id: '',
                    name: '',
                    logo: '',
                    order: 0,
                    state: '1',
                    url: ''
                },
                targetDeleteLinkId: '',
                deleteDialogShow: false,
                deleteMessage: ''
            }
        },
        methods: {
            doDeleteItem() {
                api.deleteFriendLink(this.targetDeleteLinkId).then(result => {
                    if (result.code === api.success_code) {
                        this.$message.success(result.message);
                        this.listLinks();
                        this.deleteDialogShow = false;
                        this.targetDeleteLinkId = '';
                    } else {
                        this.$message.error(result.message);
                    }
                })
            },
            deleteItem(item) {
                this.targetDeleteLinkId = item.id;
                this.deleteMessage = item.name;
                this.deleteDialogShow = true;
            },
            edit(item) {
                this.friendLinkEditorDialogCommitText = '更 新';
                this.friendEditorTitle = '更新友情链接';
                // 回显数据
                this.link.id = item.id;
                this.link.name = item.name;
                this.link.logo = item.logo;
                this.link.order = item.order;
                this.link.state = item.state;
                this.link.url = item.url;
                // 弹窗
                this.friendLinkDialogShow = true;
            },
            showLinkLogoDialog() {
                this.showLinkLogoCutter = true;
            },
            cropUploadSuccess(response) {
                // this.showAvatarCutter = false;
				if (response.code === api.success_code) {
                    // 上传成功
                    this.$message.success(response.message);
                    this.link.logo = '/portal/image/' + response.data.id;
                } else {
                    this.$message.error(response.message);
                }
            },
            cropUploadFail(){
                this.$message.error('logo上传失败');
			},
            listLinks() {
                api.listFriendLinks().then(result => {
                    console.log(result)
                    if (result.code === api.success_code) {
                        this.links = result.data;
                    }
                });
            },
            formatDate(dateStr) {
                let date = new Date(dateStr);
                return dateUtils.formatDate(date, 'yyyy-MM-dd hh:mm:ss')
            },
            showFriendLinkDialog() {
                this.friendLinkEditorDialogCommitText = '添 加',
                this.friendEditorTitle = '添加友情链接',
                this.friendLinkDialogShow = true;
            },
            onEditorClose() {
                this.friendLinkDialogShow = false;
                if (this.friendEditorTitle === '更新友情链接') {
                    this.resetLink();
                }
            },
            handleLoopEditorCommit() {
                // 添加
                // 检查内容
                if (this.link.name === '') {
                    this.$message.error('链接名称不能为空');
                    return;
                }
                if (this.link.name === '') {
                    this.$message.error('友情链接不能为空');
                    return;
                }
                if (this.link.logo === '') {
                    this.$message.error('logo不能为空');
                    return;
                }
                if (this.link.id !== '') {
                    // 更新
                    // 提交数据
                    api.updateFriendLink(this.link, this.link.id).then(result => {
                    if (result.code === api.success_code) {
                        this.friendLinkDialogShow = false;
                        this.$message.success(result.message);
                        this.listLinks();
                        this.resetLink();
                    } else {
                        this.$message.error(result.message);
                    }
                })
                } else {
                    api.postFriendLink(this.link).then(result => {
                    if (result.code === api.success_code) {
                        this.friendLinkDialogShow = false;
                        this.$message.success(result.message);
                        this.listLinks();
                        this.resetLink();
                    } else {
                        this.$message.error(result.message);
                    }
                })
                }
            },
            resetLink() {
                this.link.name = '';
                this.link.logo = '';
                this.link.order = 1;
                this.link.state = '1';
                this.link.url = '';
            }
        },
        mounted() {
            this.listLinks();
        },
    }
</script>
<style scoped>
    .friend-link-logo-bar {
        height: 35px;
        text-align: center;
        border-radius: 6px;
        border: rgb(189, 180, 195) dashed 2px;
    }
    .friend-link-logo {
        height: 34px;
        border-radius: 8px;
    }
    .friend-link-name {
        text-decoration: none;
    }
    .friend-link-action-bar {
        margin-bottom: 10px;
    }
    .friend-link-image-upload {
        font-size: 28px;
        color: rgb(106, 132, 161);
        width: 150px;
        height: 70px;
        border-radius: 8px;
        line-height: 70px;
        border: #adc6e8 dashed 2px;
        text-align: center;
        cursor: pointer;
    }
</style>