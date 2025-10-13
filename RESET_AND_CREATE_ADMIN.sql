-- ============================================
-- RESET E SETUP UTENTE ADMIN UNICO
-- ============================================

-- STEP 1: Pulisci tutto
-- ============================================
TRUNCATE TABLE users CASCADE;
DELETE FROM auth.users;

-- STEP 2: Funzione per generare referral code
-- ============================================
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS VARCHAR(10) AS $$
DECLARE
    new_code VARCHAR(10);
    code_exists BOOLEAN;
BEGIN
    LOOP
        new_code := upper(substr(md5(random()::text), 1, 3)) || 
                    lpad(floor(random() * 10000)::text, 4, '0');
        SELECT EXISTS(SELECT 1 FROM users WHERE referral_code = new_code) INTO code_exists;
        EXIT WHEN NOT code_exists;
    END LOOP;
    RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- STEP 3: Trigger per auto-creare utenti in public.users
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, first_name, last_name, referral_code, points, created_at, updated_at)
    VALUES (NEW.id, NEW.email, 
            COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
            COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
            generate_referral_code(), 0, NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- STEP 4: Crea utente ADMIN direttamente
-- ============================================
-- Crea utente in auth.users con password criptata
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
    'authenticated',
    'authenticated',
    'diegomarruchi@outlook.it',
    crypt('Criogenia2025!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"first_name":"Diego","last_name":"Marruchi"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- Crea entry in public.users
INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    referral_code,
    points,
    created_at,
    updated_at
) VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
    'diegomarruchi@outlook.it',
    'Diego',
    'Marruchi',
    'ADMIN001',
    0,
    NOW(),
    NOW()
);

-- STEP 5: Verifica
-- ============================================
SELECT 
    'UTENTE CREATO!' as status,
    id,
    email,
    first_name,
    last_name,
    referral_code,
    points
FROM users
WHERE email = 'diegomarruchi@outlook.it';
