-- ============================================
-- SETUP COMPLETO CDM86 CON UTENTI DI TEST
-- ============================================

-- STEP 1: Funzione per generare referral code
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
        
        SELECT EXISTS(
            SELECT 1 FROM users WHERE referral_code = new_code
        ) INTO code_exists;
        
        EXIT WHEN NOT code_exists;
    END LOOP;
    
    RETURN new_code;
END;
$$ LANGUAGE plpgsql;


-- STEP 2: Trigger per auto-creare utenti in public.users
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
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
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        generate_referral_code(),
        0,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();


-- STEP 3: Crea utenti di test in public.users
-- ============================================
-- NOTA: Gli ID devono corrispondere a quelli in auth.users
-- Devi prima creare gli utenti in Supabase Auth UI, poi usa questi ID

-- Pulisci tabella users se necessario
-- TRUNCATE TABLE users CASCADE;

-- ADMIN USER (Diego)
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
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,  -- ID TEMPORANEO - SOSTITUISCI CON ID REALE
    'diegomarruchi@outlook.it',
    'Diego',
    'Marruchi',
    'ADMIN001',
    100,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    referral_code = EXCLUDED.referral_code;

-- TEST USER 1 (invitato da Diego)
INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    referral_code,
    referred_by_id,
    points,
    created_at,
    updated_at
) VALUES (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,  -- ID TEMPORANEO
    'test1@example.com',
    'Mario',
    'Rossi',
    'TEST1234',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,  -- Invitato da Diego
    50,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    referred_by_id = EXCLUDED.referred_by_id;

-- TEST USER 2 (invitato da Mario)
INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    referral_code,
    referred_by_id,
    points,
    created_at,
    updated_at
) VALUES (
    'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid,  -- ID TEMPORANEO
    'test2@example.com',
    'Laura',
    'Bianchi',
    'TEST5678',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,  -- Invitato da Mario
    25,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    referred_by_id = EXCLUDED.referred_by_id;


-- STEP 4: Verifica risultati
-- ============================================
SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.referral_code,
    u.points,
    referrer.first_name || ' ' || referrer.last_name as invited_by
FROM users u
LEFT JOIN users referrer ON u.referred_by_id = referrer.id
ORDER BY u.created_at;

-- Conta referral per ogni utente
SELECT 
    u.first_name || ' ' || u.last_name as user_name,
    u.referral_code,
    COUNT(invited.id) as total_invited
FROM users u
LEFT JOIN users invited ON invited.referred_by_id = u.id
GROUP BY u.id, u.first_name, u.last_name, u.referral_code
ORDER BY total_invited DESC;
