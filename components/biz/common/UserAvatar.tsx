import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { SimpleUser, User } from "@/types";


export function UserAvatar({ user, size = 24, className }: {
    user: SimpleUser | User;
    size?: number;
    className?: string;
}) {
    const userInitials = user?.username
        ? user.username
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
        : "U";

    return (
        <>
            <Avatar style={{ ["--av-size" as any]: `${size}px` }}
                className={cn(
                    "h-[var(--av-size)] w-[var(--av-size)] flex-shrink-0",
                    className
                )}>
                <AvatarImage src={user?.avatar} alt={user?.username} />
                <AvatarFallback
                    className={cn(
                        "bg-[#e9638f] text-white leading-none font-medium",
                        "text-[calc(var(--av-size)*0.6)]"
                    )}
                >
                    {userInitials}
                </AvatarFallback>
            </Avatar>
        </>
    )
}