# 🍳 大宝早餐选择

温馨的橙黄色渐变风格早餐选择应用，支持添加、修改、选择早餐及查看历史记录。

## 技术栈

- React 18 + Vite 5
- Tailwind CSS 3
- Vercel Functions（`api/`）+ Supabase（服务端用 service_role 访问，浏览器不持有任何 Supabase key）

## 功能

- **添加早餐**：添加新种类，自动分类和图标
- **修改早餐**：修改名称、图标、分类、选项、库存
- **选择早餐**：多选明日早餐，支持选项（如煎鸡蛋选全熟/半熟）
- **历史记录**：以日历形式查看已保存的早餐记录

## 数据存储（Vercel Functions + Supabase）

浏览器只调用同源的 `/api/store`（`api/store.js`），由服务端用 service_role 读写 Supabase 的 `app_store` 表；
只允许 `breakfasts` / `history` 两个 key，并校验格式与大小。浏览器端不再有任何 Supabase URL / key。

### 1. 创建数据库表

在 Supabase Dashboard > **SQL Editor** 中运行 `supabase/schema.sql`（开启 RLS、不加策略、收回 anon 权限）。

### 2. 在 Vercel 配置环境变量（不要提交 .env）

| 变量 | 说明 |
|---|---|
| `SUPABASE_URL` | Supabase 项目 URL |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role 密钥（仅服务端；**绝不能**以 `VITE_` 开头） |
| `APP_PASSWORD`（可选） | 设置后需输入口令才能读写数据（会话 Cookie 1 年有效） |
| `APP_SESSION_SECRET`（设置口令时必填） | 会话 Cookie 加密密钥，随机字符串 ≥ 16 位 |

### 3. 本地开发

`/api/*` 是 Vercel Function，本地请用 `vercel dev`（`npm run dev` 只启动前端，数据接口不可用）。

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
