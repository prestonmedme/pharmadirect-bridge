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
  value: string;
  onValueChange: (value: string) => void;
  options: ServiceOption[];
  placeholder?: string;
  className?: string;
}

export function BubbleFilterSelect({
  value,
  onValueChange,
  options,
  placeholder = "All services",
  className
}: BubbleFilterSelectProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const selectedOption = options.find(option => option.value === value);
  const displayLabel = selectedOption?.label || placeholder;

  const handleSelect = (optionValue: string) => {
    onValueChange(optionValue);
    setIsExpanded(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange('');
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
          "hover:border-primary/50 focus:border-primary",
          isExpanded && "border-primary shadow-lg",
          value && "bg-primary/5 border-primary text-primary"
        )}
      >
        <span className="flex items-center gap-2">
          {selectedOption?.icon}
          <span className="font-medium">{displayLabel}</span>
          {value && (
            <X 
              className="h-4 w-4 ml-1 hover:bg-destructive/10 rounded-full p-0.5" 
              onClick={handleClear}
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
                variant={!value ? "default" : "outline"}
                className={cn(
                  "cursor-pointer px-3 py-2 rounded-full transition-all duration-200",
                  "hover:scale-105 hover:shadow-md text-center justify-center",
                  "border-2 font-medium",
                  !value 
                    ? "bg-primary text-primary-foreground border-primary" 
                    : "hover:border-primary/50"
                )}
                onClick={() => handleSelect('')}
              >
                All Services
              </Badge>
              
              {/* Service options */}
              {options.map((option, index) => (
                <Badge
                  key={option.value}
                  variant={value === option.value ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer px-3 py-2 rounded-full transition-all duration-200",
                    "hover:scale-105 hover:shadow-md text-center justify-center",
                    "border-2 font-medium",
                    "animate-fade-in",
                    value === option.value 
                      ? "bg-primary text-primary-foreground border-primary" 
                      : "hover:border-primary/50"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => handleSelect(option.value)}
                >
                  <span className="flex items-center gap-1">
                    {option.icon}
                    {option.label}
                  </span>
                </Badge>
              ))}
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