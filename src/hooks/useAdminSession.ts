
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAdminAuth } from '@/providers/AdminAuthProvider';

/**
 * Custom hook to ensure admin user has a corresponding profile
 * and to handle synchronization of session with Supabase client
 */
export const useAdminSession = () => {
  const { session, loading } = useAdminAuth();
  const [profileChecked, setProfileChecked] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Only run once we have a session and aren't in the initial loading state
    if (!loading && session) {
      const createOrCheckProfile = async () => {
        try {
          console.log('Checking admin profile for user:', session.user.id);
          
          // First check if the admin profile exists
          const { data: existingProfile, error: fetchError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (fetchError && fetchError.code !== 'PGRST116') {
            // Error other than "no rows found"
            console.error('Error fetching profile:', fetchError);
            throw fetchError;
          }

          if (!existingProfile) {
            console.log('No profile found, creating admin profile');
            
            // Create a profile with admin role for this user
            const { error: insertError } = await supabase.auth.getSession().then(async ({ data }) => {
              // Use the session token for this operation to ensure RLS policy is satisfied
              const supabaseWithAuth = supabase;
              
              return supabaseWithAuth
                .from('user_profiles')
                .insert({
                  id: session.user.id,
                  role: 'admin',
                  first_name: 'Admin',
                  last_name: 'User'
                });
            });

            if (insertError) {
              console.error('Error creating profile:', insertError);
              throw insertError;
            }

            console.log('Created admin profile for user', session.user.id);
          } else {
            console.log('Admin profile exists for user', session.user.id);
          }

          setProfileChecked(true);
        } catch (error: any) {
          console.error('Error managing admin profile:', error);
          toast({
            variant: 'destructive',
            title: 'Profile Error',
            description: 'Failed to set up admin profile: ' + error.message,
          });
        }
      };

      createOrCheckProfile();
    }
  }, [session, loading, toast]);

  return { profileChecked, isReady: !loading && (profileChecked || !session) };
};
