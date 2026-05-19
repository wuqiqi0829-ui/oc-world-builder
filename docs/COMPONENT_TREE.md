# React 组件树

> 阶段 1 开始填充，随开发同步更新。

## 顶层结构
```
App
├── AuthProvider          (Supabase session 管理)
│   ├── LoginPage         (登录/注册/找回密码)
│   └── AuthenticatedApp  (需登录)
│       └── Layout
│           ├── TopBar     (搜索框/新建/导出/暗黑切换)
│           ├── Sidebar    (世界观列表 + 模块导航)
│           ├── MainArea   (根据路由渲染模块)
│           │   ├── WorldSelector (世界观卡片网格)
│           │   ├── CharacterList
│           │   ├── TimelineView
│           │   ├── MapView
│           │   ├── OrganizationList
│           │   ├── ItemList
│           │   ├── RelationshipGraph
│           │   ├── StorylineList
│           │   ├── NotesList
│           │   └── CustomCategoryList
│           └── Drawer     (右侧编辑面板)
│               └── (各模块编辑表单动态渲染)
```

## 共享组件
- `RichTextEditor` — TipTap 封装
- `ImageUploader` — 图片上传+压缩+预览
- `SortableList` — dnd-kit 通用拖拽列表
- `Card` — 通用卡片容器
- `Modal` — 通用弹窗
- `TagPicker` — 标签选择器
- `SearchBar` — 搜索输入
- `EmptyState` — 空数据占位
- `ConfirmDialog` — 确认删除对话框
