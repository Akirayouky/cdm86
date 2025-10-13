-- ============================================
-- FIX DEFINITIVO RLS PER TABELLA USERS
-- ============================================

-- 1. Disabilita completamente RLS sulla tabella users
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 2. Se vuoi verificare lo stato attuale di RLS:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'users';

-- ============================================
-- NOTA: Con RLS disabilitato, TUTTI gli utenti
-- possono leggere/scrivere sulla tabella users.
-- Questo è OK per testing, ma in produzione
-- dovrai configurare le policy corrette.
-- ============================================
