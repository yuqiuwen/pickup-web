import { BookHeart, Cake, AlarmClock } from "lucide-react";
import { defineMap } from "@/utils/enum"


export enum FormMode {
    VIEW = 1,
    ADD = 2,
    EDIT = 3,
}


export enum AuthType {
    PHONE = 1,
    EMAIL = 2,
    ACCOUNT = 3,
    WECHAT = 4,
}

export enum EmailBizEnum {
    VERIFY_CODE_SIGN = "verify_code_sign",                   // 注册验证码
    VERIFY_CODE_LOGIN = "verify_code_login",                // 登录验证码
    VERIFY_CODE_SET_PWD = "verify_code_reset_pwd",          // 重置密码验证码
    VERIFY_CODE_BIND_PHONE = "verify_code_bind_phone",      // 绑定手机号验证码
    VERIFY_CODE_REVOKE = "verify_code_account_revoke",      // 账号注销验证码

    INVITE_ANNIV = "invite_anniv",                          // 纪念日邀请
    INVITE_GROUP = "invite_group",                          // 共享组邀请
}


export enum CalendarType {
    SOLAR = 1,
    LUNAR = 2,
  }
  
  export enum EventType {
    ANNIVERSARY = 1,
    BIRTHDAY = 2,
    COUNTDOWN = 3,
  }
  
  export enum ShareMode {
    PRIVATE = 0,
    PUBLIC = 1,
  }
  
  export enum ReminderChannel {
    IN_APP = 1,
    EMAIL = 2,
  }
  
  export enum RepeatType {
    NONE = 0,
    YEARLY = 1,
    MONTHLY = 2,
    WEEKLY = 3,
    QUARTERLY = 4,
    HALF_YEARLY = 5,
  }
  

  export enum MediaType {
    IMAGE = 1,
    VIDEO = 2,
    FILE = 3,
    LINK = 4,
    AUDIO = 5
  }

  
  export const EventTypeOptions = [
    { label: '纪念日', value: EventType.ANNIVERSARY, str_value: String(EventType.ANNIVERSARY), icon: BookHeart, color: 'anniversary'},
    { label: '生日', value: EventType.BIRTHDAY, str_value: String(EventType.BIRTHDAY),icon: Cake, color: 'birthday'},
    { label: '倒数日', value: EventType.COUNTDOWN,  str_value: String(EventType.COUNTDOWN), icon: AlarmClock, color: 'countdown'},
  ]


  export const SelectEventTypeOptions = [
    { label: '全部', value: 'all', str_value: 'all', icon: undefined, color: ''},
    ...EventTypeOptions
  ]


  
  export const eventTypeMap = defineMap(EventTypeOptions, 'value', ['label', 'value', 'color'])


  export const RepeatTypeOptions = [
    { label: '不重复', value: RepeatType.NONE, str_value: String(RepeatType.NONE)},
    { label: '每年', value: RepeatType.YEARLY,str_value: String(RepeatType.YEARLY)},
    { label: '每月', value: RepeatType.MONTHLY,str_value: String(RepeatType.MONTHLY)},
    { label: '每周', value: RepeatType.WEEKLY,str_value: String(RepeatType.WEEKLY)},
    // { label: '每半年', value: RepeatType.HALF_YEARLY,str_value: String(RepeatType.HALF_YEARLY)},
    // { label: '每三月', value: RepeatType.QUARTERLY,str_value: String(RepeatType.QUARTERLY)},
  ]


  
  export const repeatTypeMap = defineMap(RepeatTypeOptions, 'value', ['label', 'value'])


export enum ResourceType {
    ANNIV = 1, 
    NOTES = 2,
}


export enum UserInteractionEnum {
    LIKE = 1,
    COLLECT = 2
}