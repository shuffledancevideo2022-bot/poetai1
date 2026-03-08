import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useReferral() {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralCount, setReferralCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setReferralCode(null);
      setReferralCount(0);
      setLoading(false);
      return;
    }

    const fetchReferralData = async () => {
      // Get referral code from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('referral_code, id')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setReferralCode(profile.referral_code);

        // Count referrals
        const { count } = await supabase
          .from('referrals')
          .select('*', { count: 'exact', head: true })
          .eq('referrer_id', profile.id);

        setReferralCount(count ?? 0);
      }
      setLoading(false);
    };

    fetchReferralData();
  }, [user]);

  const getReferralLink = () => {
    if (!referralCode) return '';
    return `${window.location.origin}?ref=${referralCode}`;
  };

  const processReferral = async (referralCode: string) => {
    if (!user) return false;
    
    const { data, error } = await supabase.rpc('process_referral', {
      _new_user_id: user.id,
      _referral_code: referralCode,
    });

    if (error) {
      console.error('Error processing referral:', error);
      return false;
    }

    return data === true;
  };

  return { referralCode, referralCount, loading, getReferralLink, processReferral };
}
