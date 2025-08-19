const bcrypt = require('bcryptjs');

// 替换为你的实际密码
const password = 'tsWd78%23:d-kudij6951';

// 生成哈希（使用10轮加密）
bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
        console.error('Error generating hash:', err);
        return;
    }
    console.log('Password hash:');
    console.log(hash);
    console.log('\n请将以下内容复制到 .env 文件中:');
    console.log('ADMIN_PASSWORD_HASHED=' + hash);
});