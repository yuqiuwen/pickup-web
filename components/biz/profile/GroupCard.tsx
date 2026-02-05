import { Users, Crown, Shield, MoreHorizontal } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { cn } from "@/lib/utils";
import { ShareGroup } from "@/types/auth";
import { useAuth } from "@/contexts/auth-context";
import { MemberRole, roleConfig } from "@/lib/constant";

interface GroupCardProps {
    group: ShareGroup;
    className?: string;
    onViewDetail?: (group: ShareGroup) => void;
}

export function GroupCard({ group, className, onViewDetail }: GroupCardProps) {

    const { user } = useAuth();
    if (!user) return


    const userRole = user.id === group.owner_id ? MemberRole.OWNER : MemberRole.MEMBER
    const userRoleConfig = roleConfig[userRole]

    return (
        <Card
            className={cn("p-4 hover:shadow-medium transition-shadow cursor-pointer", className)}
            onClick={() => onViewDetail?.(group)}
        >
            <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                    {group.cover ? (
                        <img
                            src={group.cover}
                            alt={group.name}
                            className="h-full w-full rounded-xl object-cover"
                        />
                    ) : (
                        <Users className="h-6 w-6 text-primary" />
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="font-medium text-foreground truncate">{group.name}</h3>
                        <Badge variant="secondary" className="text-xs flex items-center gap-1">
                            <userRoleConfig.icon className={cn("h-3 w-3", userRoleConfig.color)} />
                            {userRoleConfig.label}
                        </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1 h-[20px]">
                        {group.description}
                    </p>

                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {group.member_count} 成员
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            onViewDetail?.(group);
                        }}>
                            查看详情
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                            邀请成员
                        </DropdownMenuItem>
                        {userRole !== "member" && (
                            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                管理组
                            </DropdownMenuItem>
                        )}
                        {userRole === "member" && (
                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={(e) => e.stopPropagation()}
                            >
                                退出组
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </Card>
    );
}
