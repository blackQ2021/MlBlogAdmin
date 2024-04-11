<template>
    <!-- 显示内容 -->
    <div class="category-box">
        <div class="category-action-bar">
            <el-button type="primary" @click="showAddCategory" round>添加分类</el-button>
        </div>
        <div class="category-list-box">
            <el-table 
            :data="categories" 
            style="width: 100%" 
            v-loading="loading"
            element-loading-text="Loading..."
            :element-loading-spinner="svg"
            element-loading-svg-view-box="-10, -10, 50, 50"
            element-loading-background="rgba(122, 122, 122, 0.8)">
                <el-table-column fixed show-overflow-tooltip="true" prop="name" label="分类名称" width="120" />
                <el-table-column show-overflow-tooltip="true" prop="id" label="ID" width="190" />
                <el-table-column align="center" label="状态" width="100" >
                    <template v-slot="scope">
                        <div v-if="scope.row.status==='0'">
                            <el-tag type="danger" size="">已删除</el-tag>
                        </div>
                        <div v-if="scope.row.status==='1'">
                            <el-tag type="success" size="">正常</el-tag>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column show-overflow-tooltip="true" prop="description" label="描述" width="250" />
                <el-table-column prop="pinyin" label="拼音" width="120" />
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
                        <el-button type="danger" size="" v-if="scope.row.status!=='0'" @click="deleteItem(scope.row)" round>删除</el-button>
                        <el-button type="danger" size="" v-if="scope.row.status==='0'" @click="deleteItem(scope.row)" disabled round>删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        
        <div class="category-dialog-box">
            <!-- 删除提示的dialog -->
            <el-dialog
                v-model="deleteDialogShow"
                title="删除提示"
                width="25%"
            >
                <span>你确定要删除: {{deleteMessage}} 分类吗？</span>
                <template #footer>
                    <span class="dialog-footer">
                        <el-button @click="deleteDialogShow = false">取消</el-button>
                        <el-button type="primary" @click="doDeleteItem()">
                        确定
                        </el-button>
                    </span>
                </template>
            </el-dialog>
            <!-- 添加/编辑分类的dialog -->
            <el-dialog 
                v-model="editorDialogShow" 
                :title="editTitle"
                width="35%"
                :close-on-click-modal=false
            >
                <div class="category-editor-box">
                    <el-form
                        label-position="left"
                        label-width="100px"
                        
                    >
                        <el-form-item label="分类名称">
                            <el-input v-model="category.name" />
                        </el-form-item>
                        <el-form-item label="分类拼音">
                            <el-input v-model="category.pinyin" />
                        </el-form-item>
                        <el-form-item label="分类描述">
                            <el-input v-model="category.description" 
                                type="textarea"
                                :rows="2"
                                maxlength="100"
                                resize="none"
                            />
                        </el-form-item>
                        <el-form-item label="顺序">
                            <el-input-number v-model="category.order" :min="1" :max="50" />
                        </el-form-item>
                        <el-form-item label="状态">
                            <el-select v-model="category.status" placeholder="请选择状态">
                                <el-option label="已删除" value="0" />
                                <el-option label="正常" value="1" />
                            </el-select>
                        </el-form-item>
                    </el-form>
                </div>
                <template #footer>
                    <span class="dialog-footer">
                        <el-button @click="onEditorClose">取 消</el-button>
                        <el-button type="primary" @click="postCategory">
                        {{editorCommitText}}
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
                editorCommitText: '修改分类',
                editorDialogShow: false,
                editTitle: '编辑分类',
                categories: [],
                deleteDialogShow: false,
                deleteMessage: '',
                deleteTargetId: '',
                category: {
                    id: '',
                    name: '',
                    description: '',
                    order: 1,
                    pinyin: '',
                    status: '1'
                }
            }
        },
        methods: {
            onEditorClose() {
                this.editorDialogShow = false;
                this.resetCategory();
            },
            postCategory() {
                // 检查内容
                if (this.category.name === '') {
                    this.showWarning('分类名称不可以为空');
                    return;
                }
                if (this.category.description === '') {
                    this.showWarning('分类描述不可以为空');
                    return;
                }
                if (this.category.pinyin === '') {
                    this.showWarning('分类拼音不可以为空');
                    return;
                }
                // 提交数据
                // 提示结果
                // 如果有Id的就是更新
                // 如果没有ID就是添加的
                if (this.category.id === '') {
                    api.postCategory(this.category).then(result => {
                    this.editorDialogShow = false;
                    if (result.code === api.success_code) {
                        this.$message({
                            message: '添加成功',
                            type: 'success',
                            center: true
                        })
                        // 刷新列表
                        this.listCategories();
                        // 重置数据
                        // this.resetCategory();
                    } else {
                        this.showWarning(result.message);
                    }
                })
                } else {
                    api.updateCategory(this.category.id, this.category).then(result => {
                        if (result.code === api.success_code) {
                            this.$message.success(result.message); 
                            this.editorDialogShow = false;      
                            this.listCategories();       
                            // this.resetCategory(); 
                        } else {
                            this.$message.error(result.message);
                        }
                    })
                }
                this.resetCategory()                         
            },
            resetCategory() {
                this.category.id = '';
                this.category.name = '';
                this.category.description = '';
                this.category.order = 1;
                this.category.pinyin = '';
                this.category.status ='1';
            },
            edit(item) {
                // 赋值，最好的方法是请求单个数据，在显示，数据回显
                // 显示dialog
                this.category.name = item.name;
                this.category.description = item.description;
                this.category.id = item.id;
                this.category.pinyin = item.pinyin;
                this.category.status = item.status;
                this.category.order = item.order;
                // console.log(item);
                this.editorDialogShow = true;
                this.editorCommitText = '修改分类';
                this.editTitle = '编辑分类';
            },
            deleteItem(item) {
                // 不是立马删除，而是提示警告
                this.deleteDialogShow = true;
                this.deleteMessage = item.name;
                this.deleteTargetId = item.id;
                // console.log(item);
            },
            formatDate(dateStr) {
                let date = new Date(dateStr);
                return dateUtils.formatDate(date, 'yyyy-MM-dd hh:mm:ss')
            },
            doDeleteItem() {
                api.deleteCategoryById(this.deleteTargetId).then(result => {
                    if (result.code === api.success_code) {
                        this.$message({
                            type: 'success',
                            center: true,
                            message: result.message
                        });
                        this.listCategories();
                    }
                });
                this.deleteDialogShow = false;
            },
            listCategories() {
                this.loading = true;
                // 获取分类列表
                api.listCategories().then(result => {
                    // console.log(result);
                    if (result.code === api.success_code) {
                        this.categories = result.data;
                    } else {
                        this.$message.error(result.message)
                    }
                    this.loading = false;
                })
            },
            showAddCategory() {
                this.editTitle = '添加分类';
                this.editorCommitText = '添 加';
                this.editorDialogShow = true;
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
            this.listCategories();
        },
    }
</script>
<style>
    .category-list-box .el-table {
        min-height: 200px;
    }
</style>