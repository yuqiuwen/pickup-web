// src/components/LunarDatePicker/types.ts
export interface LunarDateValue {
    year: number;
    month: number;
    isLeapMonth: boolean;
    day: number;
  }
  
  export interface LunarMonthOption {
    value: number;
    label: string;
    isLeap: boolean;
    key: string;
  }
  
  export interface LunarDatePickerProps {
    value?: LunarDateValue | null;
    onChange?: (value: LunarDateValue) => void;
    minYear?: number;
    maxYear?: number;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    name?: string;
  }