"use client";

import { Input } from "@/components/ui/input";
import { registerField, type FieldRendererProps } from "../field-registry";

interface PriceValue {
  amount: number | undefined;
  currency: string;
}

function PriceField({ field, value, onChange, readOnly }: FieldRendererProps) {
  const price = (value as PriceValue) ?? { amount: undefined, currency: "USD" };

  if (readOnly) {
    if (price.amount === undefined || price.amount === null) {
      return <p className="text-sm text-muted-foreground">—</p>;
    }
    return (
      <p className="text-sm text-muted-foreground">
        ${price.amount.toFixed(2)} {price.currency}
      </p>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <span className="text-sm text-muted-foreground">$</span>
      <Input
        type="number"
        step="0.01"
        min="0"
        value={price.amount ?? ""}
        onChange={(e) => {
          const val = e.target.value;
          onChange({
            ...price,
            amount: val === "" ? undefined : Number(val),
          });
        }}
        placeholder={`Enter ${field.label.toLowerCase()}...`}
        className="flex-1"
      />
    </div>
  );
}

registerField("price", PriceField);
