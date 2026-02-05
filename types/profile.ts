

export interface FavoriteItem {
    id: string;
    type: 'anniversary' | 'memory' | 'capsule' | 'milestone';
    name: string;
    description?: string;
    cover_image?: string;
    created_at: string;
    favorited_at: string;
}

export interface LikedItem {
    id: string;
    type: 'anniversary' | 'memory' | 'capsule' | 'milestone' | 'post';
    name: string;
    description?: string;
    cover_image?: string;
    author: {
        id: string;
        name: string;
        avatar?: string;
    };
    liked_at: string;
}
