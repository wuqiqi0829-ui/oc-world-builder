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
  created_at: string;
  updated_at: string;
}

export interface TimelineEvent {
  id: string;
  world_id: string;
  user_id: string;
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

export interface Storyline {
  id: string;
  world_id: string;
  user_id: string;
  title: string;
  description: string;
  chapters: Chapter[];
  created_at: string;
  updated_at: string;
}

export interface Chapter {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface Note {
  id: string;
  world_id: string | null;
  user_id: string;
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
  created_at: string;
  updated_at: string;
}

export interface ImageItem {
  url: string;
  label: string;
  order: number;
}

// 新建/更新时省略服务端字段
export type NewWorld = Pick<World, 'name'> & Partial<Pick<World, 'cover_url' | 'description' | 'sort_order'>>;
export type UpdateWorld = Partial<Pick<World, 'name' | 'cover_url' | 'description' | 'sort_order'>>;

export type NewCharacter = Pick<Character, 'world_id' | 'name'> & Partial<Pick<Character, 'nickname' | 'gender' | 'age' | 'appearance' | 'personality' | 'background' | 'abilities' | 'weaknesses' | 'catchphrase' | 'occupation' | 'faction' | 'images'>>;
export type UpdateCharacter = Partial<Omit<Character, 'id' | 'user_id' | 'world_id' | 'created_at' | 'updated_at'>>;

export type NewTimelineEvent = Pick<TimelineEvent, 'world_id' | 'title'> & Partial<Pick<TimelineEvent, 'time_label' | 'description' | 'images' | 'sort_order' | 'collapsed'>>;
export type UpdateTimelineEvent = Partial<Omit<TimelineEvent, 'id' | 'user_id' | 'world_id' | 'created_at' | 'updated_at'>>;

export type NewLocation = Pick<Location, 'world_id' | 'name'> & Partial<Pick<Location, 'description' | 'images' | 'map_x' | 'map_y' | 'category' | 'region'>>;
export type UpdateLocation = Partial<Omit<Location, 'id' | 'user_id' | 'world_id' | 'created_at' | 'updated_at'>>;

export type NewOrganization = Pick<Organization, 'world_id' | 'name'> & Partial<Pick<Organization, 'type' | 'description' | 'images'>>;
export type UpdateOrganization = Partial<Omit<Organization, 'id' | 'user_id' | 'world_id' | 'created_at' | 'updated_at'>>;

export type NewItem = Pick<Item, 'world_id' | 'name'> & Partial<Pick<Item, 'category' | 'description' | 'attributes' | 'images'>>;
export type UpdateItem = Partial<Omit<Item, 'id' | 'user_id' | 'world_id' | 'created_at' | 'updated_at'>>;

export type NewRelationship = Pick<Relationship, 'world_id' | 'source_type' | 'source_id' | 'target_type' | 'target_id' | 'relation_type'> & Partial<Pick<Relationship, 'label'>>;

export type NewStoryline = Pick<Storyline, 'world_id' | 'title'> & Partial<Pick<Storyline, 'description' | 'chapters'>>;
export type UpdateStoryline = Partial<Omit<Storyline, 'id' | 'user_id' | 'world_id' | 'created_at' | 'updated_at'>>;

export type NewNote = Partial<Pick<Note, 'world_id' | 'content' | 'linked_module' | 'linked_id'>>;
export type UpdateNote = Partial<Pick<Note, 'content' | 'linked_module' | 'linked_id'>>;
