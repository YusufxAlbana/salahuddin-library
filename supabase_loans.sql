-- Create loans table
CREATE TABLE IF NOT EXISTS public.loans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  book_id INTEGER REFERENCES public.books(id) NOT NULL,
  borrow_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  due_date TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '5 days'),
  return_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'borrowed' CHECK (status IN ('borrowed', 'returned')),
  renewal_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

-- Policies
-- Admin can view all loans
CREATE POLICY "Admin view all loans" ON public.loans 
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Users can view their own loans
CREATE POLICY "Users view own loans" ON public.loans 
FOR SELECT USING (
  auth.uid() = user_id
);

-- Admin can update loans (for manual returns/adjustments if needed)
CREATE POLICY "Admin update loans" ON public.loans 
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- FUNCTION: Borrow Book
-- Checks stock, inserts loan, decrements stock atomically
CREATE OR REPLACE FUNCTION borrow_book(p_book_id INTEGER, p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_stock INTEGER;
  v_loan_id UUID;
BEGIN
  -- Check stock
  SELECT stock INTO v_stock FROM public.books WHERE id = p_book_id;
  
  IF v_stock IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Book not found');
  END IF;

  IF v_stock < 1 THEN
    RETURN jsonb_build_object('success', false, 'message', 'Stock habis');
  END IF;

  -- Check if user is already borrowing this specific book (active copy) - Optional but good practice
  IF EXISTS (SELECT 1 FROM public.loans WHERE user_id = p_user_id AND book_id = p_book_id AND status = 'borrowed') THEN
     RETURN jsonb_build_object('success', false, 'message', 'Anda sedang meminjam buku ini');
  END IF;

  -- Verify user exists in public.users (optional sanity check)
  -- Perform updates
  UPDATE public.books SET stock = stock - 1 WHERE id = p_book_id;
  
  INSERT INTO public.loans (user_id, book_id, status)
  VALUES (p_user_id, p_book_id, 'borrowed')
  RETURNING id INTO v_loan_id;

  RETURN jsonb_build_object('success', true, 'message', 'Berhasil meminjam buku', 'loan_id', v_loan_id);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$;

-- FUNCTION: Return Book
-- Updates loan status, increments stock
CREATE OR REPLACE FUNCTION return_book(p_loan_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_book_id INTEGER;
  v_status TEXT;
BEGIN
  -- Get loan details
  SELECT book_id, status INTO v_book_id, v_status FROM public.loans WHERE id = p_loan_id;
  
  IF v_status IS NULL THEN
     RETURN jsonb_build_object('success', false, 'message', 'Loan not found');
  END IF;

  IF v_status = 'returned' THEN
     RETURN jsonb_build_object('success', false, 'message', 'Buku sudah dikembalikan');
  END IF;

  -- Update loan
  UPDATE public.loans 
  SET status = 'returned', return_date = NOW() 
  WHERE id = p_loan_id;

  -- Increment stock
  UPDATE public.books SET stock = stock + 1 WHERE id = v_book_id;

  RETURN jsonb_build_object('success', true, 'message', 'Buku berhasil dikembalikan');
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$;

-- FUNCTION: Renew Loan
-- Extends due_date by 5 days if eligible
CREATE OR REPLACE FUNCTION renew_loan(p_loan_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_due_date TIMESTAMP WITH TIME ZONE;
  v_renewal_count INTEGER;
  v_days_left INTEGER;
  v_new_due_date TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT due_date, renewal_count INTO v_due_date, v_renewal_count 
  FROM public.loans WHERE id = p_loan_id;

  IF v_due_date IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Loan not found');
  END IF;

  -- Check max renewals (2x)
  IF v_renewal_count >= 2 THEN
    RETURN jsonb_build_object('success', false, 'message', 'Batas perpanjangan (2x) sudah habis');
  END IF;

  -- Check days remaining (allow if 2 days or less)
  -- EXTRACT(JOOD from ...) returns distinct julian days, subtraction gives diff
  -- Alternatively simpler logic: due_date - now() < 2 days
  IF v_due_date > (NOW() + INTERVAL '2 days') THEN
     RETURN jsonb_build_object('success', false, 'message', 'Perpanjangan hanya bisa dilakukan H-2 jatuh tempo');
  END IF;
  
  IF v_due_date < NOW() THEN
      RETURN jsonb_build_object('success', false, 'message', 'Peminjaman sudah lewat jatuh tempo, tidak bisa diperpanjang');
  END IF;

  -- Perform renewal
  v_new_due_date := v_due_date + INTERVAL '5 days';
  
  UPDATE public.loans 
  SET due_date = v_new_due_date, renewal_count = renewal_count + 1
  WHERE id = p_loan_id;

  RETURN jsonb_build_object('success', true, 'message', 'Berhasil diperpanjang 5 hari', 'new_due_date', v_new_due_date);
END;
$$;
