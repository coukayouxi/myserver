// utils/supabase.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// 从环境变量创建Supabase客户端
// SUPABASE_URL 和 SUPABASE_KEY/SUPABASE_SERVICE_KEY 应在 .env 文件中定义
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;

// 检查必要的环境变量是否存在
if (!supabaseUrl) {
    console.warn('警告: 未找到 SUPABASE_URL 环境变量');
}
if (!supabaseKey) {
    console.warn('警告: 未找到 SUPABASE_KEY 或 SUPABASE_SERVICE_KEY 环境变量');
}

// 创建并导出Supabase客户端实例
const supabase = createClient(supabaseUrl, supabaseKey, {
    // 可选：添加额外的客户端配置
    // auth: {
    //   persistSession: false,
    // },
    // db: {
    //   schema: 'public',
    // },
});

module.exports = {
    supabase
};