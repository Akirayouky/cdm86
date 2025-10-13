#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uchrjlngfzfibcpdxtky.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjaHJqbG5nZnpmaWJjcGR4dGt5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyODU1MjQwNiwiZXhwIjoyMDQ0MTI4NDA2fQ.IeCW7fA-VikHS_lf0HN9KVZxYAfE6pDShywwPQqxzfA';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixRLS() {
    console.log('🔧 Fixing RLS policies for users table...\n');
    
    // Drop existing policies
    const dropPolicies = `
        DROP POLICY IF EXISTS "Allow referral code validation" ON users;
        DROP POLICY IF EXISTS "Users can be created via trigger" ON users;
        DROP POLICY IF EXISTS "Users can update own record" ON users;
        DROP POLICY IF EXISTS "Users can delete own record" ON users;
    `;
    
    // Create new policies
    const createPolicies = `
        -- Allow ANYONE (anon + authenticated) to read users for referral validation
        CREATE POLICY "Allow referral code validation"
        ON users
        FOR SELECT
        TO anon, authenticated
        USING (true);
        
        -- Allow INSERT only via trigger (authenticated users)
        CREATE POLICY "Users can be created via trigger"
        ON users
        FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = id);
        
        -- Allow UPDATE only own record
        CREATE POLICY "Users can update own record"
        ON users
        FOR UPDATE
        TO authenticated
        USING (auth.uid() = id)
        WITH CHECK (auth.uid() = id);
        
        -- Allow DELETE only own record
        CREATE POLICY "Users can delete own record"
        ON users
        FOR DELETE
        TO authenticated
        USING (auth.uid() = id);
    `;
    
    try {
        // Execute drop policies
        const { error: dropError } = await supabase.rpc('exec_sql', { sql: dropPolicies });
        if (dropError) {
            console.log('⚠️  Drop policies (might not exist):', dropError.message);
        }
        
        // Execute create policies
        const { error: createError } = await supabase.rpc('exec_sql', { sql: createPolicies });
        if (createError) {
            console.error('❌ Error creating policies:', createError);
            return;
        }
        
        console.log('✅ RLS policies updated successfully!');
        console.log('\n📋 Policies created:');
        console.log('  1. Allow referral code validation (SELECT for anon + authenticated)');
        console.log('  2. Users can be created via trigger (INSERT for authenticated)');
        console.log('  3. Users can update own record (UPDATE for authenticated)');
        console.log('  4. Users can delete own record (DELETE for authenticated)');
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

fixRLS();
