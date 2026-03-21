import { z } from "zod";
import { FIELD_TYPES } from "@/types/tracker";

export const fieldDefinitionSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(FIELD_TYPES),
  required: z.boolean().optional().default(false),
  options: z.array(z.string()).optional(),
});

export const trackerTypeSchema = z.object({
  name: z.string().min(1).max(100),
  icon: z.string().min(1).max(10),
  description: z.string().max(500),
  fields: z.array(fieldDefinitionSchema).min(1),
});

export const entrySchema = z.object({
  tracker_type_id: z.string().uuid(),
  title: z.string().min(1).max(200),
  status: z.enum(["done", "want_to"]),
  data: z.record(z.string(), z.unknown()),
  notes: z.string().nullable().optional(),
});

export const searchFiltersSchema = z.object({
  query: z.string().min(1),
  tracker_type_id: z.string().uuid().optional(),
  status: z.enum(["done", "want_to"]).optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  tags: z.array(z.string()).optional(),
});
