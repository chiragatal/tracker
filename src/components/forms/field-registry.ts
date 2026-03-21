import type { ComponentType } from "react";
import type { FieldType, FieldDefinition } from "@/types/tracker";

export interface FieldRendererProps {
  field: FieldDefinition;
  value: unknown;
  onChange: (value: unknown) => void;
  readOnly?: boolean;
}

const registry = new Map<FieldType, ComponentType<FieldRendererProps>>();

export function registerField(
  type: FieldType,
  component: ComponentType<FieldRendererProps>
) {
  registry.set(type, component);
}

export function getFieldRenderer(
  type: FieldType
): ComponentType<FieldRendererProps> | undefined {
  return registry.get(type);
}

export function getAllFieldTypes(): FieldType[] {
  return Array.from(registry.keys());
}
