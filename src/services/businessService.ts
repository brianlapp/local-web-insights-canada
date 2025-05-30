
import { supabase } from "@/integrations/supabase/client";
import type { Business } from "@/data/businesses";

export async function getBusinessBySlug(city: string, slug: string): Promise<Business | null> {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('city', city.toLowerCase())
    .eq('slug', slug)
    .single();

  if (error || !data) {
    console.error('Error fetching business:', error);
    return null;
  }

  return data as Business;
}

export async function getBusinessesByCity(city: string): Promise<Business[]> {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('city', city.toLowerCase());

  if (error || !data) {
    console.error('Error fetching businesses:', error);
    return [];
  }

  return data as Business[];
}

export async function getRecentBusinesses(limit: number = 6): Promise<Business[]> {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .order('audit_date', { ascending: false })
    .limit(limit);

  if (error || !data) {
    console.error('Error fetching recent businesses:', error);
    return [];
  }

  return data as Business[];
}

export async function getUpgradedBusinesses(limit: number = 6): Promise<Business[]> {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('is_upgraded', true)
    .limit(limit);

  if (error || !data) {
    console.error('Error fetching upgraded businesses:', error);
    return [];
  }

  return data as Business[];
}
