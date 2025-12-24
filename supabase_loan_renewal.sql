-- Migration: Add renewal_count and fine support
-- Run this in Supabase SQL Editor

-- 1. Add renewal_count column to loans table
ALTER TABLE loans 
ADD COLUMN IF NOT EXISTS renewal_count INTEGER DEFAULT 0;

-- 2. Add fine_amount column to loans table  
ALTER TABLE loans 
ADD COLUMN IF NOT EXISTS fine_amount INTEGER DEFAULT 0;

-- 3. Add has_unpaid_fine column to users table (to block borrowing)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS has_unpaid_fine BOOLEAN DEFAULT false;

-- 4. Drop existing function first (to change return type)
DROP FUNCTION IF EXISTS renew_loan(UUID);

-- 5. Create the renew_loan function with restrictions
CREATE OR REPLACE FUNCTION renew_loan(p_loan_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_loan RECORD;
    v_days_left INTEGER;
    v_new_due_date DATE;
BEGIN
    -- Get loan details
    SELECT * INTO v_loan FROM loans WHERE id = p_loan_id AND status = 'borrowed';
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'message', 'Pinjaman tidak ditemukan atau sudah dikembalikan');
    END IF;
    
    -- Calculate days left
    v_days_left := v_loan.due_date - CURRENT_DATE;
    
    -- Check if overdue (cannot renew if overdue)
    IF v_days_left < 0 THEN
        RETURN json_build_object('success', false, 'message', 'Buku sudah terlambat! Silakan kembalikan dan bayar denda Rp ' || (ABS(v_days_left) * 5000) || ' terlebih dahulu.');
    END IF;
    
    -- Check if can renew (only when 2 days or less remaining)
    IF v_days_left > 2 THEN
        RETURN json_build_object('success', false, 'message', 'Perpanjangan hanya bisa dilakukan saat sisa 2 hari atau kurang. Sisa waktu: ' || v_days_left || ' hari.');
    END IF;
    
    -- Check renewal count (max 2 times)
    IF v_loan.renewal_count >= 2 THEN
        RETURN json_build_object('success', false, 'message', 'Sudah mencapai batas maksimal perpanjangan (2 kali). Silakan kembalikan buku.');
    END IF;
    
    -- Calculate new due date (extend by 5 days)
    v_new_due_date := v_loan.due_date + INTERVAL '5 days';
    
    -- Update the loan
    UPDATE loans 
    SET 
        due_date = v_new_due_date,
        renewal_count = COALESCE(renewal_count, 0) + 1,
        updated_at = NOW()
    WHERE id = p_loan_id;
    
    RETURN json_build_object(
        'success', true, 
        'message', 'Berhasil diperpanjang! Perpanjangan ke-' || (COALESCE(v_loan.renewal_count, 0) + 1) || '. Batas pengembalian baru: ' || TO_CHAR(v_new_due_date, 'DD Month YYYY'),
        'new_due_date', v_new_due_date,
        'renewal_count', COALESCE(v_loan.renewal_count, 0) + 1
    );
END;
$$;

-- 5. Function to calculate and update fines for overdue books
CREATE OR REPLACE FUNCTION update_overdue_fines()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- Update fine_amount for all overdue borrowed books
    UPDATE loans
    SET fine_amount = (CURRENT_DATE - due_date) * 5000
    WHERE status = 'borrowed' 
    AND due_date < CURRENT_DATE;
    
    -- Mark users with unpaid fines
    UPDATE users
    SET has_unpaid_fine = true
    WHERE id IN (
        SELECT DISTINCT user_id 
        FROM loans 
        WHERE status = 'borrowed' 
        AND due_date < CURRENT_DATE
    );
    
    -- Clear the flag for users without overdue books
    UPDATE users
    SET has_unpaid_fine = false
    WHERE id NOT IN (
        SELECT DISTINCT user_id 
        FROM loans 
        WHERE status = 'borrowed' 
        AND due_date < CURRENT_DATE
    );
END;
$$;

-- 6. Create a check function to prevent borrowing if has fine
CREATE OR REPLACE FUNCTION check_can_borrow(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    v_has_fine BOOLEAN;
    v_overdue_count INTEGER;
    v_total_fine INTEGER;
BEGIN
    -- Check for overdue books
    SELECT 
        COUNT(*),
        COALESCE(SUM((CURRENT_DATE - due_date) * 5000), 0)
    INTO v_overdue_count, v_total_fine
    FROM loans 
    WHERE user_id = p_user_id 
    AND status = 'borrowed' 
    AND due_date < CURRENT_DATE;
    
    IF v_overdue_count > 0 THEN
        RETURN json_build_object(
            'can_borrow', false, 
            'message', 'Anda memiliki ' || v_overdue_count || ' buku terlambat dengan total denda Rp ' || v_total_fine || '. Silakan kembalikan dan bayar denda terlebih dahulu.',
            'overdue_count', v_overdue_count,
            'total_fine', v_total_fine
        );
    END IF;
    
    RETURN json_build_object('can_borrow', true, 'message', 'OK');
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION renew_loan(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_can_borrow(UUID) TO authenticated;
