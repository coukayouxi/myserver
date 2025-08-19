const express = require('express');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const YAML = require('yamljs');
const Database = require('../utils/database');
const auth = require('../middleware/auth');
const multer = require('multer');
require('dotenv').config();

const router = express.Router();
router.get('/', (req, res) => {
    res.redirect('/admin/login');
});
// 配置文件上传
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../public/uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('只允许上传图片文件'));
        }
    }
});

// 登录页面
router.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/admin/dashboard');
    }
    res.render('admin/login', {
        title: '管理员登录'
    });
});

// 登录处理
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (username === process.env.ADMIN_USERNAME) {
            const isValid = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASHED);
            if (isValid) {
                req.session.user = {
                    username: process.env.ADMIN_USERNAME,
                    role: 'admin'
                };
                return res.redirect('/admin/dashboard');
            }
        }

        res.render('admin/login', {
            title: '管理员登录',
            error: '用户名或密码错误'
        });
    } catch (error) {
        console.error(error);
        res.render('admin/login', {
            title: '管理员登录',
            error: '登录失败'
        });
    }
});

// 登出
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/admin/login');
});

// 仪表板
router.get('/dashboard', auth, async (req, res) => {
    try {
        const stats = await Database.getStats();
        const posts = await Database.getAllPosts();
        const recentPosts = posts.slice(0, 5);

        res.render('admin/dashboard', {
            title: '仪表板',
            stats,
            posts: recentPosts
        });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', {
            title: '错误',
            message: '获取统计信息失败'
        });
    }
});

// 文章管理
router.get('/posts', auth, async (req, res) => {
    try {
        const posts = await Database.getAllPosts();
        res.render('admin/posts', {
            title: '文章管理',
            posts
        });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', {
            title: '错误',
            message: '获取文章列表失败'
        });
    }
});

// 创建文章页面
router.get('/posts/new', auth, (req, res) => {
    res.render('admin/edit-post', {
        title: '创建文章',
        post: null
    });
});

// 编辑文章页面
router.get('/posts/edit/:id', auth, async (req, res) => {
    try {
        const posts = await Database.getAllPosts();
        const post = posts.find(p => p.id === req.params.id);
        
        if (!post) {
            return res.status(404).render('404');
        }
        
        res.render('admin/edit-post', {
            title: '编辑文章',
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

// 创建/更新文章
router.post('/posts/save', auth, upload.single('featuredImage'), async (req, res) => {
    try {
        const { id, title, content, excerpt, tags, category, status } = req.body;
        
        const postData = {
            title,
            content,
            excerpt,
            category,
            status,
            author: req.session.user.username
        };

        if (tags) {
            postData.tags = tags.split(',').map(tag => tag.trim());
        }

        if (req.file) {
            postData.featured_image = '/uploads/' + req.file.filename;
        }

        let post;
        if (id) {
            post = await Database.updatePost(id, postData);
        } else {
            post = await Database.createPost(postData);
        }

        res.redirect('/admin/posts');
    } catch (error) {
        console.error(error);
        res.status(500).render('error', {
            title: '错误',
            message: '保存文章失败'
        });
    }
});

// 删除文章
router.post('/posts/delete/:id', auth, async (req, res) => {
    try {
        await Database.deletePost(req.params.id);
        res.redirect('/admin/posts');
    } catch (error) {
        console.error(error);
        res.status(500).render('error', {
            title: '错误',
            message: '删除文章失败'
        });
    }
});

// 设置页面
router.get('/settings', auth, (req, res) => {
    const config = YAML.load('_config.yml');
    res.render('admin/settings', {
        title: '站点设置',
        config
    });
});

// 保存设置
router.post('/settings/save', auth, async (req, res) => {
    try {
        const { site_title, site_subtitle, footer_html } = req.body;
        
        // 读取当前配置
        const configPath = path.join(__dirname, '../_config.yml');
        const config = YAML.load(configPath);
        
        // 更新配置
        config.site.title = site_title;
        config.site.subtitle = site_subtitle;
        config.footer.html = footer_html;
        
        // 保存配置
        const yamlStr = YAML.stringify(config, 4);
        fs.writeFileSync(configPath, yamlStr, 'utf8');
        
        // 重新加载配置到应用中
        delete require.cache[require.resolve('../app.js')];
        
        res.redirect('/admin/settings');
    } catch (error) {
        console.error(error);
        res.status(500).render('error', {
            title: '错误',
            message: '保存设置失败'
        });
    }
});

module.exports = router;