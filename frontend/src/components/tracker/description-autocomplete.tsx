"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface RecentSuggestion {
  description: string;
  projectId: string | null;
  taskId: string | null;
  isBillable: boolean;
  tagIds: string[];
  projectName?: string;
  projectColor?: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSelect: (suggestion: RecentSuggestion) => void;
  /** Called in addition to onSelect when the user confirms with Enter. */
  onConfirm?: (suggestion: RecentSuggestion) => void;
  suggestions: RecentSuggestion[];
  placeholder?: string;
  className?: string;
}

export function DescriptionAutocomplete({
  value,
  onChange,
  onSelect,
  onConfirm,
  suggestions,
  placeholder,
  className,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const filtered = useMemo(() => {
    if (!value.trim()) return suggestions;
    const lower = value.toLowerCase();
    return suggestions.filter((s) =>
      s.description.toLowerCase().includes(lower),
    );
  }, [suggestions, value]);

  const handleSelect = useCallback(
    (sug: RecentSuggestion) => {
      onSelect(sug);
      setIsOpen(false);
      setActiveIndex(-1);
    },
    [onSelect],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || filtered.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      const chosen = filtered[activeIndex];
      handleSelect(chosen);
      onConfirm?.(chosen);
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  const showDropdown = isOpen && filtered.length > 0;

  return (
    <div className={cn("relative flex-1", className)}>
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        onKeyDown={handleKeyDown}
        className="w-full"
      />
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-56 overflow-auto rounded-md border bg-popover shadow-md">
          {filtered.map((sug, i) => (
            <div
              key={`${sug.description}||${sug.projectId ?? ""}||${sug.taskId ?? ""}`}
              className={cn(
                "flex cursor-pointer items-center gap-2 px-3 py-2 text-sm",
                i === activeIndex ? "bg-accent" : "hover:bg-accent/60",
              )}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(sug)}
            >
              <span className="min-w-0 flex-1 truncate">{sug.description}</span>
              {sug.projectName && (
                <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                  {sug.projectColor && (
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ background: sug.projectColor }}
                    />
                  )}
                  {sug.projectName}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
