import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { useGroupMemberSearch } from "@/hooks/use-group";
import { cn } from "@/lib/utils";
import { ShareGroup, SimpleUser } from "@/types/auth";
import { Check, ChevronDown, Search, User, Users, Users2, X } from "lucide-react";
import { useState } from "react";
import {UserAvatar} from "@/components/biz/common/UserAvatar"

interface UserGroupSelectProps {
  selectedUsers: SimpleUser[];
  selectedGroups: ShareGroup[];
  onSelectUser: (user: SimpleUser) => void;
  onSelectGroup: (group: ShareGroup) => void;
  onRemoveUser: (user: SimpleUser) => void;
  onRemoveGroup: (group: ShareGroup) => void;
  placeholder?: string;
  showSelectedTags?: boolean;
  className?: string;
}


export function UserGroupSelect({
  selectedUsers,
  selectedGroups,
  onSelectUser,
  onSelectGroup,
  onRemoveUser,
  onRemoveGroup,
  placeholder = "搜索用户或共享组...",
  showSelectedTags = true,
  className,
}: UserGroupSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: groupMemberOptions, loading: groupMemberLoading } =
    useGroupMemberSearch(searchQuery);


  const selectedCount = selectedUsers.length + selectedGroups.length;



  const handleSelectUser = (user: SimpleUser) => {
    if (selectedUsers.some((u) => u.id === user.id)) {
      onRemoveUser(user);
    } else {
      onSelectUser(user);
    }
  };

  const handleSelectGroup = (group: ShareGroup) => {
    if (selectedGroups.some((g) => g.id === group.id)) {
      onRemoveGroup(group);
    } else {
      onSelectGroup(group);
    }
  };

  return (

    <div className={cn("space-y-2", className)}>
      {/* Selected items display */}
      {showSelectedTags && (selectedUsers.length > 0 || selectedGroups.length > 0) && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedGroups.map((group) => (
            <Badge
              key={group.id}
              variant="secondary"
              className="gap-1 pr-1.5 bg-primary/10"
            >
              <Users2 className="h-3 w-3" />
              {group.name}
              <button
                type="button"
                onClick={() => handleSelectGroup(group)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {selectedUsers.map((user) => (
            <Badge
              key={user.id}
              variant="secondary"
              className="gap-1 pr-1.5"
            >
              <User className="h-3 w-3" />
              {user.username}
              <button
                type="button"
                onClick={() => handleSelectUser(user)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-10"
          >
            <span className="flex items-center gap-2 text-muted-foreground">
              <Search className="h-4 w-4" />
              {selectedCount > 0
                ? `已选择 ${selectedCount} 个用户/组`
                : placeholder}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="搜索用户或共享组..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              {groupMemberLoading ? (
                <div className="py-6 flex items-center justify-center">
                  <Spinner className="h-5 w-5" />
                </div>
              ) : (
                <>
                  <CommandEmpty>未找到匹配的用户或组</CommandEmpty>

                  {/* Groups Section */}
                  {groupMemberOptions.groups.length > 0 && (
                    <CommandGroup heading="共享组">
                      {groupMemberOptions.groups.map((group) => {
                        const isSelected = selectedGroups.some(
                          (g) => g.id === group.id
                        );
                        return (
                          <CommandItem
                            key={group.id}
                            value={group.id}
                            onSelect={() => handleSelectGroup(group)}
                            className="flex items-center gap-2"
                          >
                            <div
                              className={cn(
                                "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                isSelected
                                  ? "bg-primary text-primary-foreground"
                                  : "opacity-50"
                              )}
                            >
                              {isSelected && (
                                <Check className="h-3 w-3" />
                              )}
                            </div>

                            <Avatar className="h-6 w-6 flex-shrink-0">
                              <AvatarImage src={group.cover} />
                              <AvatarFallback className="text-xs bg-[#e9638f] text-white">
                                {group.name.slice(0, 1)}
                              </AvatarFallback>
                            </Avatar>

                            <span>{group.name}</span>
                       
                            {group.member_count && (
                              <span className="text-xs text-muted-foreground ml-auto">
                                {group.member_count} 成员
                              </span>
                            )}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  )}

                  {groupMemberOptions.groups.length > 0 &&
                    groupMemberOptions.members.length > 0 && (
                      <Separator className="my-1" />
                    )}

                  {/* Users Section */}
                  {groupMemberOptions.members.length > 0 && (
                    <CommandGroup heading="用户">
                      {groupMemberOptions.members.map((user) => {
                        const isSelected = selectedUsers.some(
                          (u) => u.id === user.id
                        );
                        return (
                          <CommandItem
                            key={user.id}
                            value={String(user.id)}
                            onSelect={() => handleSelectUser(user)}
                            className="flex items-center gap-2"
                          >
                            <div
                              className={cn(
                                "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                isSelected
                                  ? "bg-primary text-primary-foreground"
                                  : "opacity-50"
                              )}
                            >
                              {isSelected && (
                                <Check className="h-3 w-3" />
                              )}
                            </div>

                            <UserAvatar user={user} />
                            <span>{user.username}</span>
                            <span className="text-xs text-muted-foreground ml-auto">
                              ID: {user.id}
                            </span>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  )}
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>

  )
}