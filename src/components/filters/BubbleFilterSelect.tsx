import React, { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ServiceOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface BubbleFilterSelectProps {
  value: string[];
  onValueChange: (value: string[]) => void;
  options: ServiceOption[];
  placeholder?: string;
  className?: string;
  multiple?: boolean;
}

export function BubbleFilterSelect({
  value,
  onValueChange,
  options,
  placeholder = "All services",
  className,
  multiple = true
}: BubbleFilterSelectProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getDisplayLabel = () => {
    if (!value || value.length === 0) return placeholder;
    if (value.length === 1) {
      const selectedOption = options.find(option => option.value === value[0]);
      return selectedOption?.label || placeholder;
    }
    return `${value.length} services selected`;
  };

  const handleSelect = (optionValue: string) => {
    if (!multiple) {
      onValueChange([optionValue]);
      setIsExpanded(false);
      return;
    }

    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue];
    
    onValueChange(newValue);
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange([]);
    setIsExpanded(false);
  };

  return (
    <div className={cn("relative", className)}>
      {/* Primary bubble/trigger */}
      <Button
        variant="outline"
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "h-auto min-h-10 px-4 py-2 rounded-full border-2 transition-all duration-200",
          "hover:border-[#063f55]/50 focus:border-[#063f55]",
          isExpanded && "border-[#063f55] shadow-lg",
          value && value.length > 0 && "bg-[#063f55]/5 border-[#063f55] text-[#063f55]"
        )}
      >
        <span className="flex items-center gap-2">
          <span className="font-medium">{getDisplayLabel()}</span>
          {value && value.length > 0 && (
            <X 
              className="h-4 w-4 ml-1 hover:bg-destructive/10 rounded-full p-0.5" 
              onClick={handleClearAll}
            />
          )}
          <ChevronDown 
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              isExpanded && "rotate-180"
            )} 
          />
        </span>
      </Button>

      {/* Expanded bubbles */}
      {isExpanded && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50">
          <div className={cn(
            "bg-background border rounded-xl shadow-lg p-4",
            "animate-fade-in"
          )}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {/* All services option */}
              <Badge
                variant={!value || value.length === 0 ? "default" : "outline"}
                className={cn(
                  "cursor-pointer px-3 py-2 rounded-full transition-all duration-200",
                  "hover:scale-105 hover:shadow-md text-center justify-center",
                  "border-2 font-medium",
                  !value || value.length === 0
                    ? "bg-[#063f55] text-white border-[#063f55]" 
                    : "hover:border-[#063f55]/50"
                )}
                onClick={() => onValueChange([])}
              >
                All Services
              </Badge>
              
              {/* Service options */}
              {options.map((option, index) => {
                const isSelected = value.includes(option.value);
                return (
                  <Badge
                    key={option.value}
                    variant={isSelected ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer px-3 py-2 rounded-full transition-all duration-200",
                      "hover:scale-105 hover:shadow-md text-center justify-center",
                      "border-2 font-medium",
                      "animate-fade-in",
                      isSelected 
                        ? "bg-[#063f55] text-white border-[#063f55]" 
                        : "hover:border-[#063f55]/50"
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => handleSelect(option.value)}
                  >
                    <span className="flex items-center gap-1">
                      {option.icon}
                      {option.label}
                      {isSelected && <span className="text-xs ml-1">✓</span>}
                    </span>
                  </Badge>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isExpanded && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
}