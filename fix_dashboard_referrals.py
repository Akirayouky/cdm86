#!/usr/bin/env python3
"""
Script per aggiungere il display completo dei referrals nel dashboard
"""

import re

file_path = 'public/dashboard.html'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the section where we get referrals but don't display them
old_code = r'''                // Get referral stats
                const { data: referrals, error: refError } = await supabase
                    \.from\('users'\)
                    \.select\('id, first_name, last_name, created_at'\)
                    \.eq\('referred_by_id', currentUser\.id\);
                
                if \(\!refError && referrals\) \{
                    const statReferrals = document\.getElementById\('stat-referrals'\);
                    if \(statReferrals\) statReferrals\.textContent = referrals\.length;
                    
                    const countInvited = document\.getElementById\('count-invited'\);
                    if \(countInvited\) countInvited\.textContent = referrals\.length;
                \}'''

new_code = '''                // Get who referred this user (chi ti ha invitato)
                const { data: referrerData, error: referrerError } = await supabase
                    .from('users')
                    .select('id, first_name, last_name, referral_code')
                    .eq('id', userData.referred_by_id)
                    .single();
                
                const referrerContent = document.getElementById('referrer-content');
                if (referrerContent) {
                    if (!referrerError && referrerData) {
                        referrerContent.innerHTML = `
                            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px; margin-top: 10px;">
                                <div style="font-size: 0.9em; opacity: 0.9; margin-bottom: 8px;">SEI STATO INVITATO DA:</div>
                                <div style="font-size: 1.4em; font-weight: 600; margin-bottom: 4px;">${referrerData.first_name} ${referrerData.last_name}</div>
                                <div style="font-size: 1.1em; font-weight: 500; opacity: 0.95; margin-top: 8px; padding: 8px; background: rgba(255,255,255,0.2); border-radius: 8px; display: inline-block;">Codice: ${referrerData.referral_code}</div>
                            </div>
                        `;
                    } else {
                        referrerContent.innerHTML = `
                            <div style="text-align: center; padding: 30px; background: #f8f9fa; border-radius: 12px; margin-top: 10px;">
                                <div style="font-size: 2.5em; margin-bottom: 10px;">🌟</div>
                                <div style="font-size: 1.1em; color: #666;">Sei un utente originale!</div>
                                <div style="font-size: 0.9em; color: #999; margin-top: 5px;">Nessuno ti ha invitato.</div>
                            </div>
                        `;
                    }
                }
                
                // Get referral stats (persone che hai invitato)
                const { data: referrals, error: refError } = await supabase
                    .from('users')
                    .select('id, first_name, last_name, referral_code, created_at')
                    .eq('referred_by_id', currentUser.id)
                    .order('created_at', { ascending: false });
                
                if (!refError && referrals) {
                    const statReferrals = document.getElementById('stat-referrals');
                    if (statReferrals) statReferrals.textContent = referrals.length;
                    
                    const countInvited = document.getElementById('count-invited');
                    if (countInvited) countInvited.textContent = referrals.length;
                    
                    // Populate the list of invited users
                    const referredList = document.getElementById('referred-users');
                    if (referredList) {
                        if (referrals.length > 0) {
                            referredList.innerHTML = referrals.map(user => {
                                const initials = `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
                                const joinDate = new Date(user.created_at).toLocaleDateString('it-IT', { 
                                    day: 'numeric', 
                                    month: 'short', 
                                    year: 'numeric' 
                                });
                                
                                return `
                                    <li style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: white; border-radius: 12px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); transition: all 0.3s ease;">
                                        <div style="display: flex; align-items: center; gap: 15px;">
                                            <div style="width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 1.1em;">
                                                ${initials}
                                            </div>
                                            <div>
                                                <div style="font-weight: 600; font-size: 1.05em; color: #333; margin-bottom: 4px;">
                                                    ${user.first_name} ${user.last_name}
                                                </div>
                                                <div style="font-size: 0.85em; color: #999;">
                                                    Iscritto il ${joinDate}
                                                </div>
                                            </div>
                                        </div>
                                        <div style="text-align: right;">
                                            <div style="font-size: 0.8em; color: #999; margin-bottom: 4px;">Codice Referral</div>
                                            <div style="font-weight: 600; font-size: 1.1em; color: #667eea;">${user.referral_code}</div>
                                        </div>
                                    </li>
                                `;
                            }).join('');
                        } else {
                            referredList.innerHTML = `
                                <div style="text-align: center; padding: 40px; background: #f8f9fa; border-radius: 12px;">
                                    <div style="font-size: 3em; margin-bottom: 15px;">👥</div>
                                    <div style="font-size: 1.1em; color: #666; margin-bottom: 8px;">Non hai ancora invitato nessuno</div>
                                    <div style="font-size: 0.9em; color: #999;">Condividi il tuo codice referral per iniziare!</div>
                                </div>
                            `;
                        }
                    }
                }'''

# Replace using regex
content_new = re.sub(old_code, new_code, content, flags=re.DOTALL)

if content_new != content:
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content_new)
    print(f"✅ Dashboard aggiornato con display completo referrals")
    print("   - Aggiunto: Chi ti ha invitato (nome, cognome, codice)")
    print("   - Aggiunto: Lista persone invitate con nomi, cognomi e codici")
else:
    print("❌ Pattern non trovato - il codice potrebbe essere già aggiornato")
