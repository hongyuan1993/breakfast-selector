-- 大宝早餐选择 - Supabase 数据库结构
-- 在 Supabase Dashboard > SQL Editor 中运行此脚本

-- 创建存储表（key-value 形式）
CREATE TABLE IF NOT EXISTS app_store (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 启用行级安全（RLS），不建任何策略：只有服务端的 service_role（绕过 RLS）能访问。
-- 浏览器经由 Vercel Function /api/store 读写，不再直连 Supabase。
ALTER TABLE app_store ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access" ON app_store;
REVOKE ALL ON TABLE app_store FROM anon, authenticated;
