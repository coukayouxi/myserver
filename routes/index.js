const express = require('express');
const Database = require('../utils/database');
const router = express.Router();

// 首页
// 首页路由
router.get('/', async (req, res) => {
    try {
        const config = require('yamljs').load('_config.yml');
        const page = parseInt(req.query.page) || 1;
        const limit = config.blog.posts_per_page;

        const { posts, total } = await Database.getPublishedPosts(page, limit);
        const totalPages = Math.ceil(total / limit);
        
        // 获取标签数据
        const tags = await Database.getAllTags();

        res.render('index', {
            title: config.site.title,
            posts,
            currentPage: page,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            nextPage: page + 1,
            prevPage: page - 1,
            tags // 传递标签数据
        });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', {
            title: '错误',
            message: '获取文章列表失败'
        });
    }
});

// 文章详情
router.get('/post/:slug', async (req, res) => {
    try {
        const post = await Database.getPostBySlug(req.params.slug);

        if (!post) {
            return res.status(404).render('404');
        }

        res.render('post', {
            title: post.title,
            post
        });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', {
            title: '错误',
            message: '获取文章失败'
        });
    }
});

// 归档页面
router.get('/archives', async (req, res) => {
    try {
        const archives = await Database.getArchives();

        res.render('archives', {
            title: '文章归档',
            archives
        });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', {
            title: '错误',
            message: '获取归档失败'
        });
    }
});

// 标签页面
router.get('/tags', async (req, res) => {
    try {
        const tags = await Database.getAllTags();

        res.render('tags', {
            title: '标签云',
            tags
        });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', {
            title: '错误',
            message: '获取标签失败'
        });
    }
});

// 搜索功能
router.get('/search', async (req, res) => {
    try {
        const query = req.query.q || '';
        let posts = [];

        if (query) {
            posts = await Database.searchPosts(query);
        }

        res.render('search', {
            title: `搜索: ${query}`,
            posts,
            query
        });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', {
            title: '错误',
            message: '搜索失败'
        });
    }
});
// 关于页面
router.get('/about', (req, res) => {
    // 当用户访问 /about 时，渲染 views/about.hbs 模板
    res.render('about', {
        title: '关于' // 这个 title 会在 main.hbs 布局中使用
    });
});

// 分类页面
router.get('/categories', async (req, res) => {
    try {
        // 这里可以添加从数据库获取分类数据的逻辑
        // 目前我们先传递一个空对象或示例数据
        const categories = {}; // 或者从数据库查询实际数据

        res.render('categories', {
            title: '分类',
            categories: categories
        });
    } catch (error) {
        console.error(error);
        // 如果出错，渲染错误页面
        res.status(500).render('error', {
            title: '错误',
            message: '获取分类失败'
        });
    }
});
module.exports = router;