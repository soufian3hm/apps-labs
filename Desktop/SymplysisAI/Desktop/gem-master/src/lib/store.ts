import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createClient } from '@/lib/supabase/client';
import type {
    Profile,
    Store,
    Product,
    ProductTheme,
    ProductImage,
    ProductSpecification,
    LeadSubmission,
    LeadFormConfig,
    LeadFormField,
    ProductWithRelations
} from '@/types/supabase';

interface AppState {
    // Auth
    user: Profile | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    // Current selection
    currentStoreId: string | null;

    // Data
    stores: Store[];
    products: ProductWithRelations[];
    leads: LeadSubmission[];
    themes: ProductTheme[];

    // Auth actions
    setUser: (user: Profile | null) => void;
    checkAuth: () => Promise<void>;
    signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;

    // Store actions
    setCurrentStore: (storeId: string) => void;
    fetchStores: () => Promise<void>;
    createStore: (name: string, description?: string, customDomain?: string) => Promise<Store | null>;
    updateStore: (id: string, data: Partial<Store>) => Promise<void>;
    deleteStore: (id: string) => Promise<void>;

    // Product actions
    fetchProducts: () => Promise<void>;
    fetchProductBySlug: (slug: string) => Promise<ProductWithRelations | null>;
    createProduct: (data: Partial<Product>) => Promise<Product | null>;
    updateProduct: (id: string, data: Partial<Product>) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;

    // Lead actions
    fetchLeads: () => Promise<void>;
    submitLead: (productId: string, formData: Record<string, string>) => Promise<{ error: Error | null }>;

    // Theme actions
    fetchThemes: () => Promise<void>;

    // Getters
    getProductsByStore: (storeId: string) => ProductWithRelations[];
    getProductBySlug: (slug: string) => ProductWithRelations | undefined;
    getLeadsByProduct: (productId: string) => LeadSubmission[];
}

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            // Initial state
            user: null,
            isAuthenticated: false,
            isLoading: true,
            currentStoreId: null,
            stores: [],
            products: [],
            leads: [],
            themes: [],

            // Auth actions
            setUser: (user) => {
                set({ user, isAuthenticated: !!user });
            },

            checkAuth: async () => {
                const supabase = createClient();
                set({ isLoading: true });

                try {
                    const { data: { user } } = await supabase.auth.getUser();

                    if (user) {
                        const { data: profile } = await supabase
                            .from('profiles')
                            .select('*')
                            .eq('id', user.id)
                            .single();

                        set({
                            user: profile,
                            isAuthenticated: true
                        });

                        // Fetch user data
                        await get().fetchStores();
                        await get().fetchThemes();
                    } else {
                        set({ user: null, isAuthenticated: false });
                    }
                } catch (error) {
                    console.error('Auth check error:', error);
                    set({ user: null, isAuthenticated: false });
                } finally {
                    set({ isLoading: false });
                }
            },

            signUp: async (email, password, name) => {
                const supabase = createClient();

                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { name },
                    },
                });

                if (error) {
                    return { error };
                }

                if (data.user) {
                    // Profile is created automatically via trigger
                    await get().checkAuth();
                }

                return { error: null };
            },

            signIn: async (email, password) => {
                const supabase = createClient();

                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) {
                    return { error };
                }

                await get().checkAuth();
                return { error: null };
            },

            signInWithGoogle: async () => {
                const supabase = createClient();

                await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                        redirectTo: `${window.location.origin}/auth/callback`,
                    },
                });
            },

            signOut: async () => {
                const supabase = createClient();
                await supabase.auth.signOut();
                set({
                    user: null,
                    isAuthenticated: false,
                    stores: [],
                    products: [],
                    leads: [],
                    currentStoreId: null
                });
            },

            // Store actions
            setCurrentStore: (storeId) => {
                set({ currentStoreId: storeId });
                get().fetchProducts();
                get().fetchLeads();
            },

            fetchStores: async () => {
                const supabase = createClient();
                const { data, error } = await supabase
                    .from('stores')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (!error && data) {
                    set({ stores: data });
                    if (data.length > 0 && !get().currentStoreId) {
                        set({ currentStoreId: data[0].id });
                        await get().fetchProducts();
                        await get().fetchLeads();
                    }
                }
            },

            createStore: async (name, description, customDomain) => {
                const supabase = createClient();
                const user = get().user;
                if (!user) return null;

                // If customDomain is provided, use it as slug, otherwise generate from name
                const slug = customDomain
                    ? customDomain
                    : name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

                const { data, error } = await supabase
                    .from('stores')
                    .insert({
                        user_id: user.id,
                        name,
                        slug,
                        description,
                        custom_domain: customDomain || null,
                    })
                    .select()
                    .single();

                if (!error && data) {
                    set(state => ({ stores: [data, ...state.stores] }));
                    if (!get().currentStoreId) {
                        set({ currentStoreId: data.id });
                    }
                    return data;
                }

                return null;
            },

            updateStore: async (id, data) => {
                const supabase = createClient();

                const { error } = await supabase
                    .from('stores')
                    .update(data)
                    .eq('id', id);

                if (!error) {
                    set(state => ({
                        stores: state.stores.map(s => s.id === id ? { ...s, ...data } : s)
                    }));
                }
            },

            deleteStore: async (id) => {
                const supabase = createClient();

                const { error } = await supabase
                    .from('stores')
                    .delete()
                    .eq('id', id);

                if (!error) {
                    set(state => ({
                        stores: state.stores.filter(s => s.id !== id),
                        products: state.products.filter(p => p.store_id !== id),
                    }));
                }
            },

            // Product actions
            fetchProducts: async () => {
                const supabase = createClient();
                const storeId = get().currentStoreId;
                if (!storeId) return;

                const { data: products, error } = await supabase
                    .from('products')
                    .select(`
                        *,
                        theme:product_themes(*),
                        images:product_images(*),
                        specifications:product_specifications(*),
                        lead_form_config:lead_form_configs(
                            *,
                            fields:lead_form_fields(*)
                        )
                    `)
                    .eq('store_id', storeId)
                    .order('created_at', { ascending: false });

                if (!error && products) {
                    const formattedProducts = products.map(p => ({
                        ...p,
                        videos: [],
                        custom_fields: [],
                    })) as ProductWithRelations[];
                    set({ products: formattedProducts });
                }
            },

            fetchProductBySlug: async (slug) => {
                const supabase = createClient();

                const { data, error } = await supabase
                    .from('products')
                    .select(`
                        *,
                        theme:product_themes(*),
                        images:product_images(*),
                        specifications:product_specifications(*),
                        lead_form_config:lead_form_configs(
                            *,
                            fields:lead_form_fields(*)
                        )
                    `)
                    .eq('slug', slug)
                    .eq('status', 'published')
                    .single();

                if (!error && data) {
                    return {
                        ...data,
                        videos: [],
                        custom_fields: [],
                    } as ProductWithRelations;
                }

                return null;
            },

            createProduct: async (data) => {
                const supabase = createClient();
                const storeId = get().currentStoreId;
                if (!storeId) return null;

                const { data: product, error } = await supabase
                    .from('products')
                    .insert({
                        ...data,
                        store_id: storeId,
                    } as any)
                    .select()
                    .single();

                if (!error && product) {
                    await get().fetchProducts();
                    return product;
                }

                return null;
            },

            updateProduct: async (id, data) => {
                const supabase = createClient();

                const { error } = await supabase
                    .from('products')
                    .update(data)
                    .eq('id', id);

                if (!error) {
                    await get().fetchProducts();
                }
            },

            deleteProduct: async (id) => {
                const supabase = createClient();

                const { error } = await supabase
                    .from('products')
                    .delete()
                    .eq('id', id);

                if (!error) {
                    set(state => ({
                        products: state.products.filter(p => p.id !== id),
                        leads: state.leads.filter(l => l.product_id !== id),
                    }));
                }
            },

            // Lead actions
            fetchLeads: async () => {
                const supabase = createClient();
                const products = get().products;
                const productIds = products.map(p => p.id);

                if (productIds.length === 0) {
                    set({ leads: [] });
                    return;
                }

                const { data, error } = await supabase
                    .from('lead_submissions')
                    .select('*')
                    .in('product_id', productIds)
                    .order('submitted_at', { ascending: false });

                if (!error && data) {
                    set({ leads: data });
                }
            },

            submitLead: async (productId, formData) => {
                const supabase = createClient();

                const { error } = await supabase
                    .from('lead_submissions')
                    .insert({
                        product_id: productId,
                        form_data: formData,
                    });

                if (error) {
                    return { error };
                }

                return { error: null };
            },

            // Theme actions
            fetchThemes: async () => {
                const supabase = createClient();

                const { data, error } = await supabase
                    .from('product_themes')
                    .select('*')
                    .order('name');

                if (!error && data) {
                    set({ themes: data });
                }
            },

            // Getters
            getProductsByStore: (storeId) => {
                return get().products.filter(p => p.store_id === storeId);
            },

            getProductBySlug: (slug) => {
                return get().products.find(p => p.slug === slug);
            },

            getLeadsByProduct: (productId) => {
                return get().leads.filter(l => l.product_id === productId);
            },
        }),
        {
            name: 'gem-storage',
            partialize: (state) => ({
                currentStoreId: state.currentStoreId,
            }),
        }
    )
);
