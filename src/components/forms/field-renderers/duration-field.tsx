"use client";

import { Input } from "@/components/ui/input";
import { registerField, type FieldRendererProps } from "../field-registry";

interface DurationValue {
  hours: number | undefined;
  minutes: number | undefined;
}

function DurationField({ value, onChange, readOnly }: FieldRendererProps) {
  const duration = (value as DurationValue) ?? {
    hours: undefined,
    minutes: undefined,
  };

  if (readOnly) {
    if (
      (duration.hours === undefined || duration.hours === null) &&
      (duration.minutes === undefined || duration.minutes === null)
    ) {
      return <p className="text-sm text-muted-foreground">—</p>;
    }
    const parts: string[] = [];
    if (duration.hours) parts.push(`${duration.hours}h`);
    if (duration.minutes) parts.push(`${duration.minutes}m`);
    return (
      <p className="text-sm text-muted-foreground">
        {parts.join(" ") || "—"}
      </p>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <Input
          type="number"
          min="0"
          value={duration.hours ?? ""}
          onChange={(e) => {
            const val = e.target.value;
            onChange({
              ...duration,
              hours: val === "" ? undefined : Number(val),
            });
          }}
          placeholder="0"
          className="w-20"
        />
        <span className="text-sm text-muted-foreground">hrs</span>
      </div>
      <div className="flex items-center gap-1">
        <Input
          type="number"
          min="0"
          max="59"
          value={duration.minutes ?? ""}
          onChange={(e) => {
            const val = e.target.value;
            onChange({
              ...duration,
              minutes: val === "" ? undefined : Number(val),
            });
          }}
          placeholder="0"
          className="w-20"
        />
        <span className="text-sm text-muted-foreground">min</span>
      </div>
    </div>
  );
}

registerField("duration", DurationField);
