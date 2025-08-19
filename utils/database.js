const { supabase } = require('./supabase');
const moment = require('moment');

class Database {
    // 获取所有已发布的文章
    static async getPublishedPosts(page = 1, limit = 5) {
        const offset = (page - 1) * limit;
        
        const { data, error, count } = await supabase
            .from('posts')
            .select('*', { count: 'exact' })
            .eq('status', 'published')
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;
        return { posts: data, total: count };
    }

    // 获取文章详情
    static async getPostBySlug(slug) {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('slug', slug)
            .eq('status', 'published')
            .single();

        if (error) throw error;
        return data;
    }

    // 获取所有文章（管理用）
    static async getAllPosts() {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }

    // 创建文章
    static async createPost(postData) {
        // 自动生成slug
        if (!postData.slug) {
            postData.slug = postData.title.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
        }

        // 设置默认值
        postData.author = postData.author || 'Admin';
        postData.views = postData.views || 0;
        postData.likes = postData.likes || 0;
        postData.tags = postData.tags || [];
        postData.comments = postData.comments || [];
        postData.status = postData.status || 'draft';

        const { data, error } = await supabase
            .from('posts')
            .insert([postData])
            .select();

        if (error) throw error;
        return data[0];
    }

    // 更新文章
    static async updatePost(id, postData) {
        // 更新时间戳
        postData.updated_at = new Date().toISOString();

        const { data, error } = await supabase
            .from('posts')
            .update(postData)
            .eq('id', id)
            .select();

        if (error) throw error;
        return data[0];
    }

    // 删除文章
    static async deletePost(id) {
        const { error } = await supabase
            .from('posts')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }

    // 搜索文章
    static async searchPosts(query) {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('status', 'published')
            .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }

    // 获取文章统计
    static async getStats() {
        const [totalResult, publishedResult, draftResult] = await Promise.all([
            supabase.from('posts').select('*', { count: 'exact' }),
            supabase.from('posts').select('*', { count: 'exact' }).eq('status', 'published'),
            supabase.from('posts').select('*', { count: 'exact' }).eq('status', 'draft')
        ]);

        return {
            total: totalResult.count,
            published: publishedResult.count,
            draft: draftResult.count
        };
    }

    // 获取所有标签
    static async getAllTags() {
        const { data, error } = await supabase
            .from('posts')
            .select('tags')
            .eq('status', 'published');

        if (error) throw error;

        const tagCount = {};
        data.forEach(post => {
            if (Array.isArray(post.tags)) {
                post.tags.forEach(tag => {
                    tagCount[tag] = (tagCount[tag] || 0) + 1;
                });
            }
        });

        return tagCount;
    }

    // 获取归档数据
    static async getArchives() {
        const { data, error } = await supabase
            .from('posts')
            .select('id, title, slug, created_at')
            .eq('status', 'published')
            .order('created_at', { ascending: false });

        if (error) throw error;

        const archives = {};
        data.forEach(post => {
            const year = new Date(post.created_at).getFullYear();
            if (!archives[year]) {
                archives[year] = [];
            }
            archives[year].push(post);
        });

        return archives;
    }
}

module.exports = Database;