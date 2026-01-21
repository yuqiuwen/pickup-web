import { MediaType } from "@/lib/constant"

export interface TagItem {
    id?: string
    name: string
}

export interface MediaItem {
    id?: string
    path: string
    type: MediaType
}


export type Tag = {
    id?: string;
    name: string;
  };
  

