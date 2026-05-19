# 技术选型与架构

## 整体架构
```
用户浏览器 (PWA)
    │
    ├── React 18 SPA (Vite 构建)
    │   ├── TipTap 富文本
    │   ├── dnd-kit 拖拽
    │   ├── React Flow 关系图
    │   └── Zustand 状态管理
    │
    └── Supabase
        ├── Auth (邮箱认证)
        ├── Database (PostgreSQL)
        ├── Storage (图片文件)
        └── Realtime (实时同步)
```

## 前端
| 库 | 版本 | 用途 |
|----|------|------|
| react | ^18.3 | UI 框架 |
| react-router-dom | ^6.28 | 路由 |
| @tiptap/react | ^2.10 | 富文本编辑器 |
| @dnd-kit/core | ^6.1 | 拖拽排序 |
| reactflow | ^11.11 | 关系图谱可视化 |
| browser-image-compression | ^2.0 | 图片压缩 |
| zustand | ^5.0 | 轻量状态管理 |
| lucide-react | ^0.460 | 图标库 |
| clsx | ^2.1 | 类名拼接 |

## 后端 (Supabase)
- **Auth**：email/password 模式，自动处理 session
- **Database**：PostgreSQL 15，Row Level Security 隔离用户数据
- **Storage**：S3 兼容对象存储，bucket 按用户/世界观组织
- **Realtime**：Postgres 变更订阅，实现多模块实时同步

## 样式
- Tailwind CSS 3.4，darkMode: 'class'
- 自定义主题色：primary-600 #7C5CBF，surface-100 #F5F3F7
- 字体：Inter + Noto Sans SC

## 部署
- Vercel 托管，关联 GitHub 自动部署
- 环境变量注入 Supabase URL + anon key
