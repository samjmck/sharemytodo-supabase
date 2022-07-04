export interface SupabaseItem {
    id: number;
    content: string;
    checked: boolean;
}

export interface SupabaseList {
    id: number;
    user_id: string;
    items: SupabaseItem[];
    publicly_viewable: boolean;
}

export interface LinkedItem {
    previousId: number;
    nextId: number;
}
