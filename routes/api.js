const express = require('express');
const Database = require('../utils/database');
const router = express.Router();

// 获取所有已发布的文章（API接口）
router.get('/posts', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        
        const { posts, total } = await Database.getPublishedPosts(page, limit);
        const totalPages = Math.ceil(total / limit);

        res.json({
            success: true,
            data: posts,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                total: total,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: '获取文章列表失败'
        });
    }
});

// 根据slug获取单篇文章（API接口）
router.get('/posts/:slug', async (req, res) => {
    try {
        const post = await Database.getPostBySlug(req.params.slug);
        
        if (!post) {
            return res.status(404).json({
                success: false,
                message: '文章未找到'
            });
        }

        res.json({
            success: true,
            data: post
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: '获取文章失败'
        });
    }
});

// 搜索文章（API接口）
router.get('/search', async (req, res) => {
    try {
        const query = req.query.q || '';
        let posts = [];

        if (query) {
            posts = await Database.searchPosts(query);
        }

        res.json({
            success: true,
            data: posts,
            query: query
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: '搜索失败'
        });
    }
});

// 获取标签云数据（API接口）
router.get('/tags', async (req, res) => {
    try {
        const tags = await Database.getAllTags();

        res.json({
            success: true,
            data: tags
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: '获取标签失败'
        });
    }
});

// 获取归档数据（API接口）
router.get('/archives', async (req, res) => {
    try {
        const archives = await Database.getArchives();

        res.json({
            success: true,
            data: archives
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: '获取归档失败'
        });
    }
});

// 获取站点统计信息（API接口）
router.get('/stats', async (req, res) => {
    try {
        const stats = await Database.getStats();

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: '获取统计信息失败'
        });
    }
});

// 增加文章浏览量（API接口）
router.post('/posts/:id/views', async (req, res) => {
    try {
        // 注意：这个功能可能需要在Database类中添加相应方法
        // 这里只是一个示例
        res.json({
            success: true,
            message: '浏览量已增加'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: '增加浏览量失败'
        });
    }
});

module.exports = router;