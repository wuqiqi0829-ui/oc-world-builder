// 数据库表类型定义

export interface World {
  id: string;
  user_id: string;
  name: string;
  cover_url: string | null;
  description: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Character {
  id: string;
  world_id: string;
  user_id: string;
  name: string;
  nickname: string;
  gender: string;
  age: string;
  appearance: string;
  personality: string;
  background: string;
  abilities: string;
  weaknesses: string;
  catchphrase: string;
  occupation: string;
  faction: string;
  images: ImageItem[];
  outfit_descriptions?: Record<string, string>;
  avatar_url?: string | null;
  card_bg_url?: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Timeline {
  id: string;
  world_id: string;
  user_id: string;
  name: string;
  parent_id?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface TimelineEvent {
  id: string;
  world_id: string;
  user_id: string;
  timeline_id?: string;
  title: string;
  time_label: string;
  description: string;
  images: ImageItem[];
  sort_order: number;
  collapsed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: string;
  world_id: string;
  user_id: string;
  name: string;
  description: string;
  images: ImageItem[];
  map_x: number;
  map_y: number;
  category: string;
  region: string;
  card_bg_url?: string | null;
  linked_characters?: string[];
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  world_id: string;
  user_id: string;
  name: string;
  type: string;
  description: string;
  images: ImageItem[];
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Item {
  id: string;
  world_id: string;
  user_id: string;
  name: string;
  category: string;
  description: string;
  attributes: Record<string, string>;
  images: ImageItem[];
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Relationship {
  id: string;
  world_id: string;
  user_id: string;
  source_type: string;
  source_id: string;
  target_type: string;
  target_id: string;
  relation_type: string;
  label: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface TagAssignment {
  id: string;
  tag_id: string;
  target_type: string;
  target_id: string;
}

export interface Volume {
  id: string;
  title: string;
  order: number;
  chapters: Chapter[];
}

export interface Storyline {
  id: string;
  world_id: string;
  user_id: string;
  title: string;
  description: string;
  chapters: Volume[];
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Chapter {
  id: string;
  title: string;
  brief?: string;
  content: string;
  order: number;
  created_at?: string;
}

export function normalizeChapters(raw: unknown): Volume[] {
  if (!raw || !Array.isArray(raw)) return [];
  if (raw.length === 0) return [];
  if ('chapters' in raw[0] && Array.isArray((raw[0] as Record<string, unknown>).chapters)) {
    return raw as Volume[];
  }
  return [{
    id: crypto.randomUUID(),
    title: '正文',
    order: 0,
    chapters: raw as Chapter[],
  }];
}

export interface Illustration {
  id: string;
  world_id: string;
  user_id: string;
  name: string;
  description: string;
  images: ImageItem[];
  linked_characters: string[];
  linked_timeline_events: string[];
  linked_storylines: string[];
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface TableItem {
  id: string;
  world_id: string;
  user_id: string;
  title: string;
  category: string;
  description: string;
  images: ImageItem[];
  linked_characters: string[];
  sort_order: number;
  show: boolean;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  world_id: string | null;
  user_id: string;
  title: string;
  content: string;
  linked_module: string;
  linked_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomCategory {
  id: string;
  world_id: string;
  user_id: string;
  name: string;
  fields: CustomField[];
  created_at: string;
  updated_at: string;
}

export interface CustomField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select';
  options?: string[];
}

export interface CustomEntry {
  id: string;
  category_id: string;
  user_id: string;
  name: string;
  description: string;
  images: ImageItem[];
  field_values: Record<string, string>;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ImageItem {
  url: string;
  label: string;
  order: number;
  displayUrl?: string;
  group?: string;
  subGroup?: string;
  isCover?: boolean;
}

// 新建/更新时省略服务端字段
export type NewWorld = Pick<World, 'name'> & Partial<Pick<World, 'cover_url' | 'description' | 'sort_order'>>;
export type UpdateWorld = Partial<Pick<World, 'name' | 'cover_url' | 'description' | 'sort_order'>>;

export type NewCharacter = Pick<Character, 'world_id' | 'name'> & Partial<Pick<Character, 'nickname' | 'gender' | 'age' | 'appearance' | 'personality' | 'background' | 'abilities' | 'weaknesses' | 'catchphrase' | 'occupation' | 'faction' | 'images'>>;
export type UpdateCharacter = Partial<Omit<Character, 'id' | 'user_id' | 'world_id' | 'created_at' | 'updated_at'>>;

export type NewTimeline = Pick<Timeline, 'world_id' | 'name'> & Partial<Pick<Timeline, 'sort_order'>>;
export type UpdateTimeline = Partial<Omit<Timeline, 'id' | 'user_id' | 'world_id' | 'created_at' | 'updated_at'>>;

export type NewTimelineEvent = Pick<TimelineEvent, 'world_id' | 'title'> & Partial<Pick<TimelineEvent, 'timeline_id' | 'time_label' | 'description' | 'images' | 'sort_order' | 'collapsed'>>;
export type UpdateTimelineEvent = Partial<Omit<TimelineEvent, 'id' | 'user_id' | 'world_id' | 'created_at' | 'updated_at'>>;

export type NewLocation = Pick<Location, 'world_id' | 'name'> & Partial<Pick<Location, 'description' | 'images' | 'map_x' | 'map_y' | 'category' | 'region'>>;
export type UpdateLocation = Partial<Omit<Location, 'id' | 'user_id' | 'world_id' | 'created_at' | 'updated_at'>>;

export type NewOrganization = Pick<Organization, 'world_id' | 'name'> & Partial<Pick<Organization, 'type' | 'description' | 'images'>>;
export type UpdateOrganization = Partial<Omit<Organization, 'id' | 'user_id' | 'world_id' | 'created_at' | 'updated_at'>>;

export type NewItem = Pick<Item, 'world_id' | 'name'> & Partial<Pick<Item, 'category' | 'description' | 'attributes' | 'images'>>;
export type UpdateItem = Partial<Omit<Item, 'id' | 'user_id' | 'world_id' | 'created_at' | 'updated_at'>>;

export type NewRelationship = Pick<Relationship, 'world_id' | 'source_type' | 'source_id' | 'target_type' | 'target_id' | 'relation_type'> & Partial<Pick<Relationship, 'label' | 'color'>>;

export type NewStoryline = Pick<Storyline, 'world_id' | 'title'> & Partial<Pick<Storyline, 'description' | 'chapters'>>;
export type UpdateStoryline = Partial<Omit<Storyline, 'id' | 'user_id' | 'world_id' | 'created_at' | 'updated_at'>>;

export type NewNote = Partial<Pick<Note, 'world_id' | 'content' | 'linked_module' | 'linked_id'>>;
export type UpdateNote = Partial<Pick<Note, 'content' | 'linked_module' | 'linked_id'>>;

export type NewIllustration = Pick<Illustration, 'world_id' | 'name'> & Partial<Pick<Illustration, 'description' | 'images' | 'linked_characters' | 'linked_timeline_events' | 'linked_storylines' | 'sort_order'>>;
export type UpdateIllustration = Partial<Omit<Illustration, 'id' | 'user_id' | 'world_id' | 'created_at' | 'updated_at'>>;
