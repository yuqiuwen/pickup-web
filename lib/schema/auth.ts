import { z } from "zod";
import { AuthType } from "@/lib/constant";




export const loginSchema = z.object({
  account: z.string().min(1, "账号必填"),
  code: z.string().min(8, "密码至少 8 位").max(20, "密码最多 20 位"),
  code_type: z.enum(["pwd", "code"]),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    auth_type: z.enum(AuthType),
    username: z
      .string()
      .trim()
      .min(4, "用户名至少 4 个字符")
      .max(20, "用户名最多 20 个字符"),
    account: z.email("请输入正确的邮箱地址"),
    code: z.string().min(1, "验证码必填"),
    pwd: z
      .string()
      .min(8, "密码至少 8 个字符")
      .max(20, "密码最多 20 个字符")
      .regex(/^[A-Za-z0-9_-]+$/, "密码仅支持英文、数字、下划线、短横线"),
    confirm_pwd: z.string().min(1, "确认密码必填"),
  })
  .refine(
    (data) => {
      return data.pwd === data.confirm_pwd;
    },
    {
      message: "两次密码不匹配",
      path: ["confirm_pwd"],
    }
  );

export type SignupValues = z.infer<typeof signupSchema>;

export const resetPasswordSchema = z
  .object({
    account: z.email("请输入正确的邮箱地址"),
    code: z.string().min(1, "验证码必填"),
    validate_way: z.enum(["pwd", "code"]),
    new_pwd: z
      .string()
      .min(8, "密码至少 8 位")
      .max(20, "密码最多 20 位")
      .regex(/^[A-Za-z0-9_-]+$/, "仅支持英文、数字、下划线、短横线"),
    confirm_pwd: z.string().min(1, "确认密码必填"),
  })
  .refine(
    (data) => {
      return data.new_pwd === data.confirm_pwd;
    },
    {
      message: "两次密码不匹配",
      path: ["confirm_pwd"],
    }
  );

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;


export const LOGIN_DEFAULTS: LoginValues = {
  account: "",
  code: "",
  code_type: "pwd",
};

export const RESET_DEFAULTS: ResetPasswordValues = {
  account: "",
  code: "",
  validate_way: "code",
  new_pwd: "",
  confirm_pwd: "",
};