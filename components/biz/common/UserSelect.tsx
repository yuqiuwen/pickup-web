import { useState, useMemo, useEffect } from "react";
import { Check, Search, X, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMemberSearch } from "@/hooks/use-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { SimpleUser } from "@/types";
import { mergeByKey } from "@/utils/data";
import { UserAvatar } from "@/components/biz/common/UserAvatar";


interface UserSelectProps {
    value: number[];
    onChange: (value: number[]) => void;
    multiple?: boolean;
    placeholder?: string;
    className?: string;
    initialUsers?: SimpleUser[]; // 用于回显
}


export function UserSelect({
    value,
    onChange,
    multiple = true,
    initialUsers, 
    placeholder = "搜索用户...",
    className,
}: UserSelectProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [cache, setCache] = useState<SimpleUser[]>([]);

    const { data, loading } = useMemberSearch(searchQuery);

    useEffect(() => {
        setCache(prev => mergeByKey(prev, data, "id"));
    }, [data]);

    useEffect(() => {
        if (!initialUsers?.length) return;
        setCache(prev => mergeByKey(prev, initialUsers, "id"));
      }, [initialUsers]);

    const cacheById = useMemo(() => {
        return new Map(cache.map(u => [u.id, u]));
      }, [cache]);


      const selectedUsers = useMemo(() => {
        const ids = value ?? [];
        return ids.map(id => cacheById.get(id)).filter(Boolean) as SimpleUser[];
      }, [value, cacheById]);

      const options = useMemo(() => {
        return mergeByKey(cache, data ?? [], "id"); // selected 在前 + data 去重
      }, [cache, data]);

    const handleSelect = (userId: number) => {
        if (multiple) {
            if (value.includes(userId)) {
                onChange(value.filter((id) => id !== userId));
            } else {
                onChange([...value, userId]);
            }
        } else {
            onChange(value.includes(userId) ? [] : [userId]);
        }
    };

    const handleRemove = (userId: number) => {
        onChange(value.filter((id) => id !== userId));
    };

    return (
        <div className={cn("space-y-3", className)}>
            {/* Selected users */}
            {selectedUsers.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {selectedUsers.map((user) => (
                       
                        <Badge
                            key={user.id}
                            variant="secondary"
                            className="flex items-center gap-1 pr-1"
                        >
                           
                            <UserAvatar user={user} />
                            <span className="text-xs">{user.username}</span>
                            <button
                                type="button"
                                onClick={() => handleRemove(user.id)}
                                className="ml-1 h-4 w-4 rounded-full hover:bg-muted flex items-center justify-center"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}

            {/* Search input */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder={placeholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* User list */}
            <ScrollArea className="min-h-30 max-h-48 border rounded-md">
                <div className="p-1">
                    {loading ? (
                        <div className="py-6 flex items-center justify-center">
                            <Spinner className="h-5 w-5" />
                        </div>
                    ) : (

                        options.map((user) => {
                            const isSelected = value.includes(user.id);
                            
                            return (
                                <button
                                    key={user.id}
                                    type="button"
                                    onClick={() => handleSelect(user.id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors",
                                        isSelected
                                            ? "bg-primary/10 text-primary"
                                            : "hover:bg-muted"
                                    )}
                                >

                                    <UserAvatar user={user}/>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm truncate">{user.username}</p>
                                    </div>
                                    {isSelected && (
                                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
