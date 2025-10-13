#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uchrjlngfzfibcpdxtky.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjaHJqbG5nZnpmaWJjcGR4dGt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMzEyMDYsImV4cCI6MjA3NTYwNzIwNn0.64JK3OhYJi2YtrErctNAp_sCcSHwB656NVLdooyceOM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuthenticatedAccess() {
    console.log('🔐 Testing authenticated access...\n');
    
    // Try to login
    console.log('Step 1: Attempting login...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'diego.marruchi@gmail.com',
        password: 'Test1234!'
    });
    
    if (authError) {
        console.log('❌ Login failed:', authError.message);
        return;
    }
    
    console.log('✅ Login successful!');
    console.log('   User ID:', authData.user.id);
    
    // Now try to read user data
    console.log('\nStep 2: Reading user data from users table...');
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();
    
    if (userError) {
        console.log('❌ ERROR reading user data:', userError.message);
        console.log('   Code:', userError.code);
        console.log('\n🚨 THIS IS THE PROBLEM! RLS is blocking authenticated users too!');
        console.log('\n⚠️  RUN THIS SQL IN SUPABASE:');
        console.log('   ALTER TABLE users DISABLE ROW LEVEL SECURITY;\n');
    } else {
        console.log('✅ User data retrieved successfully!');
        console.log('   Name:', userData.first_name, userData.last_name);
        console.log('   Referral Code:', userData.referral_code);
    }
    
    // Logout
    await supabase.auth.signOut();
}

testAuthenticatedAccess();
