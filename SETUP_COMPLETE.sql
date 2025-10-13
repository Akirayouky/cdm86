-- ============================================
-- SETUP COMPLETO CDM86 - ESEGUI IN ORDINE
-- ============================================

-- STEP 1: Crea funzione per generare codice referral
-- ============================================
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS VARCHAR(10) AS $$
DECLARE
    new_code VARCHAR(10);
    code_exists BOOLEAN;
BEGIN
    LOOP
        -- Genera codice: 3 lettere maiuscole + 4 numeri
        new_code := upper(substr(md5(random()::text), 1, 3)) || 
                    lpad(floor(random() * 10000)::text, 4, '0');
        
        -- Verifica se esiste già
        SELECT EXISTS(
            SELECT 1 FROM users WHERE referral_code = new_code
        ) INTO code_exists;
        
        EXIT WHEN NOT code_exists;
    END LOOP;
    
    RETURN new_code;
END;
$$ LANGUAGE plpgsql;


-- STEP 2: Crea funzione trigger handle_new_user
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
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        generate_referral_code(),
        NOW(),
        NOW()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- STEP 3: Crea trigger su auth.users
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();


-- STEP 4: Crea entry per utente esistente (Diego)
-- ============================================
-- Prima trova l'ID dell'utente da auth.users
DO $$
DECLARE
    user_uuid UUID;
BEGIN
    -- Trova l'ID dell'utente Diego
    SELECT id INTO user_uuid 
    FROM auth.users 
    WHERE email = 'diegomarruchi@outlook.it';
    
    -- Se trovato, crea l'entry in public.users
    IF user_uuid IS NOT NULL THEN
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
            user_uuid,
            'diegomarruchi@outlook.it',
            'Diego',
            'Marruchi',
            generate_referral_code(),
            0,
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO NOTHING; -- Se esiste già, non fare nulla
        
        RAISE NOTICE 'User created with ID: %', user_uuid;
    ELSE
        RAISE NOTICE 'User not found in auth.users. Please register first.';
    END IF;
END $$;


-- STEP 5: Verifica risultato
-- ============================================
SELECT 
    'Trigger creato!' as status,
    trigger_name, 
    event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Verifica utente Diego
SELECT 
    id,
    email,
    first_name,
    last_name,
    referral_code,
    points
FROM users
WHERE email = 'diegomarruchi@outlook.it';
