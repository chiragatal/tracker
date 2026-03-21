export const FIELD_TYPES = [
  "text",
  "long_text",
  "number",
  "date",
  "rating",
  "image",
  "url",
  "tags",
  "location",
  "price",
  "duration",
  "checkbox",
  "dropdown",
] as const;

export type FieldType = (typeof FIELD_TYPES)[number];

export interface FieldDefinition {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[]; // for dropdown
}

export interface TrackerType {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  fields: FieldDefinition[];
  created_by: string;
  created_at: string;
}

export interface UserTracker {
  id: string;
  user_id: string;
  tracker_type_id: string;
  created_at: string;
  tracker_type?: TrackerType; // joined
}

export type EntryStatus = "done" | "want_to";

export interface Entry {
  id: string;
  tracker_type_id: string;
  user_id: string;
  title: string;
  status: EntryStatus;
  data: Record<string, unknown>;
  notes: string | null;
  is_public?: boolean;
  created_at: string;
  updated_at: string;
  tracker_type?: TrackerType; // joined
  images?: EntryImage[]; // joined
}

export interface EntryImage {
  id: string;
  entry_id: string;
  url: string;
  alt_text: string | null;
  position: number;
}

export interface SearchFilters {
  query: string;
  tracker_type_id?: string;
  status?: EntryStatus;
  date_from?: string;
  date_to?: string;
  tags?: string[];
}
