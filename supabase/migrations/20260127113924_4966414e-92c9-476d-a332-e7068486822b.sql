-- Drop the restrictive policy and create a permissive one
DROP POLICY IF EXISTS "Anyone can view active products" ON public.credit_products;

CREATE POLICY "Anyone can view active products" 
ON public.credit_products 
FOR SELECT 
USING (is_active = true);