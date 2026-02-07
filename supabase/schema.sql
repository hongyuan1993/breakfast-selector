-- 大宝早餐选择 - Supabase 数据库结构
-- 在 Supabase Dashboard > SQL Editor 中运行此脚本

-- 创建存储表（key-value 形式）
CREATE TABLE IF NOT EXISTS app_store (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 启用行级安全（RLS）
ALTER TABLE app_store ENABLE ROW LEVEL SECURITY;

-- 删除已有策略（若存在），避免重复运行报错
DROP POLICY IF EXISTS "Allow all access" ON app_store;

-- 允许所有人读写（无登录，家庭共享数据）
CREATE POLICY "Allow all access" ON app_store
  FOR ALL
  USING (true)
  WITH CHECK (true);
