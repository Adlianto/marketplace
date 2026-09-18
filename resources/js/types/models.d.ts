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

export interface VariantOption {
    id: number;
    variant_id: number;
    value: string;
    image?: string | null;
    created_at?: string;
    updated_at?: string;
    variant?: ProductVariant;
}

export interface ProductVariant {
    id: number;
    product_id: number;
    name: string;
    created_at?: string;
    updated_at?: string;
    product?: Product;
    options?: VariantOption[];
}

export interface ProductSku {
    id: number;
    product_id: number;
    sku_code: string;
    combination_key: string;
    price: number | string;
    original_price?: number | string | null;
    stock: number;
    weight_gram: number;
    image?: string | null;
    created_at?: string;
    updated_at?: string;
    product?: Product;
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
    variants?: ProductVariant[];
    skus?: ProductSku[];
    created_at?: string;
    updated_at?: string;
}

export interface CartItem {
    id: number;
    user_id?: number | null;
    product_id: number;
    product_sku_id?: number | null;
    title?: string;
    slug?: string;
    price?: number | string;
    original_price?: number | string | null;
    discount?: number | null;
    image?: string;
    stock?: number;
    city?: string;
    sku_combination?: string | null;
    weight_gram?: number;
    quantity: number;
    selected?: boolean;
    store_id?: number | null;
    product?: Product;
    sku?: ProductSku | null;
    created_at?: string;
    updated_at?: string;
}

export interface StoreCartGroup {
    store: {
        id: number;
        name: string;
        slug: string;
        city: string;
        is_official: boolean;
        power_merchant: boolean;
        logo?: string | null;
    };
    items: CartItem[];
    subtotal: number;
    total_weight_gram: number;
    selected_subtotal: number;
    selected_weight_gram: number;
    selected_count: number;
    total_items: number;
    is_all_selected: boolean;
}

export interface SubOrderItem {
    id: number;
    sub_order_id: number;
    product_id: number;
    product_sku_id?: number | null;
    product_title: string;
    sku_combination?: string | null;
    price: number | string;
    quantity: number;
    total_price: number | string;
    weight_gram: number;
    created_at?: string;
    updated_at?: string;
    product?: Product;
    productSku?: ProductSku | null;
    sku?: ProductSku | null;
}

export interface SubOrder {
    id: number;
    order_group_id: number;
    store_id: number;
    user_id: number;
    address_id: number;
    sub_order_number: string;
    courier_name: string;
    courier_service: string;
    tracking_number?: string | null;
    items_subtotal: number | string;
    shipping_cost: number | string;
    total_amount: number | string;
    status:
        | 'waiting_payment'
        | 'paid'
        | 'processing'
        | 'shipped'
        | 'delivered'
        | 'completed'
        | 'cancelled'
        | string;
    shipped_at?: string | null;
    delivered_at?: string | null;
    completed_at?: string | null;
    created_at?: string;
    updated_at?: string;
    orderGroup?: OrderGroup;
    store?: Store;
    user?: User;
    address?: Address;
    items?: SubOrderItem[];
}

export interface OrderGroup {
    id: number;
    group_code: string;
    user_id: number;
    total_amount: number | string;
    payment_status: 'pending' | 'paid' | 'expired' | 'failed' | string;
    snap_token?: string | null;
    created_at?: string;
    updated_at?: string;
    user?: User;
    subOrders?: SubOrder[];
    sub_orders?: SubOrder[];
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
    status:
        | 'pending'
        | 'paid'
        | 'processing'
        | 'shipped'
        | 'completed'
        | 'cancelled'
        | string;
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
