#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uchrjlngfzfibcpdxtky.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjaHJqbG5nZnpmaWJjcGR4dGt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMzEyMDYsImV4cCI6MjA3NTYwNzIwNn0.64JK3OhYJi2YtrErctNAp_sCcSHwB656NVLdooyceOM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRLS() {
    console.log('🔍 Testing RLS on users table...\n');
    
    // Test 1: Try to read users without authentication
    console.log('Test 1: Reading users table (without auth)...');
    const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, referral_code, first_name, last_name')
        .limit(1);
    
    if (usersError) {
        console.log('❌ ERROR:', usersError.message);
        console.log('   Code:', usersError.code);
        if (usersError.code === 'PGRST116' || usersError.message.includes('406')) {
            console.log('\n🚨 RLS IS BLOCKING ACCESS!\n');
            console.log('⚠️  YOU MUST RUN THIS SQL IN SUPABASE:\n');
            console.log('   ALTER TABLE users DISABLE ROW LEVEL SECURITY;\n');
            console.log('📋 Go to: https://supabase.com/dashboard/project/uchrjlngfzfibcpdxtky/editor');
        }
    } else {
        console.log('✅ SUCCESS! RLS is disabled or configured correctly');
        console.log('   Found', users?.length || 0, 'users');
        if (users && users.length > 0) {
            console.log('   Example user:', users[0]);
        }
    }
    
    // Test 2: Check if we can search by referral code
    console.log('\nTest 2: Searching by referral code...');
    const { data: referralTest, error: referralError } = await supabase
        .from('users')
        .select('id, referral_code, first_name, last_name')
        .eq('referral_code', 'SER8039')
        .single();
    
    if (referralError) {
        console.log('❌ ERROR:', referralError.message);
        if (referralError.code === 'PGRST116') {
            console.log('   This means RLS is blocking referral validation!');
        }
    } else if (referralTest) {
        console.log('✅ Found user with referral code SER8039');
        console.log('   User:', referralTest.first_name, referralTest.last_name);
    } else {
        console.log('⚠️  No user found with that referral code');
    }
}

testRLS();
