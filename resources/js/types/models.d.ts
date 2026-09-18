export interface Store {
    id: number;
    user_id: number;
    name: string;
    slug: string;
    logo?: string | null;
    banner?: string | null;
    description?: string | null;
    city: string;
    postal_code: string;
    origin_address: string;
    latitude?: number | string | null;
    longitude?: number | string | null;
    status: 'active' | 'vacation' | 'suspended' | string;
    is_official: boolean;
    power_merchant: boolean;
    created_at?: string;
    updated_at?: string;
    user?: User;
    products?: Product[];
}

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string | null;
    avatar?: string;
    phone?: string | null;
    birthday?: string | null;
    gender?: 'Pria' | 'Wanita' | string | null;
    two_factor_enabled?: boolean;
    store?: Store | null;
    created_at?: string;
    updated_at?: string;
    [key: string]: unknown;
}

export interface Category {
    id: number;
    name: string;
    slug: string;
    created_at?: string;
    updated_at?: string;
}

export interface ProductSpecification {
    id: number;
    product_id: number;
    name: string;
    value: string;
    created_at?: string;
    updated_at?: string;
}

export interface ProductReview {
    id: number;
    product_id: number;
    user_name: string;
    user_avatar?: string;
    rating: number;
    comment: string;
    created_at: string;
    updated_at?: string;
}

export interface Product {
    id: number;
    store_id?: number | null;
    category_id?: number;
    title: string;
    slug?: string;
    price: number | string;
    original_price?: number | string | null;
    discount?: number | null;
    image: string;
    stock?: number;
    has_variants?: boolean;
    city?: string;
    rating?: number | string;
    rating_avg?: number;
    sold_count?: string | number;
    description?: string;
    reviews_count?: number;
    store?: Store | null;
    category?: Category;
    specifications?: ProductSpecification[];
    reviews?: ProductReview[];
    created_at?: string;
    updated_at?: string;
}

export interface CartItem {
    id: number;
    user_id?: number | null;
    product_id: number;
    title?: string;
    slug?: string;
    price?: number | string;
    original_price?: number | string | null;
    discount?: number | null;
    image?: string;
    stock?: number;
    city?: string;
    quantity: number;
    selected?: boolean;
    product?: Product;
    created_at?: string;
    updated_at?: string;
}

export interface Address {
    id: number;
    user_id?: number;
    label: string;
    receiver: string;
    phone: string;
    full_address: string;
    note?: string | null;
    pinpoint?: string;
    is_main: boolean;
    fullAddress?: string;
    isMain?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface OrderItem {
    id: number;
    order_id: number;
    product_id: number;
    quantity: number;
    price: number | string;
    subtotal: number | string;
    product?: Product;
    created_at?: string;
    updated_at?: string;
}

export interface Transaction {
    id: number;
    order_id: number;
    payment_method: string;
    payment_status: 'pending' | 'paid' | 'failed' | 'expired' | string;
    transaction_code: string;
    paid_at?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface Order {
    id: number;
    order_number: string;
    user_id: number;
    address_id?: number | null;
    total_price: number | string;
    shipping_cost: number | string;
    grand_total: number | string;
    status: 'pending' | 'paid' | 'processing' | 'shipped' | 'completed' | 'cancelled' | string;
    notes?: string | null;
    created_at: string;
    updated_at?: string;
    address?: Address | null;
    items?: OrderItem[];
    transaction?: Transaction | null;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    next_page_url: string | null;
    prev_page_url?: string | null;
    total: number;
    per_page?: number;
}
