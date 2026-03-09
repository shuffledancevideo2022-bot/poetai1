-- Create function for admins to create test payments (fixed parameter order)
CREATE OR REPLACE FUNCTION public.create_test_payment(
  _email text,
  _amount numeric,
  _credits_amount integer,
  _currency text DEFAULT 'RUB',
  _status text DEFAULT 'pending',
  _payment_method text DEFAULT 'test'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _payment_id uuid;
  _user_id uuid;
BEGIN
  -- Check if caller is admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can create test payments';
  END IF;

  -- Try to find user by email
  SELECT user_id INTO _user_id 
  FROM profiles 
  WHERE email = _email 
  LIMIT 1;

  -- Create test payment
  INSERT INTO payments (
    user_id,
    email,
    amount,
    currency,
    credits_amount,
    status,
    payment_method,
    lava_invoice_id,
    completed_at,
    metadata
  ) VALUES (
    _user_id,
    _email,
    _amount,
    _currency,
    _credits_amount,
    _status,
    _payment_method,
    'test_' || gen_random_uuid(),
    CASE WHEN _status = 'completed' THEN now() ELSE NULL END,
    jsonb_build_object(
      'test', true,
      'created_by_admin', auth.uid(),
      'timestamp', extract(epoch from now())
    )
  )
  RETURNING id INTO _payment_id;

  -- If payment is completed and user exists, add credits
  IF _status = 'completed' AND _user_id IS NOT NULL THEN
    PERFORM add_credits(
      _user_id,
      _credits_amount,
      'test_purchase',
      'Тестовая покупка ' || _credits_amount || ' кредитов',
      _payment_id
    );
  END IF;

  RETURN _payment_id;
END;
$$;