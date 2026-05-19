# OC 世界观收纳整理软件

## 项目概述
一个运行在 Web 上的 PWA 应用，用于创作者管理原创世界观（OC）的设定，
支持多世界观、人物、时间线、地图、关系图谱等模块。
风格：清新二次元 + 极简办公，柔和紫 + 浅灰。

## 标准文档位置
- 功能需求：[docs/REQUIREMENTS.md](docs/REQUIREMENTS.md)
- 技术选型：[docs/TECH_STACK.md](docs/TECH_STACK.md)
- UI 设计规范：[docs/DESIGN_GUIDE.md](docs/DESIGN_GUIDE.md)
- 开发阶段：[docs/DEVELOPMENT_PLAN.md](docs/DEVELOPMENT_PLAN.md)
- 数据库设计：[docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md)
- 组件树：[docs/COMPONENT_TREE.md](docs/COMPONENT_TREE.md)

## 开发日志
每日自动记录到 [devlog/](devlog/) 文件夹，文件名格式 YYYY-MM-DD.md

## 工作约定
- 每次只做当前阶段的任务，不跨越阶段
- 每个阶段完成后需用户确认再进入下一阶段
- 所有代码修改前先读相关文件
- 数据库变更需同步更新 DATABASE_SCHEMA.md
- 新组件需同步更新 COMPONENT_TREE.md
- 每次会话结束前更新当日 devlog
- 不要生成无关的文档或配置文件
- 用 npm 管理依赖，不用 yarn 或 pnpm

## 常用命令
- `npm run dev` — 启动开发服务器
- `npm run build` — 生产构建
- `npm run lint` — 代码检查
