# 数据库表结构

> 所有表均位于 Supabase PostgreSQL，启用 Row Level Security。
> `user_id` 关联 `auth.users.id`，所有查询按 user_id 过滤。

## 核心表设计（阶段 3 实施）

### worlds（世界观）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid PK | 自动生成 |
| user_id | uuid FK→auth.users | 所有者 |
| name | text NOT NULL | 名称 |
| cover_url | text | 封面图 URL |
| description | text | 简介描述 |
| sort_order | integer DEFAULT 0 | 排序 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

### characters（人物）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid PK | |
| world_id | uuid FK→worlds | 所属世界观 |
| user_id | uuid FK→auth.users | |
| name | text NOT NULL | 姓名 |
| nickname | text | 昵称 |
| gender | text | 性别 |
| age | text | 年龄 |
| appearance | text | 外貌描述 |
| personality | text | 性格 |
| background | text | 背景故事（富文本 HTML） |
| abilities | text | 能力设定 |
| weaknesses | text | 弱点 |
| catchphrase | text | 口头禅 |
| images | jsonb DEFAULT '[]' | 图片数组 [{url, label}] |
| created_at/updated_at | timestamptz | |

### timeline_events（时间线事件）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid PK | |
| world_id | uuid FK→worlds | |
| title | text NOT NULL | |
| time_label | text | 时间标签 |
| description | text | 富文本 HTML |
| images | jsonb DEFAULT '[]' | |
| sort_order | integer DEFAULT 0 | |
| created_at/updated_at | timestamptz | |

### locations（地点）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid PK | |
| world_id | uuid FK→worlds | |
| name | text NOT NULL | |
| description | text | |
| images | jsonb DEFAULT '[]' | |
| map_x | float | 在地图上的 x% |
| map_y | float | 在地图上的 y% |
| category | text | 分类 |
| region | text | 所属区域 |
| created_at/updated_at | timestamptz | |

### organizations（组织/势力）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid PK | |
| world_id | uuid FK→worlds | |
| name | text NOT NULL | |
| type | text | 类型（国家/帮派/公会等） |
| description | text | 富文本 |
| images | jsonb DEFAULT '[]' | |
| created_at/updated_at | timestamptz | |

### items（物品）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid PK | |
| world_id | uuid FK→worlds | |
| name | text NOT NULL | |
| category | text | 分类 |
| description | text | 富文本 |
| attributes | jsonb DEFAULT '{}' | 自定义属性 |
| images | jsonb DEFAULT '[]' | |
| created_at/updated_at | timestamptz | |

### relationships（关系）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid PK | |
| world_id | uuid FK→worlds | |
| source_type | text | 来源类型（character/organization/location） |
| source_id | uuid | 来源 ID |
| target_type | text | 目标类型 |
| target_id | uuid | 目标 ID |
| relation_type | text | 关系类型（亲友/敌对/师徒等） |
| label | text | 自定义关系标签 |
| created_at/updated_at | timestamptz | |

### tags（标签）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid PK | |
| user_id | uuid FK→auth.users | 全局标签 |
| name | text NOT NULL | |
| color | text | 标签颜色 hex |
| created_at | timestamptz | |

### tag_assignments（标签关联）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid PK | |
| tag_id | uuid FK→tags | |
| target_type | text | 关联类型 |
| target_id | uuid | 关联 ID |

### storylines（主线剧情）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid PK | |
| world_id | uuid FK→worlds | |
| title | text NOT NULL | |
| description | text | 富文本 |
| chapters | jsonb DEFAULT '[]' | 章节列表 [{title, content, order}] |
| created_at/updated_at | timestamptz | |

### notes（灵感速记）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid PK | |
| world_id | uuid FK→worlds nullable | 可关联世界观 |
| user_id | uuid FK→auth.users | |
| content | text | 富文本 |
| linked_module | text | 关联模块类型 |
| linked_id | uuid | 关联模块 ID |
| created_at/updated_at | timestamptz | |

### custom_categories（自定义分类模板）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid PK | |
| world_id | uuid FK→worlds | |
| name | text NOT NULL | 分类名（职业/种族等） |
| fields | jsonb DEFAULT '[]' | 自定义字段定义 |
| created_at/updated_at | timestamptz | |

### custom_entries（自定义分类条目）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid PK | |
| category_id | uuid FK→custom_categories | |
| name | text NOT NULL | |
| description | text | 富文本 |
| images | jsonb DEFAULT '[]' | |
| field_values | jsonb DEFAULT '{}' | 自定义字段值 |
| created_at/updated_at | timestamptz | |
