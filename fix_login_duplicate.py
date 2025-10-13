#!/usr/bin/env python3
import re

# Read file
with open('/Users/akirayouky/Desktop/Siti/CDM86-NEW/public/login.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern to find the duplicate referral input section
pattern = r'''        // REGISTER FORM

        // Force uppercase on referral input
        const referralInput = document\.getElementById\('reg-referral'\);
        if \(referralInput\) \{
            referralInput\.addEventListener\('input', \(e\) => \{
                e\.target\.value = e\.target\.value\.toUpperCase\(\);
            \}\);
        \}
        
        
        // Force uppercase on referral input
        const referralInput = document\.getElementById\('reg-referral'\);
        if \(referralInput\) \{
            referralInput\.addEventListener\('input', \(e\) => \{
                e\.target\.value = e\.target\.value\.toUpperCase\(\);
            \}\);
        \}
        
                document\.getElementById\('register-form'\)'''

# Replacement with clean version and correct indentation
replacement = '''        // REGISTER FORM
        
        // Force uppercase on referral input
        const referralInput = document.getElementById('reg-referral');
        if (referralInput) {
            referralInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.toUpperCase();
            });
        }
        
        document.getElementById('register-form')'''

content = re.sub(pattern, replacement, content, flags=re.DOTALL)

# Write back
with open('/Users/akirayouky/Desktop/Siti/CDM86-NEW/public/login.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('✅ Rimosso codice duplicato e corretto indentazione register-form')
