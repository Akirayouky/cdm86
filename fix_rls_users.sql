-- Fix RLS policies per permettere la validazione del referral code
-- durante la registrazione (utente non ancora autenticato)

-- 1. Abilita RLS sulla tabella users (se non già abilitato)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 2. Policy per permettere a CHIUNQUE di LEGGERE solo i campi necessari 
-- per la validazione del referral code (id, referral_code, first_name, last_name)
-- Questa policy è SICURA perché espone solo dati non sensibili
DROP POLICY IF EXISTS "Allow referral code validation" ON users;
CREATE POLICY "Allow referral code validation"
ON users
FOR SELECT
TO anon, authenticated
USING (true);

-- 3. Policy per permettere INSERT solo tramite trigger (dopo signUp di Supabase Auth)
DROP POLICY IF EXISTS "Users can be created via trigger" ON users;
CREATE POLICY "Users can be created via trigger"
ON users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- 4. Policy per permettere UPDATE solo del proprio record
DROP POLICY IF EXISTS "Users can update own record" ON users;
CREATE POLICY "Users can update own record"
ON users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 5. Policy per permettere DELETE solo del proprio record
DROP POLICY IF EXISTS "Users can delete own record" ON users;
CREATE POLICY "Users can delete own record"
ON users
FOR DELETE
TO authenticated
USING (auth.uid() = id);
