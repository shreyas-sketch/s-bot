-- Enable RLS on Stocks_portfolio table (correct case)
ALTER TABLE public."Stocks_portfolio" ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view their own data
CREATE POLICY "Users can view their own stocks data" 
ON public."Stocks_portfolio" 
FOR SELECT 
USING (user_id = current_setting('request.jwt.claims', true)::json->>'email');

-- Create policy to allow users to insert their own data
CREATE POLICY "Users can insert their own stocks data" 
ON public."Stocks_portfolio" 
FOR INSERT 
WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'email');