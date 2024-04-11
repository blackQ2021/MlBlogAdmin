import http from "./http";

export const success_code = 20000;
export const failed_code = 40000;

// 解析token
export const checkToken = () => {
    return http.requestGet('/user/check-token');
};

// 登录
export const doLogin = (verifyCode, verifyKey, inisUser) => {
    return http.requestPost('/user/login/' + verifyCode + '/' + verifyKey, inisUser);
};

// 获取分类列表
export const listCategories = () => {
    return http.requestGet('/admin/category/list');
};

// 删除分类
export const deleteCategoryById = (categoryId) => {
    return http.requestDelete('/admin/category/' + categoryId);
};

// 添加分类
export const postCategory = (category) => {
    return http.requestPost('/admin/category/', category);
};

// 更新分类
export const updateCategory = (categoryId, category) => {
    return http.requestPut('/admin/category/' + categoryId, category);
};

// 轮播图列表
export const listLoop = () => {
    return http.requestGet('/admin/loop/list');
};

// 添加轮播图
export const postLoop = (loop) => {
    return http.requestPost('/admin/loop', loop);
};

// 删除轮播图
export const deleteLoopById = (loopId) => {
    return http.requestDelete('/admin/loop/' + loopId);
};

// 更新分类
export const updateLoop = (loopId, loop) => {
    return http.requestPut('/admin/loop/' + loopId, loop);
};

// 用户列表
export const listUsers = (page, size) => {
    return http.requestGet('/user/list?page=' + page + '&size=' + size);
};

// 用户列表
export const doUserSearch = (userName, email) => {
    return http.requestGet('/user/list?page=1&size=10&userName=' + userName + '&email=' + email);
};

// 删除分类
export const deleteUserById = (userId) => {
    return http.requestDelete('/user/' + userId);
};

// 重置密码
export const resetPassword = (userId, newPassword) => {
    return http.requestPut('/user/reset-password/' + userId + '?password=' + newPassword);
};

// 获取验证码
export const getVerifyCode = (emailAdress, type) => {
    return http.requestGet('/user/verify_code?email=' + emailAdress + '&type=' + type);
};

// 更新邮箱地址
export const updateEmailAddress = (emailAdress, verifyCode) => {
    return http.requestPut('/user/email?email=' + emailAdress + '&verify_code=' + verifyCode);
};

// 用户名重复
export const checkUserName = (userName) => {
    return http.requestGet('/user/user_name?userName=' + userName);
};

// 更新用户信息
export const updateuserInfo = (userInfo, userId) => {
    return http.requestPut('/user/user_info/' + userId, userInfo);
};

// 获取网站标题
export const getSeoInfo = () => {
    return http.requestGet('/admin/web_site_info/seo');
};

// 更新网站信息
export const getWebsiteTitle = (userInfo, userId) => {
    return http.requestGet('/admin/web_site_info/title');
};

// 更新网站标题
export const updateWebsiteTitle = (title) => {
    return http.requestPut('/admin/web_site_info/title?title=' + title);
};

// 更新网站信息
export const updateSeoInfo = (description, keywords) => {
    return http.requestPut('/admin/web_site_info/seo?description=' + description + '&keywords=' + keywords);
};

// 获取友链列表
export const listFriendLinks = () => {
    return http.requestGet('/admin/friend_link/list');
};

// 添加友链列表
export const postFriendLink = (friendLink) => {
    return http.requestPost('/admin/friend_link', friendLink);
};

// 更新友链列表
export const updateFriendLink = (friendLink, linkId) => {
    return http.requestPut('/admin/friend_link/' + linkId, friendLink);
};

// 删除友链列表
export const deleteFriendLink = (linkId) => {
    return http.requestDelete('/admin/friend_link/' + linkId);
};

// 获取图片列表
export const listImages = (page, size, original, state) => {
    return http.requestGet('/admin/image/list/' + page + '/' + size + '?original=' + original + '&state=' + state);
};

// 发表文章
export const postArticle = (article) => {
    return http.requestPost('/admin/article', article);
};

// 保存草稿
export const saveArticleDraft = (article) => {
    return http.requestPost('/admin/article', article);
};

// 获取文章列表
export const listArticles = (page, size, state, keyword, categoryId) => {
    return http.requestGet('/admin/article/list/' + page + '/' + size + '?state=' + state + '&keyword=' + keyword + '&categoryId=' + categoryId);
};

// 删除文章
export const deleteArticle = (articleId) => {
    return http.requestDelete('/admin/article/state/' + articleId);
};

// 回显文章
export const getArticleById = (articleId) => {
    return http.requestGet('/admin/article/' + articleId);
};

// 更新文章
export const updateArticleById = (articleId, article) => {
    return http.requestPut('/admin/article/' + articleId, article);
};

// 获取评论列表
export const listComments = (page, size) => {
    return http.requestGet('/admin/comment/list?page=' + page + '&size=' + size);
};

// 删除评论
export const deleteCommentById = (cmmentId) => {
    return http.requestDelete('/admin/comment/' + cmmentId);
};

// 置顶评论
export const topCommentById = (cmmentId) => {
    return http.requestPut('/admin/comment/top/' + cmmentId);
};

// 根据文章ID评论列表
export const listCommentsByArticleId = (articleId, page, size) => {
    return http.requestGet('/portal/comment/list/'+ articleId+ '/' + page + '/' + size);
};

//根据Id删除图片
export const deleteImageById = (imageId, recover) => {
    return http.requestDelete('/admin/image/' + imageId + '?recover=' + recover);
};