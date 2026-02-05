import { User } from "@/types";
import z from "zod";

export const userFormSchema = z.object({
    username: z.string().min(4, "昵称至少 4 个字符").max(20, "昵称最多 20 个字符"),
    birth: z.iso.date().optional(),
    phone: z
      .string()
      .trim()
      .optional(),
    email: z.email("邮箱格式不正确").optional(),
    introduce: z.string().max(300, "简介最多 300 字").optional(),
    gender: z.any().nullish(),
    title: z.string().optional(),
})

export type UserFormValues = z.infer<typeof userFormSchema>;


export const groupSchema = z.object({
  name: z.string().min(1, "至少1个字符").max(20, "名称最多20个字符"),
  description: z.string().optional(),
  cover: z.string().optional(),
  is_public: z.boolean(),
  owner_id: z.number().optional(),
  members: z.array(z.number()).optional()
 
})

export type GroupFormValues = z.infer<typeof groupSchema>;