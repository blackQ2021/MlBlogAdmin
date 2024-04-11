<template>
    <!-- 显示内容 -->
    <div class="loop-box">
        <div class="loop-action-bar">
            <el-button type="primary" size="" @click="showAddLoop">添加轮播图</el-button>
        </div>
        <div class="loop-list-box">
            <el-table 
            :data="loops" 
            style="width: 100%" 
            v-loading="loading"
            element-loading-text="Loading..."
            :element-loading-spinner="svg"
            element-loading-svg-view-box="-10, -10, 50, 50"
            element-loading-background="rgba(122, 122, 122, 0.8)">
                <el-table-column label="标题" width="180" >
                    <template v-slot="scope">
                        <a class="loop-title" :href="scope.row.targetUrl" target="_blank">{{scope.row.title}}</a>
                    </template>
                </el-table-column>
                <el-table-column label="轮播图" width="165" >
                    <template v-slot="scope">
                        <el-image class="loop-image" :src="scope.row.imageUrl" fit="contain" />
                    </template>
                </el-table-column>
                <el-table-column align="center" label="状态" width="80" >
                    <template v-slot="scope">
                        <div v-if="scope.row.state==='0'">
                            <el-tag type="danger" size="">禁用</el-tag>
                        </div>
                        <div v-if="scope.row.state==='1'">
                            <el-tag type="success" size="">正常</el-tag>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column show-overflow-tooltip prop="id" label="ID" width="190" />
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
        <div class="loop-dialog-box">
            <!-- 删除提示的dialog -->
            <el-dialog
                v-model="deleteDialogShow"
                title="删除提示"
                width="25%"
            >
                <span>你确定要删除: {{deleteMessage}} 轮播图吗？</span>
                <template #footer>
                    <span class="dialog-footer">
                        <el-button @click="deleteDialogShow = false">取消</el-button>
                        <el-button type="primary" @click="doDeleteItem()">
                        确定
                        </el-button>
                    </span>
                </template>
            </el-dialog>
            <el-dialog
                v-model="loopDialogShow"
                :title="loopEditorTitle"
                width="35%"
                :close-on-click-modal=false
            >
                <div>
                    <el-form
                        label-position="left"
                        label-width="100px"
                    >
                        <el-form-item label="轮播图标题">
                            <el-input v-model="loop.title" />
                        </el-form-item>
                        <el-form-item label="目标链接">
                            <el-input v-model="loop.targetUrl" />
                        </el-form-item>
                        <el-form-item label="顺序">
                            <el-input-number v-model="loop.order" :min="1" :max="50" />
                        </el-form-item>
                        <el-form-item label="状态">
                            <el-select v-model="loop.state" placeholder="请选择状态">
                                <el-option label="禁用" value="0" />
                                <el-option label="正常" value="1" />
                            </el-select>
                        </el-form-item>
                        <el-form-item label="封面">
                             <el-upload
                                class="avatar-uploader"
                                action="/admin/image/loop"
                                :show-file-list="false"
                                :on-success="uploadSuccess"
                                :before-upload="beforeUpload"
                            >
                                <el-image fit="cover" v-if="loop.imageUrl !== ''" :src="loop.imageUrl" class="avatar" />
                                <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
                            </el-upload>
                        </el-form-item>
                    </el-form>
                </div>
                <template #footer>
                <span class="dialog-footer">
                    <el-button @click="onEditorClose">取 消</el-button>
                    <el-button type="primary" @click="handleLoopEditorCommit">
                    {{loopEditorDialogCommitText}}
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
                loopEditorTitle: '添加轮播图',
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
                loops: [],
                loop: {
                    id: '',
                    order: 1,
                    state: '1',
                    title: '',
                    targetUrl: '',
                    imageUrl: ''     
                },
                deleteLoopId: ''
            }
        },
        methods: {
            onEditorClose() {
            this.loopDialogShow = false;
            if (this.loopEditorTitle === '更新轮播图') {
                this.resetLoop();
            }
            },
            doDeleteItem() {
                // 通过ID删除图片
                api.deleteLoopById(this.deleteLoopId).then(result => {
                    if (result.code === api.success_code) {
                        this.deleteDialogShow = false;
                        this.$message.success(result.message);
                        this.listLoop();
                    }
                })
            },
            handleLoopEditorCommit() {
                // 添加记录
                // 检查数据
                if (this.loop.title === '') {
                    this.$message.error('标题不可以为空');
                    return;
                }
                if (this.loop.targetUrl === '') {
                    this.$message.error('目标链接不可以为空');
                    return;
                }
                if (!this.loop.targetUrl.startsWith('http://') && !this.loop.targetUrl.startsWith('https://')) {
                    this.$message.error('目标链接不正确');
                    return;
                }
                if (this.loop.imageUrl === '') {
                    this.$message.error('轮播图不可以为空');
                    return;
                }
                // 没有ID就是添加
                if (this.loop.id === '') {
                    // 提交数据
                    api.postLoop(this.loop).then(result => {
                        this.loopDialogShow = false;
                        if (result.code === 20000) {
                            this.resetLoop();
                            this.$message.success(result.message);
                            // 更新列表
                            this.listLoop();
                        } else {
                            this.$message.error(result.message);
                        }
                    })
                } else {
                    // 更新
                    api.updateLoop(this.loop.id, this.loop).then(result => {
                        if (result.code === api.success_code) {
                            this.loopDialogShow = false;
                            this.resetLoop();
                            this.listLoop();
                            this.$message.success(result.message);
                        }
                    })
                }
                
            },
            resetLoop() {
                this.loop.id = '',
                this.loop.order = 1,
                this.loop.state = '1',
                this.loop.title = '',
                this.loop.targetUrl = '',
                this.loop.imageUrl = ''   
            },
            beforeUpload() {
                console.log('beforeUpload');  
            },
            uploadSuccess(response, file, fileList) {
                // console.log(response);
                // console.log(file);
                // console.log(fileList);
                if (response.code === 20000) {
                    // 上传图片
                    // 回显图片
                    // 
                    this.loop.imageUrl = this.blog_constant.baseUrl + '/portal/image/' + response.data.id;
                    this.$message.success(response.message)
                } else {
                    this.$message.error(response.message)
                }
            },
            edit(item) {
                // console.log(item);
                // 数据回显
                this.loopEditorDialogCommitText = '修 改'
                this.loopEditorTitle = '更新轮播图'
                this.loopDialogShow = true
                this.loop.id = item.id
                this.loop.order = item.order
                this.loop.state = item.state
                this.loop.title = item.title
                this.loop.targetUrl = item.targetUrl
                this.loop.imageUrl = item.imageUrl
            },
            showAddLoop() { 
                this.loopEditorDialogCommitText = '添 加',
                this.loopEditorTitle = '添加轮播图',
                this.loopDialogShow = true;
            },
            deleteItem(item) {
                this.deleteMessage = item.title;
                this.deleteLoopId = item.id;
                this.deleteDialogShow = true;          
            },
            formatDate(dateStr) {
                let date = new Date(dateStr);
                return dateUtils.formatDate(date, 'yyyy-MM-dd hh:mm:ss')
            },
            listLoop() {
                this.loading = true;
                api.listLoop().then(result => {
                    this.loading = false;
                    if (result.code === api.success_code) {
                        this.loops = result.data;
                    } 
                })
            }
        },
        mounted() {
            this.listLoop();
        },  
    }
</script>
<style>
    .loop-title {
        text-decoration: none;
    }
    .loop-image {
        width: 140px;
        height: 90px;
        padding: 2px;
        border-radius: 8px;
        border: rgb(189, 180, 195) solid 1px;
    }

    .loop-dialog-box .avatar-uploader .avatar-uploader-icon {
        font-size: 28px;
        color: rgb(106, 132, 161);
        width: 100px;
        height: 100px;
        border-radius: 8px;
        line-height: 100px;
        border: #adc6e8 dashed 2px;
        text-align: center;
    }

    .loop-dialog-box .el-upload img {
        width: 100px;
        height: 100px;
    }
</style>