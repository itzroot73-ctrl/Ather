
import { createClient, SupabaseClient, Provider, Session } from '@supabase/supabase-js';
import { UserProfile, Project } from '../types';

class DatabaseService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = 'https://mzpqgnffnxnjctxdwvcm.supabase.co';
    const supabaseKey = (process.env as any).SUPABASE_ANON_KEY || 'your-anon-key';
    
    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    });
  }

  // --- OAuth Operations ---
  async signInWithProvider(provider: Provider): Promise<void> {
    const { error } = await this.supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin,
      }
    });
    
    if (error) throw error;
  }

  // --- Core Password Auth ---
  async signUpWithPassword(email: string, password: string, username: string): Promise<UserProfile> {
    if (!email.includes('@')) throw new Error("Invalid email format.");
    if (password.length < 6) throw new Error("Security policy requires at least 6 characters.");

    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          user_name: username
        }
      }
    });

    if (error) {
      if (error.message.includes("User already registered")) {
        throw new Error("This Node is already active in the Nexus. Please login.");
      }
      throw error;
    }

    if (!data.user) throw new Error("Auth Node failure. Communication lost.");

    const newUser: UserProfile = {
      email,
      username,
      createdAt: Date.now()
    };

    const { error: profileErr } = await this.supabase
      .from('profiles')
      .upsert([{ 
        email, 
        username, 
        created_at: new Date().toISOString() 
      }]);
    
    if (profileErr) console.warn("Profile sync delay:", profileErr.message);

    return newUser;
  }

  async signInWithPassword(email: string, password: string): Promise<UserProfile> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      if (error.message.toLowerCase().includes("invalid login credentials")) {
        throw new Error("Access Denied: Invalid Email or Cipher key.");
      }
      throw error;
    }

    if (!data.user || !data.session) {
      throw new Error("Authentication failed. No active session found.");
    }

    const { data: profile, error: fetchErr } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    return {
      email,
      username: profile?.username || data.user.user_metadata.user_name || email.split('@')[0],
      createdAt: profile ? new Date(profile.created_at).getTime() : Date.now()
    };
  }

  async getSession(): Promise<Session | null> {
    const { data: { session } } = await this.supabase.auth.getSession();
    return session;
  }

  onAuthChange(callback: (session: Session | null) => void) {
    return this.supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });
  }

  async syncProfileFromSession(session: Session): Promise<UserProfile> {
    const user = session.user;
    const email = user.email!;
    
    const { data: profile } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (profile) {
      return {
        email: profile.email,
        username: profile.username,
        createdAt: new Date(profile.created_at).getTime()
      };
    }

    return {
      email,
      username: user.user_metadata.user_name || email.split('@')[0],
      createdAt: Date.now()
    };
  }

  async signOut(): Promise<void> {
    await this.supabase.auth.signOut();
    localStorage.removeItem('aether_user');
  }

  // --- Project Operations ---
  async saveProject(project: Project): Promise<void> {
    const { error } = await this.supabase
      .from('projects')
      .upsert({
        id: project.id,
        owner_id: project.ownerId,
        name: project.name,
        description: project.description,
        files: JSON.stringify(project.files),
        messages: JSON.stringify(project.messages),
        last_updated: new Date().toISOString()
      });
    
    if (error) throw error;
  }

  async renameProject(id: string, newName: string): Promise<void> {
    const { error } = await this.supabase
      .from('projects')
      .update({ name: newName, last_updated: new Date().toISOString() })
      .eq('id', id);
    
    if (error) throw error;
  }

  async deleteProject(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('projects')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  async getUserProjects(email: string): Promise<Project[]> {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('owner_id', email)
      .order('last_updated', { ascending: false });

    if (error) {
      console.error("Archive Fetch Error:", error);
      return [];
    }

    return (data || []).map(p => ({
      id: p.id,
      ownerId: p.owner_id,
      name: p.name,
      description: p.description,
      lastUpdated: new Date(p.last_updated).getTime(),
      files: p.files ? JSON.parse(p.files) : [],
      messages: p.messages ? JSON.parse(p.messages) : []
    }));
  }
}

export const db = new DatabaseService();
