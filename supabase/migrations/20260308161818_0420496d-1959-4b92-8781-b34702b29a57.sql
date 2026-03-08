
-- Add referral_code to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code text UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by uuid REFERENCES public.profiles(id);

-- Generate referral codes for existing profiles
UPDATE public.profiles SET referral_code = substr(md5(random()::text || id::text), 1, 8) WHERE referral_code IS NULL;

-- Make referral_code NOT NULL with default
ALTER TABLE public.profiles ALTER COLUMN referral_code SET DEFAULT substr(md5(random()::text || gen_random_uuid()::text), 1, 8);
ALTER TABLE public.profiles ALTER COLUMN referral_code SET NOT NULL;

-- Create referrals tracking table
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES public.profiles(id),
  referred_id uuid NOT NULL REFERENCES public.profiles(id),
  credits_awarded integer NOT NULL DEFAULT 10,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(referred_id)
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- RLS: users can see their own referrals
CREATE POLICY "Users can view their own referrals" ON public.referrals
  FOR SELECT TO authenticated
  USING (referrer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all referrals" ON public.referrals
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Function to process referral on signup
CREATE OR REPLACE FUNCTION public.process_referral(_new_user_id uuid, _referral_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _referrer_profile profiles%ROWTYPE;
  _new_profile profiles%ROWTYPE;
BEGIN
  -- Find referrer by code
  SELECT * INTO _referrer_profile FROM public.profiles WHERE referral_code = _referral_code;
  IF _referrer_profile IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Find new user profile
  SELECT * INTO _new_profile FROM public.profiles WHERE user_id = _new_user_id;
  IF _new_profile IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Don't allow self-referral
  IF _referrer_profile.user_id = _new_user_id THEN
    RETURN FALSE;
  END IF;

  -- Check if already referred
  IF EXISTS (SELECT 1 FROM public.referrals WHERE referred_id = _new_profile.id) THEN
    RETURN FALSE;
  END IF;

  -- Link referral
  UPDATE public.profiles SET referred_by = _referrer_profile.id WHERE user_id = _new_user_id;

  -- Record referral
  INSERT INTO public.referrals (referrer_id, referred_id, credits_awarded)
  VALUES (_referrer_profile.id, _new_profile.id, 10);

  -- Award credits to referrer
  PERFORM public.add_credits(_referrer_profile.user_id, 10, 'referral', 'Реферальный бонус за приглашение друга');

  RETURN TRUE;
END;
$$;
