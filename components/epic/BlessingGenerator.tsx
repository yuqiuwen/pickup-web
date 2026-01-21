// lib/components/event/BlessingGenerator.tsx
"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Copy,
  RefreshCw,
  Check,
  Edit3,
  MessageSquare,
  Heart,
  Smile,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type BlessingStyle = "formal" | "cute" | "short" | "long";
export type EventType = 1 | 2 | 3; // 1纪念日 2生日 3倒数日

interface BlessingGeneratorProps {
  eventName: string;
  eventType: EventType;
  eventDate: Date;
  daysCount: number;
  recipientName?: string;
  onShare?: (text: string) => void;
}

// 祝福语模板
const blessingTemplates: Record<
  EventType,
  Record<BlessingStyle, string[]>
> = {
  // 纪念日
  1: {
    formal: [
      "亲爱的{recipient}，在这个特别的日子里，回首我们一起走过的{days}天，每一天都充满了美好的回忆。感谢你一直以来的陪伴与支持，愿我们的爱情如陈年美酒，历久弥香。",
      "致{recipient}：{days}天的时光见证了我们的成长与改变，感谢你始终如一的爱与包容。愿未来的每一天，我们都能携手共进，书写更多美好的故事。",
    ],
    cute: [
      "{recipient}！我们已经在一起{days}天啦！每天都超级开心呢～要永远这么甜蜜下去哦！么么哒！💕",
      "叮咚！我和{recipient}的爱情已满{days}天！撒花庆祝！🎉 以后的每一天都要更爱你一点点！",
    ],
    short: [
      "第{days}天，依然心动。",
      "{days}天，爱你如初。",
      "与你的第{days}天，感恩遇见。",
    ],
    long: [
      "亲爱的{recipient}：\n\n时间真是奇妙，转眼间我们已经走过了{days}天。\n\n还记得我们初次相遇的那个瞬间吗？那时的悸动至今仍清晰可感。这{days}天里，我们一起经历了欢笑与泪水，一起度过了无数个平凡而珍贵的日子。\n\n感谢你让我的生活变得如此美好，感谢你在我身边，让每一个普通的日子都变得特别。\n\n未来还很长，我想和你一起走下去，创造更多属于我们的美好回忆。\n\n爱你，今天，明天，永远。",
    ],
  },
  // 生日
  2: {
    formal: [
      "亲爱的{recipient}，生日快乐！愿这特别的一天给你带来无尽的欢乐和幸福。愿你的每一个梦想都能实现，每一天都充满阳光和希望。",
      "在你生日这个美好的日子里，祝{recipient}身体健康、万事如意！愿新的一岁带给你更多的智慧、勇气和幸福。",
    ],
    cute: [
      "嘿！今天是{recipient}变得更可爱的一天！生日快乐呀！🎂 希望你永远开开心心的！比心！💗",
      "{recipient}今天又长大一岁啦！生日快乐！记得吃蛋糕许愿哦～愿望一定会实现的！✨",
    ],
    short: [
      "生日快乐，愿你永远年轻！",
      "又是美好的一岁，{recipient}生日快乐！",
      "愿你所求皆所得，生日快乐！",
    ],
    long: [
      "亲爱的{recipient}：\n\n生日快乐！\n\n在这个属于你的特别日子里，我想对你说：感谢你来到这个世界，感谢你出现在我的生命中。\n\n新的一岁，愿你保持那颗赤诚的心，继续追逐梦想；愿你遇到的都是善良的人，经历的都是美好的事；愿你健康平安，快乐幸福。\n\n无论未来如何，请记住：你值得拥有这世上所有美好的事物。\n\n永远支持你的朋友敬上",
    ],
  },
  // 倒数日
  3: {
    formal: [
      "亲爱的{recipient}，距离{event}还有{days}天。让我们一起期待这个美好时刻的到来，相信它会比我们想象的更加精彩。",
      "倒计时{days}天！{event}即将到来，让我们带着满满的期待，迎接这个特别的日子。",
    ],
    cute: [
      "哇！还有{days}天就是{event}啦！好期待好期待！已经开始激动了！🎉",
      "倒数第{days}天！马上就要到{event}了！每一天都在期待中度过～✨",
    ],
    short: [
      "{days}天后见！",
      "期待{event}，{days}天倒计时。",
      "心心念念，还有{days}天。",
    ],
    long: [
      "亲爱的{recipient}：\n\n距离{event}还有{days}天。\n\n这段等待的时光，虽然漫长，却也充满了甜蜜的期待。每过一天，我们就离那个特别的日子更近一步。\n\n让我们珍惜这份期待的心情，好好准备，用最好的状态迎接它的到来。\n\n{days}天后，让我们一起见证这个美好的时刻！",
    ],
  },
};

// 称呼选项
const recipientOptions = [
  { value: "亲爱的", label: "亲爱的" },
  { value: "宝贝", label: "宝贝" },
  { value: "老公", label: "老公" },
  { value: "老婆", label: "老婆" },
  { value: "爸爸", label: "爸爸" },
  { value: "妈妈", label: "妈妈" },
  { value: "朋友", label: "朋友" },
  { value: "custom", label: "自定义" },
];

const styleConfig: Record<
  BlessingStyle,
  { icon: React.ElementType; label: string; description: string }
> = {
  formal: {
    icon: FileText,
    label: "正式版",
    description: "正式、得体的祝福语",
  },
  cute: {
    icon: Smile,
    label: "俏皮版",
    description: "可爱、活泼的表达方式",
  },
  short: {
    icon: MessageSquare,
    label: "短句版",
    description: "简短精炼的祝福",
  },
  long: {
    icon: Heart,
    label: "长文版",
    description: "情感丰富的长篇祝福",
  },
};

export const BlessingGenerator: React.FC<BlessingGeneratorProps> = ({
  eventName,
  eventType,
  eventDate,
  daysCount,
  recipientName = "你",
  onShare,
}) => {
  const [selectedStyle, setSelectedStyle] = useState<BlessingStyle>("formal");
  const [recipient, setRecipient] = useState(recipientName);
  const [customRecipient, setCustomRecipient] = useState("");
  const [currentTemplateIndex, setCurrentTemplateIndex] = useState(0);
  const [editedText, setEditedText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  // 获取当前模板
  const templates = blessingTemplates[eventType][selectedStyle];
  const currentTemplate = templates[currentTemplateIndex % templates.length];

  // 替换占位符
  const generateBlessing = (template: string): string => {
    const actualRecipient =
      recipient === "custom" ? customRecipient : recipient;
    return template
      .replace(/{recipient}/g, actualRecipient || "你")
      .replace(/{days}/g, daysCount.toString())
      .replace(/{event}/g, eventName);
  };

  const currentBlessing = isEditing
    ? editedText
    : generateBlessing(currentTemplate);

  // 切换下一个模板
  const handleNextTemplate = () => {
    setCurrentTemplateIndex((prev) => prev + 1);
    setIsEditing(false);
    setEditedText("");
  };

  // 复制到剪贴板
  const handleCopy = async () => {
    await navigator.clipboard.writeText(currentBlessing);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 开始编辑
  const handleEdit = () => {
    setEditedText(currentBlessing);
    setIsEditing(true);
  };

  // 分享
  const handleShare = () => {
    onShare?.(currentBlessing);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          一键生成祝福文案
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 设置区域 */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>称呼对方</Label>
            <Select value={recipient} onValueChange={setRecipient}>
              <SelectTrigger>
                <SelectValue placeholder="选择称呼" />
              </SelectTrigger>
              <SelectContent>
                {recipientOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {recipient === "custom" && (
            <div className="space-y-2">
              <Label>自定义称呼</Label>
              <Input
                placeholder="输入称呼"
                value={customRecipient}
                onChange={(e) => setCustomRecipient(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* 风格选择 */}
        <Tabs
          value={selectedStyle}
          onValueChange={(v) => {
            setSelectedStyle(v as BlessingStyle);
            setCurrentTemplateIndex(0);
            setIsEditing(false);
          }}
        >
          <TabsList className="grid w-full grid-cols-4">
            {Object.entries(styleConfig).map(([style, config]) => (
              <TabsTrigger key={style} value={style} className="gap-1">
                <config.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{config.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(styleConfig).map(([style, config]) => (
            <TabsContent key={style} value={style}>
              <p className="mb-4 text-sm text-muted-foreground">
                {config.description}
              </p>
            </TabsContent>
          ))}
        </Tabs>

        {/* 祝福语展示区 */}
        <div className="relative">
          {isEditing ? (
            <Textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              rows={selectedStyle === "long" ? 12 : 6}
              className="resize-none"
            />
          ) : (
            <div
              className={cn(
                "whitespace-pre-wrap rounded-lg border bg-muted/30 p-4",
                selectedStyle === "long" ? "min-h-[200px]" : "min-h-[100px]"
              )}
            >
              {currentBlessing}
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleNextTemplate}>
            <RefreshCw className="mr-2 h-4 w-4" />
            换一个
          </Button>
          <Button
            variant="outline"
            onClick={isEditing ? () => setIsEditing(false) : handleEdit}
          >
            <Edit3 className="mr-2 h-4 w-4" />
            {isEditing ? "完成编辑" : "自定义编辑"}
          </Button>
          <Button variant="outline" onClick={handleCopy}>
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                已复制
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                复制文案
              </>
            )}
          </Button>
          <Button onClick={handleShare}>
            <Sparkles className="mr-2 h-4 w-4" />
            分享祝福
          </Button>
        </div>

        {/* 提示 */}
        <div className="flex items-center gap-2 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
          <span>💡</span>
          <span>
            点击"自定义编辑"可以修改文案内容，让祝福更加个性化，避免"AI味"
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default BlessingGenerator;