我来为您详细介绍这个博客系统的文件结构、部署方法和注意事项。

## 文件结构说明

```
blog-system/
├── .env                          # 环境变量配置文件（敏感信息）
├── _config.yml                   # 博客系统配置文件
├── app.js                       # 主应用入口文件
├── package.json                 # Node.js 项目配置和依赖
├── routes/                      # 路由处理文件夹
│   ├── index.js                 # 前台页面路由
│   ├── admin.js                 # 后台管理路由
│   └── api.js                   # API 接口路由
├── utils/                       # 工具函数文件夹
│   ├── database.js              # 数据库操作封装
│   └── supabase.js              # Supabase 客户端配置
├── middleware/                  # 中间件文件夹
│   └── auth.js                  # 权限验证中间件
├── public/                      # 静态资源文件夹
│   ├── css/                     # 样式文件
│   │   ├── style.css           # 主样式文件
│   │   └── easymde.min.css     # Markdown 编辑器样式
│   ├── js/                      # JavaScript 文件
│   │   ├── main.js             # 主要 JS 功能
│   │   └── easymde.min.js      # Markdown 编辑器 JS
│   └── uploads/                # 上传文件存储目录
└── views/                       # 模板文件夹（Handlebars）
    ├── layouts/                # 布局模板
    │   └── main.hbs            # 主布局文件
    ├── partials/               # 部分模板
    │   ├── header.hbs          # 头部模板
    │   ├── footer.hbs          # 页脚模板
    │   └── sidebar.hbs         # 侧边栏模板
    ├── index.hbs               # 首页模板
    ├── post.hbs                # 文章详情页模板
    ├── archives.hbs            # 归档页面模板
    ├── tags.hbs                # 标签页面模板
    ├── search.hbs              # 搜索页面模板
    ├── admin/                  # 后台管理模板
    │   ├── dashboard.hbs       # 仪表板模板
    │   ├── posts.hbs           # 文章管理模板
    │   ├── edit-post.hbs       # 编辑文章模板
    │   ├── settings.hbs        # 设置页面模板
    │   └── login.hbs           # 登录页面模板
    ├── 404.hbs                 # 404 页面模板
    └── error.hbs               # 错误页面模板
```

## 部署方法

### 1. 环境准备

```bash
# 安装 Node.js (建议使用 LTS 版本)
# Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm -y

# 安装 PM2 进程管理器
sudo npm install -g pm2
```

### 2. 项目部署

```bash
# 上传项目文件到服务器
# 或者使用 git clone

# 进入项目目录
cd /path/to/blog-system

# 安装依赖
npm install
```

### 3. 配置文件设置

```bash
# 创建并编辑 .env 文件
nano .env

# 创建并编辑 _config.yml 文件
nano _config.yml
```

### 4. 启动应用

```bash
# 使用 PM2 启动（推荐）
pm2 start app.js --name "blog"

# 设置开机自启
pm2 startup
pm2 save
```

### 5. 配置反向代理（Nginx）

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;  # 或您设置的 PORT
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 重要注意事项

### 1. 安全相关

- ⚠️ **绝对不要将 `.env` 文件提交到 Git**
- 在 `.gitignore` 中添加 `.env`
- 定期更换密钥和密码
- 生产环境使用 HTTPS

### 2. 配置文件备份

```bash
# 定期备份重要配置文件
cp .env .env.backup.$(date +%Y%m%d)
cp _config.yml _config.yml.backup.$(date +%Y%m%d)
```

### 3. 数据库设置

- 确保 Supabase 数据库表已创建
- posts 表结构必须正确
- 检查 Supabase API 密钥权限

### 4. 文件权限

```bash
# 设置正确的文件权限
sudo chown -R www-data:www-data /path/to/blog-system
sudo chmod -R 755 /path/to/blog-system
```

### 5. 日常维护

```bash
# 查看应用状态
pm2 status

# 查看日志
pm2 logs blog

# 重启应用
pm2 restart blog

# 更新代码后
git pull
npm install  # 如果有新依赖
pm2 reload blog
```

### 6. 故障排除

```bash
# 检查端口占用
netstat -tlnp | grep :3000

# 检查应用是否运行
pm2 list

# 查看详细错误信息
pm2 logs blog --lines 100
```

### 7. 备份策略

```bash
# 创建备份脚本
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf blog_backup_$DATE.tar.gz /path/to/blog-system
```

记住这些要点，您就能成功部署和维护这个博客系统了！
