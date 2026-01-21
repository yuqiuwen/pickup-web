// src/lib/components/reminder/ReminderSlotForm.tsx

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ReminderSlot } from '@/types/anniv';

interface ReminderSlotFormProps {
  value: ReminderSlot[];
  onChange: (slots: ReminderSlot[]) => void;
}

const OFFSET_OPTIONS = [
  { value: 0, label: '当天' },
  { value: 1, label: '提前1天' },
  { value: 3, label: '提前3天' },
  { value: 7, label: '提前7天' },
  { value: 14, label: '提前14天' },
  { value: 30, label: '提前30天' },
];

export function ReminderSlotForm({ value, onChange }: ReminderSlotFormProps) {
  const addSlot = () => {
    onChange([...value, { offset_days: 0, trigger_time: '09:00' }]);
  };

  const removeSlot = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const updateSlot = (index: number, updates: Partial<ReminderSlot>) => {
    onChange(value.map((slot, i) => (i === index ? { ...slot, ...updates } : slot)));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>提醒时间</Label>
        <Button type="button" variant="outline" size="sm" onClick={addSlot}>
          <Plus className="h-4 w-4 mr-1" />
          添加
        </Button>
      </div>

      <div className="space-y-3">
        {value.map((slot, index) => (
          <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <Select
              value={slot.offset_days.toString()}
              onValueChange={(v) => updateSlot(index, { offset_days: Number(v) })}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OFFSET_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="time"
              value={slot.trigger_time}
              onChange={(e) => updateSlot(index, { trigger_time: e.target.value })}
              className="w-[120px]"
            />

            {value.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeSlot(index)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}