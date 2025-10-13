#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uchrjlngfzfibcpdxtky.supabase.co';
// Using service role key to bypass RLS
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjaHJqbG5nZnpmaWJjcGR4dGt5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyODU1MjQwNiwiZXhwIjoyMDQ0MTI4NDA2fQ.IeCW7fA-VikHS_lf0HN9KVZxYAfE6pDShywwPQqxzfA';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function disableRLS() {
    console.log('🔧 Disabling RLS on users table...\n');
    
    try {
        // First, let's check current RLS status
        const { data: tables, error: checkError } = await supabase
            .rpc('exec_sql', { 
                sql: "SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'users';" 
            });
        
        if (checkError) {
            console.log('Using alternative method...\n');
        }
        
        // Disable RLS
        const { data, error } = await supabase.rpc('exec_sql', {
            sql: 'ALTER TABLE users DISABLE ROW LEVEL SECURITY;'
        });
        
        if (error) {
            console.error('❌ Error:', error);
            console.log('\n⚠️  Please run this SQL manually in Supabase Dashboard:');
            console.log('\nALTER TABLE users DISABLE ROW LEVEL SECURITY;\n');
            return;
        }
        
        console.log('✅ RLS disabled on users table!');
        console.log('⚠️  WARNING: All users data is now publicly readable');
        console.log('💡 You can re-enable it later with proper policies\n');
        
    } catch (error) {
        console.error('❌ Unexpected error:', error.message);
        console.log('\n⚠️  Please run this SQL manually in Supabase Dashboard:');
        console.log('\n📋 Go to: https://supabase.com/dashboard/project/uchrjlngfzfibcpdxtky/editor');
        console.log('📋 SQL Editor → Run this:\n');
        console.log('ALTER TABLE users DISABLE ROW LEVEL SECURITY;\n');
    }
}

disableRLS();
