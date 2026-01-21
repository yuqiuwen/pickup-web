// src/lib/components/reminder/ReminderChannelSelect.tsx

import React from 'react';
import { Bell, Mail } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ReminderChannel } from '@/lib/constant';

interface ReminderChannelSelectProps {
  value: ReminderChannel[];
  onChange: (channels: ReminderChannel[]) => void;
}

const CHANNELS = [
  { id: ReminderChannel.IN_APP, label: '站内通知', icon: Bell },
  { id: ReminderChannel.EMAIL, label: '邮件提醒', icon: Mail },
];

export function ReminderChannelSelect({ value, onChange }: ReminderChannelSelectProps) {
  const toggleChannel = (channel: ReminderChannel) => {
    if (value.includes(channel)) {
      onChange(value.filter((c) => c !== channel));
    } else {
      onChange([...value, channel]);
    }
  };

  return (
    <div className="space-y-3">
      <Label>提醒渠道</Label>
      <div className="flex gap-4">
        {CHANNELS.map(({ id, label, icon: Icon }) => (
          <div key={id} className="flex items-center space-x-2">
            <Checkbox
              id={`channel-${id}`}
              checked={value.includes(id)}
              onCheckedChange={() => toggleChannel(id)}
            />
            <Label
              htmlFor={`channel-${id}`}
              className="flex items-center gap-1 cursor-pointer"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}