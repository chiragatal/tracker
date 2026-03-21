"use client";

import { Star } from "lucide-react";
import { registerField, type FieldRendererProps } from "../field-registry";

function RatingField({ value, onChange, readOnly }: FieldRendererProps) {
  const rating = (value as number) ?? 0;

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange(star === rating ? 0 : star)}
          className="p-0.5 disabled:cursor-default"
        >
          <Star
            className={`h-5 w-5 transition-colors ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground/40"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

registerField("rating", RatingField);
