# 🍳 大宝早餐选择

温馨的橙黄色渐变风格早餐选择应用，支持登陆、修改、选择早餐及查看历史记录。

## 技术栈

- React 18 + Vite 5
- Tailwind CSS 3
- Supabase（后端存储，多端同步）或 localStorage（无配置时回退）

## 功能

- **登陆早餐**：添加新种类，自动分类和图标
- **修改早餐**：修改名称、图标、分类、选项、库存
- **选择早餐**：多选明日早餐，支持选项（如煎鸡蛋选全熟/半熟）
- **历史记录**：以日历形式查看已保存的早餐记录

## 多端同步（Supabase）

配置 Supabase 后，所有设备访问同一网址会共享同一份数据。

### 1. 创建 Supabase 项目

1. 访问 [supabase.com](https://supabase.com) 注册/登录
2. 点击 **New Project** 创建项目
3. 在 **Project Settings > API** 中获取 `URL` 和 `anon public` key

### 2. 创建数据库表

在 Supabase Dashboard > **SQL Editor** 中运行 `supabase/schema.sql` 中的 SQL。

### 3. 配置环境变量

复制 `.env.example` 为 `.env`，填入：

```
VITE_SUPABASE_URL=https://你的项目.supabase.co
VITE_SUPABASE_ANON_KEY=你的anon-key
```

### 4. 使用

配置完成后，重新构建并部署。任何设备访问同一网址会共享早餐数据和历史记录。新设备打开或刷新页面即可获取最新数据。

**注意**：未配置 Supabase 时，应用自动使用 localStorage（仅本地存储，无多端同步）。

## 运行

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
npm run preview
```

## 预设早餐

小锅米线、蒸玉米、煮鸡蛋、煎鸡蛋、三明治、厚蛋烧、煮燕麦片、蒸包子、草莓、香蕉、烫饭、黑米红豆榨汁
