"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface LocationItem {
  code: string;
  name: string;
}

interface LocationComboBoxProps {
  items: LocationItem[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
}

export function LocationComboBox({
  items,
  value,
  onChange,
  placeholder = "Select location...",
  disabled = false,
  isLoading = false,
}: LocationComboBoxProps) {
  const [open, setOpen] = React.useState(false);
  const selectedItem = items.find((i) => i.code === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal text-left h-10 px-3 py-2 border-slate-200"
          disabled={disabled}
        >
          {isLoading ? (
            <span className="flex items-center text-slate-400">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Loading...
            </span>
          ) : selectedItem ? (
            <span className="truncate">{selectedItem.name}</span>
          ) : (
            <span className="text-slate-500 truncate">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 text-slate-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder={`Search ${placeholder.toLowerCase()}`} />
          <CommandList>
            <CommandEmpty>No location found.</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.code}
                  value={item.name} // Command uses value to filter, so we pass the name here
                  onSelect={() => {
                    onChange(item.code);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === item.code ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {item.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
