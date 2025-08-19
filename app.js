const express = require('express');
const path = require('path');
const session = require('express-session');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const YAML = require('yamljs');
const { engine } = require('express-handlebars');
const moment = require('moment');
const { marked } = require('marked');
require('dotenv').config();

// 配置marked
marked.setOptions({
    gfm: true,
    breaks: true,
    smartLists: true,
    smartypants: true,
});

// 加载配置
const config = YAML.load('_config.yml');

// 路由
const indexRouter = require('./routes/index');
const adminRouter = require('./routes/admin');
const apiRouter = require('./routes/api');

const app = express();

// 中间件
// --- 正确配置 Helmet，包括解决 CSP 问题 ---
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                ...helmet.contentSecurityPolicy.getDefaultDirectives(),
                // 允许来自 'self' 和 jsDelivr CDN 的脚本和样式
                "script-src": ["'self'", "https://cdn.jsdelivr.net", "'unsafe-inline'"],
                "style-src": ["'self'", "https://cdn.jsdelivr.net", "'unsafe-inline'"],
                // 允许从 CDN 加载字体和图片
                "font-src": ["'self'", "https://cdn.jsdelivr.net", "data:"],
                "img-src": ["'self'", "https://cdn.jsdelivr.net", "data:", "http:", "https:"],
            },
        },
    })
);
// 移除了重复的 app.use(helmet());
// 移除了重复的 cors 和 compression 中间件调用，因为它们已经在下面统一配置了。
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件
app.use(express.static(path.join(__dirname, 'public')));

// 模板引擎
app.engine('hbs', engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir: path.join(__dirname, 'views/partials'),
    helpers: {
        formatDate: (date) => moment(date).format('YYYY-MM-DD HH:mm'),
        excerpt: (content, length) => {
            if (content && content.length > length) {
                return content.substring(0, length) + '...';
            }
            return content || '';
        },
        eq: (a, b) => a === b,
        gt: (a, b) => a > b,
        add: (a, b) => parseInt(a) + parseInt(b),
        subtract: (a, b) => parseInt(a) - parseInt(b),
        multiply: (a, b) => parseInt(a) * parseInt(b),
        divide: (a, b) => parseInt(a) / parseInt(b),
        // --- 添加缺失的辅助函数 ---
        not: (a) => !a,
        or: (a, b) => a || b,
        // -------------------------
        config: (key) => {
            const keys = key.split('.');
            let value = config;
            for (let k of keys) {
                value = value[k];
            }
            return value;
        },
        range: (start, end) => {
            const result = [];
            for (let i = start; i <= end; i++) {
                result.push(i);
            }
            return result;
        },
        now: () => new Date(),
        footerHtml: () => {
            return config.footer && config.footer.html ? config.footer.html : '由<a href="https://blog.saabor.com">Saabor</a>制作';
        },
        marked: (content) => {
            return marked.parse(content || '');
        }
    }
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Session配置
app.use(session({
    secret: process.env.ADMIN_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// 全局变量
app.use((req, res, next) => {
    res.locals.site = config.site;
    res.locals.theme = config.theme;
    res.locals.menu = config.menu;
    res.locals.social = config.social;
    res.locals.user = req.session.user;
    next();
});

// 路由
app.use('/', indexRouter);
app.use('/admin', adminRouter);
app.use('/api', apiRouter);

// 404处理
app.use((req, res) => {
    res.status(404).render('404', {
        title: '页面未找到'
    });
});

// 错误处理
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', {
        title: '服务器错误',
        message: '服务器内部错误'
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
    console.log(`访问地址: ${config.url.base}`);
});