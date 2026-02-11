import React, { useState } from "react";
import {
  ChevronRight,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface FloatingFieldProps {
  label: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: React.HTMLInputTypeAttribute;
  required?: boolean;
  error?: string;
}

export interface SearchableSelectOption {
  id?: string;
  name?: string;
  title?: string;
}

export interface FloatingSearchableSelectProps<
  T extends SearchableSelectOption | string,
> {
  label: string;
  value: string | null;
  options: T[];
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  error?: string;
}

type ToggleRowProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};


export const FloatingField: React.FC<FloatingFieldProps> = ({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  error,
}) => {
  return (
    <div className="relative mb-6">
      <div
        className={cn(
          "relative border-b-2 transition-colors",
          error
            ? "border-rose-500"
            : "border-slate-200 focus-within:border-blue-600",
        )}
      >
        <Input
          type={type}
          value={value}
          onChange={onChange}
          placeholder=" "
          className="peer h-10 px-0 bg-transparent border-none shadow-none focus-visible:ring-0"
        />
        <Label
          className={cn(
            "absolute left-0 top-2 text-slate-400 transition-all cursor-text",
            "peer-focus:-top-3 peer-focus:text-xs peer-focus:text-blue-600",
            value && "-top-3 text-xs text-slate-500",
          )}
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </Label>
      </div>
      {error && <p className="text-[10px] text-rose-500 mt-1">{error}</p>}
    </div>
  );
};

export function FloatingSearchableSelect<
  T extends { id?: string; name?: string; title?: string } | string,
>({
  label,
  value,
  options,
  onChange,
  required = false,
  disabled = false,
  error,
}: FloatingSearchableSelectProps<T>) {
  const [open, setOpen] = useState(false);

  const resolveLabel = (val: string | null): string => {
    if (!val) return "";

    const match = options.find((opt) =>
      typeof opt === "string" ? opt === val : opt.id === val,
    );

    if (!match) return "";

    return typeof match === "string"
      ? match
      : match.name || match.title || match.id || "";
  };

  const displayValue = resolveLabel(value);

  return (
    <div className="relative mb-6">
      <div
        className={cn(
          "relative border-b-2 transition-colors",
          error
            ? "border-rose-500"
            : open
              ? "border-blue-600"
              : "border-slate-200",
        )}
      >
        {/* Trigger */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              disabled={disabled}
              className="peer h-10 w-full px-0 justify-between rounded-none shadow-none hover:bg-transparent"
            >
              <span
                className={cn(
                  "truncate text-left",
                  displayValue ? "text-slate-900" : "text-transparent",
                )}
              >
                {displayValue || "—"}
              </span>
              <ChevronRight className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-80 p-0 shadow-none border-slate-200">
            <Command>
              <CommandInput placeholder={`Search ${label.toLowerCase()}...`} />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>

                <CommandGroup>
                  {options.map((option) => {
                    const optionValue =
                      typeof option === "string" ? option : option.id!;
                    const optionLabel =
                      typeof option === "string"
                        ? option
                        : option.name || option.title || option.id!;

                    return (
                      <CommandItem
                        key={optionValue}
                        value={optionValue}
                        onSelect={() => {
                          onChange(optionValue);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value === optionValue ? "opacity-100" : "opacity-0",
                          )}
                        />
                        {optionLabel}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Floating Label */}
        <Label
          className={cn(
            "absolute left-0 top-2 text-slate-400 transition-all cursor-pointer",
            (open || value) && "-top-3 text-xs text-slate-500",
            open && "text-blue-600",
          )}
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </Label>
      </div>

      {error && <p className="text-[10px] text-rose-500 mt-1">{error}</p>}
    </div>
  );
}

export const SectionHeader = ({ title }: { title: string }) => (
  <div className="flex items-center gap-4 mt-8 mb-6">
    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">
      {title}
    </h4>
    <Separator className="flex-1 bg-slate-100" />
  </div>
);

export const ToggleRow = ({ label, checked, onChange }: ToggleRowProps) => (
  <div className="flex items-center justify-between p-2 border border-slate-200 rounded-md">
    <span className="text-xs font-medium text-slate-600 uppercase">
      {label}
    </span>
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="h-4 w-4 accent-blue-600"
    />
  </div>
);

export function SectionDetailsHeader({ title, description, icon: Icon }: { title: string; description?: string; icon?: LucideIcon }) {
  return (
    <div className="border-b border-slate-100 pb-4 mb-6">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-5 h-5 text-indigo-600" />}
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      </div>
      {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
    </div>
  );
}

export function EditButton() {
  return (
    <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50 transition-all shadow-none">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
      Edit
    </button>
  );
}