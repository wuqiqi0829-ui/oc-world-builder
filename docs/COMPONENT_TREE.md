# React 组件树

## 已实现

### 认证（阶段 2）
| 组件 | 文件 | 说明 |
|------|------|------|
| AuthProvider | src/contexts/AuthContext.tsx | Supabase session 管理 + signIn/signUp/signOut/resetPassword |
| LoginPage | src/pages/LoginPage.tsx | 登录/注册/忘记密码，邮箱+密码模式 |
| supabase client | src/lib/supabase.ts | Supabase 客户端，autoRefreshToken + persistSession |

### 布局（阶段 1）
| 组件 | 文件 | 说明 |
|------|------|------|
| Layout | src/components/layout/Layout.tsx | 顶层布局容器 |
| TopBar | src/components/layout/TopBar.tsx | 搜索框 + 新建/导出/导入/暗黑切换 |
| Sidebar | src/components/layout/Sidebar.tsx | 世界观列表 + 模块导航，可折叠 |
| Drawer | src/components/layout/Drawer.tsx | 右侧编辑抽屉面板 |
| MobileNav | src/components/layout/MobileNav.tsx | 移动端底部 Tab 栏 + 菜单 |

### 通用 UI（阶段 1 + 5）
| 组件 | 文件 | 说明 |
|------|------|------|
| Card | src/components/ui/Card.tsx | 通用卡片容器 |
| Modal | src/components/ui/Modal.tsx | 通用弹窗 |
| ConfirmDialog | src/components/ui/ConfirmDialog.tsx | 确认删除对话框 |
| EmptyState | src/components/ui/EmptyState.tsx | 空数据占位 |
| RichTextEditor | src/components/ui/RichTextEditor.tsx | TipTap 富文本编辑器 |
| ImageUploader | src/components/ui/ImageUploader.tsx | 多图上传+压缩+拖拽排序 |
| Lightbox | src/components/ui/Lightbox.tsx | 图片全屏预览 |

### 状态管理
| Store | 文件 | 说明 |
|-------|------|------|
| useTheme | src/stores/theme.ts | 亮/暗主题切换，localStorage 持久化 |
| useWorlds | src/stores/worlds.ts | 世界观 CRUD + 实时同步 |

### Hooks
| Hook | 文件 | 说明 |
|------|------|------|
| useAutoSave | src/hooks/useAutoSave.ts | debounce 自动保存 + 状态追踪 |

### 世界观（阶段 4）
| 组件 | 文件 | 说明 |
|------|------|------|
| NewWorldModal | src/components/worlds/NewWorldModal.tsx | 新建世界观弹窗 |

---

## 顶层结构（目标）
```
App ✅
├── AuthProvider ✅
│   ├── LoginPage ✅
│   └── AuthenticatedApp ✅ (路由守卫)
│       └── Layout ✅
│           ├── TopBar ✅
│           ├── Sidebar ✅
│           ├── MainArea
│           │   ├── WorldSelector ✅ (阶段 4)
│           │   ├── CharacterList ← 阶段 6
│           │   ├── TimelineView ← 阶段 7
│           │   ├── MapView ← 阶段 9
│           │   ├── OrganizationList ← 阶段 10
│           │   ├── ItemList ← 阶段 12
│           │   ├── RelationshipGraph ← 阶段 11
│           │   ├── StorylineList ← 阶段 12
│           │   ├── NotesList ← 阶段 12
│           │   └── CustomCategoryList ← 阶段 10
│           └── Drawer ✅
```

## 待实现
- `TagPicker` — 标签选择器 ← 阶段 8
