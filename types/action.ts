import { ResourceType, UserInteractionEnum } from "@/lib/constant"

export interface InterActionItem {
    id: string
    action: UserInteractionEnum
    rtype: ResourceType
    rid: string
    uid: number
    state: number
    ctime: number
}