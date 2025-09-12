import React, { useState } from 'react';
import { ChevronDown, X, Filter } from 'lucide-react';
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
      {/* Filter icon trigger */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-10 h-10 p-0 rounded-lg border-2 transition-all duration-200",
          "bg-white/90 backdrop-blur-sm border-[hsl(var(--medme-navy))] shadow-md hover:bg-white/95 text-[hsl(var(--medme-navy))]",
          isExpanded && "border-[hsl(var(--nav-button))] shadow-lg",
          value && value.length > 0 && "bg-[hsl(var(--medme-navy))]/10 border-[hsl(var(--medme-navy))]"
        )}
      >
        <Filter className="h-4 w-4" />
        {value && value.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-[hsl(var(--medme-navy))] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {value.length}
          </span>
        )}
      </Button>

      {/* Expanded bubbles */}
      {isExpanded && (
        <div className="absolute top-full left-0 mt-2 z-50 w-full max-w-[95vw] sm:max-w-2xl lg:max-w-4xl">
          <div className={cn(
            "bg-white border border-border rounded-xl shadow-lg p-4",
            "animate-fade-in"
          )}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {/* All services option */}
              <Badge
                variant={!value || value.length === 0 ? "default" : "outline"}
                className={cn(
                  "cursor-pointer px-3 py-2 rounded-full transition-all duration-200",
                  "hover:scale-105 hover:shadow-md text-center justify-center",
                  "border-2 font-medium whitespace-nowrap",
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
                      "border-2 font-medium whitespace-nowrap text-xs",
                      "animate-fade-in",
                      isSelected 
                        ? "bg-[#063f55] text-white border-[#063f55] hover:bg-white hover:text-[hsl(var(--nav-button))] hover:border-[hsl(var(--nav-button))]" 
                        : "hover:border-[hsl(var(--nav-button))] hover:text-[hsl(var(--nav-button))] hover:bg-white"
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