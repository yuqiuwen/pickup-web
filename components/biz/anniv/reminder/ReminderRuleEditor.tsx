
'use client';

import { useState } from 'react';
import { PlusIcon, TrashIcon, BellIcon, MailIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { ReminderRule, ReminderSlot } from '@/types/anniv';
import {ReminderChannel} from '@/lib/constant'

interface ReminderRuleEditorProps {
  value?: ReminderRule;
  onChange: (value: ReminderRule) => void;
}

const CHANNEL_OPTIONS = [
  { value: ReminderChannel.IN_APP, label: '站内通知', icon: BellIcon },
  { value: ReminderChannel.EMAIL, label: '邮件通知', icon: MailIcon },
];

const OFFSET_OPTIONS = [
  { value: 0, label: '当天' },
  { value: 1, label: '提前1天' },
  { value: 3, label: '提前3天' },
  { value: 7, label: '提前1周' },
  { value: 14, label: '提前2周' },
  { value: 30, label: '提前1个月' },
];

export function ReminderRuleEditor({ value, onChange }: ReminderRuleEditorProps) {
  const [rule, setRule] = useState<ReminderRule>(
    value || {
      channels: [ReminderChannel.IN_APP],
      slots: [{ offset_days: 0, trigger_time: '09:00' }],
    }
  );

  const updateRule = (updates: Partial<ReminderRule>) => {
    const newRule = { ...rule, ...updates };
    setRule(newRule);
    onChange(newRule);
  };

  const toggleChannel = (channel: ReminderChannel) => {
    const channels = rule.channels.includes(channel)
      ? rule.channels.filter((c) => c !== channel)
      : [...rule.channels, channel];
    updateRule({ channels });
  };

  const addSlot = () => {
    if (rule.slots.length >= 5) return;
    updateRule({
      slots: [...rule.slots, { offset_days: 1, trigger_time: '09:00' }],
    });
  };

  const removeSlot = (index: number) => {
    if (rule.slots.length <= 1) return;
    updateRule({
      slots: rule.slots.filter((_, i) => i !== index),
    });
  };

  const updateSlot = (index: number, updates: Partial<ReminderSlot>) => {
    const slots = rule.slots.map((slot, i) =>
      i === index ? { ...slot, ...updates } : slot
    );
    updateRule({ slots });
  };

  return (
    <div className="space-y-6">
      {/* 提醒渠道 */}
      <div className="space-y-3">
        <Label>提醒渠道</Label>
        <div className="flex gap-4">
          {CHANNEL_OPTIONS.map((option) => (
            <div
              key={option.value}
              className="flex items-center space-x-2"
            >
              <Checkbox
                id={`channel-${option.value}`}
                checked={rule.channels.includes(option.value)}
                onCheckedChange={() => toggleChannel(option.value)}
              />
              <label
                htmlFor={`channel-${option.value}`}
                className="flex items-center gap-2 text-sm font-medium leading-none cursor-pointer"
              >
                <option.icon className="h-4 w-4" />
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* 提醒时间槽 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>提醒时间</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addSlot}
            disabled={rule.slots.length >= 5}
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            添加
          </Button>
        </div>

        <div className="space-y-3">
          {rule.slots.map((slot, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground mb-1 block">
                      提前时间
                    </Label>
                    <Select
                      value={String(slot.offset_days)}
                      onValueChange={(v) =>
                        updateSlot(index, { offset_days: Number(v) })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {OFFSET_OPTIONS.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={String(option.value)}
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground mb-1 block">
                      提醒时间
                    </Label>
                    <Input
                      type="time"
                      value={slot.trigger_time}
                      onChange={(e) =>
                        updateSlot(index, { trigger_time: e.target.value })
                      }
                    />
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSlot(index)}
                    disabled={rule.slots.length <= 1}
                    className="mt-5"
                  >
                    <TrashIcon className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}