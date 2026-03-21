"use client";

import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

const EMOJIS = [
  // Food & Drink
  "☕", "🍵", "🍺", "🍷", "🥤", "🍕", "🍔", "🍣", "🍜", "🧁",
  // Activities & Sports
  "📚", "🎬", "🎮", "🎵", "🏃", "🧘", "🚴", "⚽", "🏋️", "🎯",
  // Nature & Travel
  "🌿", "🌸", "🌍", "✈️", "🏔️", "🏖️", "🌅", "🐾",
  // Tech & Work
  "💻", "📱", "🔬", "💡", "📝", "📋", "🗂️", "📊",
  // Misc
  "❤️", "⭐", "🎨", "💊", "💰", "🏠", "👕", "🧠",
];

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
}

export function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button variant="outline" className="w-16 h-10 text-xl px-0">
            {value || "📋"}
          </Button>
        }
      />
      <PopoverContent align="start" className="w-72 p-3">
        <p className="text-xs text-muted-foreground mb-2">Pick an icon</p>
        <div className="grid grid-cols-8 gap-1">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className="h-8 w-8 flex items-center justify-center rounded text-lg hover:bg-accent transition-colors data-[selected=true]:ring-2 data-[selected=true]:ring-primary"
              data-selected={value === emoji}
              onClick={() => {
                onChange(emoji);
                setOpen(false);
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
