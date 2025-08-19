// test-db.js
require('dotenv').config(); // 加载 .env 文件
const { supabase } = require('./utils/supabase');

console.log('Attempting to connect to Supabase...');
console.log('URL:', process.env.SUPABASE_URL ? 'Set' : 'NOT SET');
// 注意：不要在日志中打印完整的密钥！
console.log('Service Key Length:', process.env.SUPABASE_SERVICE_KEY ? process.env.SUPABASE_SERVICE_KEY.length : 'NOT SET');

async function test() {
    try {
        // 尝试一个简单的查询来测试连接
        const { data, error, count } = await supabase
            .from('posts') // 假设 posts 表存在
            .select('count()', { count: 'exact', head: true }); // 只获取计数，不获取数据

        if (error) {
            console.error('Supabase Query Error:', error.message);
            console.error('Error Details:', error);
        } else {
            console.log('Supabase Connection Successful!');
            console.log('Posts table count query result:', count);
        }
    } catch (err) {
        console.error('Supabase Connection Test Failed with Exception:');
        console.error('Name:', err.name);
        console.error('Message:', err.message);
        console.error('Stack:', err.stack);
        // 特别关注 fetch 相关的错误
        if (err.cause) {
            console.error('Cause:', err.cause);
        }
    }
}

test();