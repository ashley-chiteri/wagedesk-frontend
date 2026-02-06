// frontend/src/stores/authStore.ts

import { create } from 'zustand';
import { supabase } from '@/lib/supabaseClient';
import { Session, User } from '@supabase/supabase-js';
import { API_BASE_URL } from '@/config';

export interface Company {
    id: string;
    business_name: string;
    industry?: string;
    logo_url?: string;
    status: 'PENDING' | 'APPROVED' | 'SUSPENDED';
}

interface WorkspaceContext {
    workspace_id: string;
    role: 'ADMIN' | 'MANAGER' | 'VIEWER';
    full_names: string;
    email: string;
    workspaces: {
        id: string;
        name: string;
        status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
        companies: Company[];
    };
}


interface AuthState {
    user: User | null;
    session: Session | null;
    workspaces: WorkspaceContext[];
    activeWorkspace: WorkspaceContext | null;
    loading: boolean;
    error: string | null;
    isWorkspaceActive: () => boolean;
    isWorkspacePending: () => boolean;
    isWorkspaceSuspended: () => boolean;
    checkUser: () => void;
    login: (email: string, password: string) => Promise<void>;
    loadContext: () => Promise<void>;
    logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    session: null,
    workspaces: [],
    activeWorkspace: null,
    loading: false,
    error: null,

    isWorkspaceActive: () =>
        get().activeWorkspace?.workspaces.status === 'ACTIVE',

    isWorkspacePending: () =>
       get().activeWorkspace?.workspaces.status === 'PENDING',

    isWorkspaceSuspended: () =>
        get().activeWorkspace?.workspaces.status === 'SUSPENDED',


    checkUser: async () => {
        set({ loading: true });
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            set({ user: session.user, session, loading: false });
            await get().loadContext();
        } else {
            set({ user: null, session: null, loading: false });
        }
    },

    login: async (email, password) => {
        set({ loading: true, error: null });

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            set({ error: error.message, loading: false });
            throw error;
        }

        set({ user: data.user, session: data.session });
        await get().loadContext();
        set({ loading: false });
    },

    loadContext: async () => {
        const session = (await supabase.auth.getSession()).data.session;
        if (!session) return;

        try {
            const res = await fetch(`${API_BASE_URL}/me/context`, {
                headers: { Authorization: `Bearer ${session.access_token}` },
            });
            const context = await res.json();

            set({
                workspaces: context.workspaces,
                activeWorkspace: context.workspaces[0] ?? null,
            });
        } catch (err) {
            console.error("Failed to load context", err);
        }
    },

    logout: async () => {
        set({ loading: true, error: null });
        const { error } = await supabase.auth.signOut();
        if (error) {
            set({ error: error.message, loading: false });
        } else {
            set({
                user: null,
                session: null,
                workspaces: [],
                activeWorkspace: null,
                loading: false,
            });
        }
    },
}));
