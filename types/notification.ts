import { SimpleUser } from "./auth";

// 操作类型枚举
export enum TAction {
    LIKE = 1,
    COLLECT = 2,
    COMMENT = 3,
    REPLY = 4,
    MENTION = 5,
    FAN = 6,
    INVITE = 7,
    REFUSED_INVITE = -7,
    SYS = 99,
    ANNOUNCE = 98,
  }
  
  export const ACTION_LABELS: Record<number, string> = {
    [TAction.LIKE]: "点赞",
    [TAction.COLLECT]: "收藏",
    [TAction.COMMENT]: "评论",
    [TAction.REPLY]: "回复",
    [TAction.MENTION]: "提及",
    [TAction.FAN]: "粉丝",
    [TAction.INVITE]: "邀请",
    [TAction.REFUSED_INVITE]: "拒绝邀请",
    [TAction.SYS]: "系统",
    [TAction.ANNOUNCE]: "公告",
  };
  

  // 提醒类通知项
  export interface RemindNotifyItem {
    id: number;
    action: number;
    ttype: number;
    tid: string;
    ttime: number;
    ctime: number;
    user_total: number;
    from_users: SimpleUser[];
    to_user?: SimpleUser | null;
    target?: any;
  }
  
  // 系统通知项
  export interface SysNotifyItem {
    id: number;
    action: number;
    ttype: number;
    tid: string;
    ttime: number;
    ctime: number;
    target?: any;
  }
  
  // 公告项
  export interface AnnounceNotifyItem {
    id: number;
    title: string;
    content: string;
    ctime: number;
  }
  
  // 未读消息计数
  export interface UnReadMsgCnt {
    sys_cnt: number;
    announce_cnt: number;
    fan_cnt: number;
    like_cnt: number;
    collect_cnt: number;
    comment_cnt: number;
    invite_cnt: number;
    mention_cnt: number;
  }
  
  // 查询参数
  export interface QueryRemindNotifyParams {
    last?: number;
    limit?: number;
    actions: string; // 逗号分割
  }
  
  // 分页返回
  export interface RemindNotifyResponse {
    last: number;
    has_more: boolean;
    items: RemindNotifyItem[];
    max_id_map: Record<string, number>;
  }
  
  export interface SysNotifyResponse {
    last: number;
    has_more: boolean;
    items: SysNotifyItem[];
    max_id_map: Record<string, number>;
  }
  
  export interface AnnounceNotifyResponse {
    last: number;
    has_more: boolean;
    items: AnnounceNotifyItem[];
    max_id_map: Record<string, number>;
  }
  
  // 通知板块定义
  export type NotifySection = "comment_mention" | "like_collect" | "fan" |  "sys" | "announce" ;
  
