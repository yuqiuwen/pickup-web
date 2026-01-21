// src/lib/components/share/ShareForm.tsx

import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { InviteUserSelect } from '@/components/biz/anniv/InviteUserSelect';
import { ShareConfig } from '@/types/anniv';

interface ShareFormProps {
  value: ShareConfig;
  onChange: (config: ShareConfig) => void;
}

export function ShareForm({ value, onChange }: ShareFormProps) {
  const updateField = <K extends keyof ShareConfig>(
    field: K,
    fieldValue: ShareConfig[K]
  ) => {
    onChange({ ...value, [field]: fieldValue });
  };

  return (
    <div className="space-y-6">
      <InviteUserSelect
        appUsers={value.invite_app_users}
        externalEmails={value.invite_external_users}
        groups={value.invite_groups}
        onAppUsersChange={(users) => updateField('invite_app_users', users)}
        onExternalEmailsChange={(emails) => updateField('invite_external_users', emails)}
        onGroupsChange={(groups) => updateField('invite_groups', groups)}
      />

      <div className="space-y-2">
        <Label>邀请留言</Label>
        <Textarea
          placeholder="添加一条邀请留言..."
          value={value.message}
          onChange={(e) => updateField('message', e.target.value)}
          rows={3}
        />
      </div>
    </div>
  );
}