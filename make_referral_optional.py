#!/usr/bin/env python3
import re

# Read file
with open('/Users/akirayouky/Desktop/Siti/CDM86-NEW/public/login.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove "required" from referral input and update label
content = re.sub(
    r'<label for="reg-referral">Codice Referral \* 🎫</label>\s*<input type="text" id="reg-referral" required',
    '<label for="reg-referral">Codice Referral (opzionale) 🎫</label>\n                    <input type="text" id="reg-referral"',
    content
)

# 2. Make referral validation conditional
old_validation = r'''try \{
                // 1\. VALIDATE REFERRAL CODE FIRST \(check existing users\)
                const \{ data: referrer, error: referrerError \} = await supabase
                    \.from\('users'\)
                    \.select\('id, referral_code, first_name, last_name'\)
                    \.eq\('referral_code', referralCode\)
                    \.single\(\);
                
                if \(referrerError \|\| !referrer\) \{
                    throw new Error\('CODICE REFERRAL NON VALIDO! Il codice "' \+ referralCode \+ '" non esiste nel database\.'\);
                \}
                
                console\.log\('Referral valido:', referrer\);'''

new_validation = '''try {
                let referrer = null;
                
                // 1. VALIDATE REFERRAL CODE FIRST (only if provided)
                if (referralCode) {
                    const { data: referrerData, error: referrerError } = await supabase
                        .from('users')
                        .select('id, referral_code, first_name, last_name')
                        .eq('referral_code', referralCode)
                        .single();
                    
                    if (referrerError || !referrerData) {
                        throw new Error('CODICE REFERRAL NON VALIDO! Il codice "' + referralCode + '" non esiste nel database.');
                    }
                    
                    referrer = referrerData;
                    console.log('Referral valido:', referrer);
                } else {
                    console.log('Registrazione senza referral code');
                }'''

content = re.sub(old_validation, new_validation, content, flags=re.DOTALL)

# 3. Make referral_by_id update conditional
old_update = r'''// 3\. Wait for trigger then update referred_by_id
                await new Promise\(resolve => setTimeout\(resolve, 1500\)\);
                
                await supabase
                    \.from\('users'\)
                    \.update\(\{ referred_by_id: referrer\.id \}\)
                    \.eq\('id', authData\.user\.id\);
                
                showAlert\('Registrazione completata! Invitato da ' \+ referrer\.first_name \+ '\. Controlla email per conferma\.', 'success'\);'''

new_update = '''// 3. Wait for trigger then update referred_by_id (only if referrer exists)
                if (referrer) {
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    
                    await supabase
                        .from('users')
                        .update({ referred_by_id: referrer.id })
                        .eq('id', authData.user.id);
                }
                
                const successMsg = referrer 
                    ? 'Registrazione completata! Invitato da ' + referrer.first_name + '. Controlla email per conferma.'
                    : 'Registrazione completata! Controlla email per conferma.';
                
                showAlert(successMsg, 'success');'''

content = re.sub(old_update, new_update, content, flags=re.DOTALL)

# Write back
with open('/Users/akirayouky/Desktop/Siti/CDM86-NEW/public/login.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('✅ Referral code reso opzionale')
print('   - Campo not required')
print('   - Validazione solo se codice fornito')
print('   - Update referred_by_id solo se referrer esiste')
