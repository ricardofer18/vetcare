import * as React from "react";
import { cn } from "@/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Check } from "lucide-react";

interface ComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  label?: string;
  disabled?: boolean;
}

export const Combobox: React.FC<ComboboxProps> = ({ value, onChange, options, placeholder, label, disabled }) => {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(value || "");
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  // Filtrar opciones según lo que escribe el usuario
  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleSelect = (option: string) => {
    onChange(option);
    setInputValue(option);
    setOpen(false);
    inputRef.current?.blur();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setOpen(true);
    onChange(e.target.value); // Permite valores personalizados
  };

  const handleInputBlur = () => {
    setTimeout(() => setOpen(false), 100); // Espera para permitir click en sugerencia
  };

  const handleInputFocus = () => {
    setOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue) {
      onChange(inputValue);
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium mb-1">{label}</label>}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          className={cn(
            "w-full border rounded-md px-3 py-2 text-sm bg-background",
            disabled && "bg-muted cursor-not-allowed"
          )}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Buscar..."}
          disabled={disabled}
          autoComplete="off"
        />
        {open && filteredOptions.length > 0 && (
          <div className="absolute left-0 right-0 mt-1 z-50 bg-popover border rounded-md shadow-lg">
            <Command>
              <CommandList className="max-h-60 overflow-auto">
                {filteredOptions.length === 0 && (
                  <CommandEmpty>No hay resultados.</CommandEmpty>
                )}
                <CommandGroup>
                  {filteredOptions.map((option) => (
                    <CommandItem
                      key={option}
                      onMouseDown={() => handleSelect(option)}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === option ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {option}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        )}
      </div>
    </div>
  );
}; 