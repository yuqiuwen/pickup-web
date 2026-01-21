// src/components/LunarDatePicker/LunarDatePicker.tsx
import React, { 
  useState, 
  useRef, 
  useEffect, 
  useCallback, 
  forwardRef,
  useImperativeHandle
} from 'react';
import { useLunarCalendar } from '@/hooks/use-lunar';
import type { LunarDatePickerProps, LunarDateValue } from './types';
import './LunarDatePicker.css';
import { Button } from '@/components/ui/button';

// 选项高度（需要和 CSS 保持一致）
const OPTION_HEIGHT = 40;
// 可见选项数量（奇数，确保中间有一个）
const VISIBLE_COUNT = 5;

const LunarDatePicker = forwardRef<HTMLInputElement, LunarDatePickerProps>(({
  value,
  onChange,
  minYear = 1900,
  maxYear = 2100,
  placeholder = '请选择农历日期',
  disabled = false,
  className = '',
  name
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(1);
  const [isLeapMonth, setIsLeapMonth] = useState<boolean>(false);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const yearListRef = useRef<HTMLDivElement>(null);
  const monthListRef = useRef<HTMLDivElement>(null);
  const dayListRef = useRef<HTMLDivElement>(null);
  
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  const {
    yearOptions,
    getMonthOptions,
    getDayOptions,
    formatDisplayValue
  } = useLunarCalendar(minYear, maxYear);

  const monthOptions = getMonthOptions(selectedYear);
  const dayOptions = getDayOptions(selectedYear, selectedMonth, isLeapMonth);

  // 计算填充高度（使第一个和最后一个选项可以滚动到中间）
  const paddingHeight = OPTION_HEIGHT * Math.floor(VISIBLE_COUNT / 2);

  // 滚动到指定索引
  const scrollToIndex = useCallback((
    listRef: React.RefObject<HTMLDivElement>, 
    index: number,
    smooth = false
  ) => {
    const list = listRef.current;
    if (!list || index < 0) return;
    
    const targetScrollTop = index * OPTION_HEIGHT;
    
    list.scrollTo({
      top: targetScrollTop,
      behavior: smooth ? 'smooth' : 'auto'
    });
  }, []);

  // 根据滚动位置获取选中的索引
  const getSelectedIndex = useCallback((scrollTop: number) => {
    return Math.round(scrollTop / OPTION_HEIGHT);
  }, []);

  // 处理滚动结束，吸附到最近的选项
  const handleScrollEnd = useCallback((
    listRef: React.RefObject<HTMLDivElement>,
    options: { value: number; label: string; isLeap?: boolean }[],
    onSelect: (index: number) => void
  ) => {
    const list = listRef.current;
    if (!list) return;
    
    const index = getSelectedIndex(list.scrollTop);
    const clampedIndex = Math.max(0, Math.min(index, options.length - 1));
    
    // 吸附到选项
    scrollToIndex(listRef, clampedIndex, true);
    onSelect(clampedIndex);
  }, [getSelectedIndex, scrollToIndex]);

  // 滚动事件处理（带防抖）
  const createScrollHandler = useCallback((
    listRef: React.RefObject<HTMLDivElement>,
    options: { value: number; label: string; isLeap?: boolean }[],
    onSelect: (index: number) => void
  ) => {
    let scrollTimer: NodeJS.Timeout | null = null;
    
    return () => {
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        handleScrollEnd(listRef, options, onSelect);
      }, 100);
    };
  }, [handleScrollEnd]);

  // 打开时滚动到选中项
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        const yearIndex = yearOptions.findIndex(opt => opt.value === selectedYear);
        const monthIndex = monthOptions.findIndex(
          opt => opt.value === selectedMonth && opt.isLeap === isLeapMonth
        );
        const dayIndex = selectedDay - 1;

        scrollToIndex(yearListRef, yearIndex);
        scrollToIndex(monthListRef, monthIndex);
        scrollToIndex(dayListRef, dayIndex);
      });
    }
  }, [isOpen, selectedYear, selectedMonth, isLeapMonth, selectedDay, yearOptions, monthOptions, scrollToIndex]);

  // 同步外部 value
  useEffect(() => {
    if (value) {
      setSelectedYear(value.year);
      setSelectedMonth(value.month);
      setIsLeapMonth(value.isLeapMonth);
      setSelectedDay(value.day);
    }
  }, [value]);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 年份选择
  const handleYearSelect = useCallback((index: number) => {
    const option = yearOptions[index];
    if (!option) return;
    
    setSelectedYear(option.value);
    const newMonthOptions = getMonthOptions(option.value);
    
    if (!newMonthOptions.some(m => m.value === selectedMonth && m.isLeap === isLeapMonth)) {
      setSelectedMonth(1);
      setIsLeapMonth(false);
      scrollToIndex(monthListRef, 0, true);
    }
    setSelectedDay(1);
    scrollToIndex(dayListRef, 0, true);
  }, [yearOptions, getMonthOptions, selectedMonth, isLeapMonth, scrollToIndex]);

  // 月份选择
  const handleMonthSelect = useCallback((index: number) => {
    const option = monthOptions[index];
    if (!option) return;
    
    setSelectedMonth(option.value);
    setIsLeapMonth(option.isLeap);
    
    const newDayOptions = getDayOptions(selectedYear, option.value, option.isLeap);
    if (selectedDay > newDayOptions.length) {
      setSelectedDay(newDayOptions.length);
      scrollToIndex(dayListRef, newDayOptions.length - 1, true);
    }
  }, [monthOptions, getDayOptions, selectedYear, selectedDay, scrollToIndex]);

  // 日期选择
  const handleDaySelect = useCallback((index: number) => {
    const option = dayOptions[index];
    if (!option) return;
    setSelectedDay(option.value);
  }, [dayOptions]);

  // 点击选项
  const handleOptionClick = (
    listRef: React.RefObject<HTMLDivElement>,
    index: number
  ) => {
    scrollToIndex(listRef, index, true);
  };

  // 确认
  const handleConfirm = useCallback(() => {
    onChange?.({
      year: selectedYear,
      month: selectedMonth,
      isLeapMonth,
      day: selectedDay
    });
    setIsOpen(false);
  }, [selectedYear, selectedMonth, isLeapMonth, selectedDay, onChange]);

  const displayValue = value 
    ? formatDisplayValue(value.year, value.month, value.isLeapMonth, value.day)
    : '';

  // 渲染滚动列
  const renderColumn = (
    listRef: React.RefObject<HTMLDivElement>,
    options: { value: number; label: string; isLeap?: boolean; key?: string }[],
    selectedValue: number,
    isLeapSelected: boolean | undefined,
    onSelect: (index: number) => void,
    type: 'year' | 'month' | 'day'
  ) => {
    const scrollHandler = createScrollHandler(listRef, options, onSelect);
    
    return (
      <div className="lunar-picker__column">
        <div 
          className="lunar-picker__list" 
          ref={listRef}
          onScroll={scrollHandler}
        >
          {/* 顶部填充 */}
          <div style={{ height: paddingHeight }} />
          
          {options.map((option, index) => {
            const isSelected = type === 'month' 
              ? option.value === selectedValue && option.isLeap === isLeapSelected
              : option.value === selectedValue;
            
            return (
              <div
                key={option.key || option.value}
                className={`lunar-picker__option ${isSelected ? 'selected' : ''} ${option.isLeap ? 'leap' : ''}`}
                onClick={() => handleOptionClick(listRef, index)}
              >
                {option.label}
              </div>
            );
          })}
          
          {/* 底部填充 */}
          <div style={{ height: paddingHeight }} />
        </div>
        
        {/* 上下遮罩 */}
        <div className="lunar-picker__mask lunar-picker__mask--top" />
        <div className="lunar-picker__mask lunar-picker__mask--bottom" />
      </div>
    );
  };

  return (
    <div 
      ref={containerRef} 
      className={`lunar-date-picker ${className} ${disabled ? 'disabled' : ''}`}
    >
      <input
        ref={inputRef}
        type="hidden"
        name={name}
        value={value ? JSON.stringify(value) : ''}
      />
      
      <div 
        className={`lunar-date-picker__input ${isOpen ? 'active' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={displayValue ? '' : 'placeholder'}>
          {displayValue || placeholder}
        </span>
        <svg className="lunar-date-picker__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2"/>
          <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2"/>
          <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2"/>
          <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2"/>
        </svg>
      </div>

      {isOpen && (
        <div className="lunar-date-picker__dropdown">
          <div className="lunar-date-picker__header">
            <Button 
              type="button"
               variant="outline"
              onClick={() => setIsOpen(false)}
            >
              取消
            </Button>
            <span className="lunar-date-picker__header-title">选择农历日期</span>
            <Button 
              type="button"
              onClick={handleConfirm}
            >
              确定
            </Button>
          </div>
          
          <div className="lunar-picker">
            {/* 中间高亮区域 + 分割线 */}
            <div className="lunar-picker__highlight" />
            
            <div className="lunar-picker__columns">
              {/* 年份列 */}
              {renderColumn(
                yearListRef,
                yearOptions,
                selectedYear,
                undefined,
                handleYearSelect,
                'year'
              )}
              
              {/* 月份列 */}
              {renderColumn(
                monthListRef,
                monthOptions,
                selectedMonth,
                isLeapMonth,
                handleMonthSelect,
                'month'
              )}
              
              {/* 日期列 */}
              {renderColumn(
                dayListRef,
                dayOptions,
                selectedDay,
                undefined,
                handleDaySelect,
                'day'
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

LunarDatePicker.displayName = 'LunarDatePicker';

export default LunarDatePicker;