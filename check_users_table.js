/**
 * Script per verificare la struttura della tabella users
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uchrjlngfzfibcpdxtky.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjaHJqbG5nZnpmaWJjcGR4dGt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMzEyMDYsImV4cCI6MjA3NTYwNzIwNn0.64JK3OhYJi2YtrErctNAp_sCcSHwB656NVLdooyceOM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsersTable() {
    console.log('🔍 Controllo struttura tabella users...\n');
    
    // Query sample user
    const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .limit(2);
    
    if (error) {
        console.error('❌ Errore:', error);
        return;
    }
    
    if (users && users.length > 0) {
        console.log('✅ Tabella users trovata!');
        console.log('\n📋 Campi disponibili:');
        console.log(Object.keys(users[0]));
        console.log('\n📊 Esempio dati utente:');
        console.log(JSON.stringify(users[0], null, 2));
        
        // Check referral connections
        if (users[0].referred_by_id) {
            console.log('\n🔗 Utente ha un referrer! ID:', users[0].referred_by_id);
            
            // Get referrer details
            const { data: referrer } = await supabase
                .from('users')
                .select('id, first_name, last_name, referral_code')
                .eq('id', users[0].referred_by_id)
                .single();
            
            if (referrer) {
                console.log('👤 Referrer:', referrer.first_name, referrer.last_name, '(' + referrer.referral_code + ')');
            }
        }
        
        // Check if anyone referred this user
        const { data: referred, error: refError } = await supabase
            .from('users')
            .select('id, first_name, last_name, referral_code, created_at')
            .eq('referred_by_id', users[0].id);
        
        if (referred && referred.length > 0) {
            console.log('\n👥 Utenti invitati da questo utente:', referred.length);
            referred.forEach(u => {
                console.log(`  - ${u.first_name} ${u.last_name} (${u.referral_code})`);
            });
        } else {
            console.log('\n👥 Questo utente non ha ancora invitato nessuno');
        }
        
    } else {
        console.log('⚠️ Nessun utente trovato nella tabella');
    }
}

checkUsersTable();
