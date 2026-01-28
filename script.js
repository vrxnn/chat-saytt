// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyA-cTw11-XvqUnSCePu9RqdT1Ob_jnSaGQ",
    authDomain: "group-chat-c36b5.firebaseapp.com",
    databaseURL: "https://group-chat-c36b5-default-rtdb.firebaseio.com",
    projectId: "group-chat-c36b5",
    storageBucket: "group-chat-c36b5.firebasestorage.app",
    messagingSenderId: "453401126384",
    appId: "1:453401126384:web:486c2b0523e02ab116e935"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();
const storage = firebase.storage();

// Global variables
let currentUser = localStorage.getItem('chat_user');
let userRole = 'user';
let selectedFile = null;
let isProcessing = false;
let isMuted = false;
let muteReason = '';

// ========== GOOGLE SIGNIN ==========
async function signInWithGoogle() {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({
            prompt: 'select_account'
        });
        
        const result = await auth.signInWithPopup(provider);
        const user = result.user;
        
        if (user) {
            const username = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
            
            const banSnap = await db.ref('banned/' + username).once('value');
            if (banSnap.exists()) {
                await auth.signOut();
                alert("❌ Siz banlangansiz!");
                return;
            }
            
            const userRef = db.ref('users/' + username);
            const userSnap = await userRef.once('value');
            
            if (!userSnap.exists()) {
                await userRef.set({
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                    joined: Date.now(),
                    authMethod: 'google',
                    role: 'user'
                });
            } else {
                await userRef.update({
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                    lastLogin: Date.now()
                });
            }
            
            localStorage.setItem('chat_user', username);
            localStorage.setItem('auth_method', 'google');
            location.reload();
        }
    } catch (error) {
        console.error("Google signin xatolik:", error);
        if (error.code === 'auth/popup-closed-by-user') {
            alert("Kirish bekor qilindi");
        } else if (error.code === 'auth/cancelled-popup-request') {
            console.log("Popup so'rovi bekor qilindi");
        } else {
            alert("Google orqali kirish xatolik! Qaytadan urinib ko'ring.");
        }
    }
}

// ========== ODDIY AUTH ==========
async function handleAuth() {
    const userInput = document.getElementById('username');
    const passInput = document.getElementById('password');
    
    if (!userInput || !passInput) {
        alert("Xatolik: Formani topolmadim!");
        return;
    }
    
    const user = userInput.value.trim().toLowerCase();
    const pass = passInput.value.trim();
    
    if (user.length < 3) {
        alert("Foydalanuvchi nomi kamida 3 ta belgidan iborat bo'lishi kerak!");
        return;
    }
    
    if (!pass || pass.length < 4) {
        alert("Parol kamida 4 ta belgidan iborat bo'lishi kerak!");
        return;
    }

    try {
        const banSnap = await db.ref('banned/' + user).once('value');
        if (banSnap.exists()) {
            alert("❌ Siz banlangansiz!");
            return;
        }

        const userRef = db.ref('users/' + user);
        const snap = await userRef.once('value');

        if (snap.exists()) {
            const userData = snap.val();
            if (userData.authMethod === 'google') {
                alert("❌ Bu akkaunt Google orqali yaratilgan. Google orqali kiring!");
                return;
            }
            if (userData.password !== pass) {
                alert("❌ Parol xato!");
                return;
            }
            await userRef.update({ lastLogin: Date.now() });
        } else {
            await userRef.set({ 
                password: pass, 
                joined: Date.now(),
                authMethod: 'password',
                role: 'user'
            });
        }

        localStorage.setItem('chat_user', user);
        localStorage.setItem('auth_method', 'password');
        location.reload();
    } catch (error) {
        console.error("Auth xatolik:", error);
        alert("Xatolik yuz berdi! Iltimos qaytadan urinib ko'ring.");
    }
}

// ========== INITIALIZATION ==========
if (currentUser) {
    document.getElementById('auth-page').style.display = 'none';
    document.getElementById('chat-page').style.display = 'flex';
    document.getElementById('display-name').innerText = currentUser;
    document.getElementById('avatar-text').innerText = currentUser[0].toUpperCase();
    
    initApp();
}

async function initApp() {
    await loadUserRole();
    await checkMuteStatus();
    loadMessages();
    trackOnline();
    syncPin();
    updateRankDisplay();
    setupInputListeners();
    
    console.log("✅ Chat yuklandi! User:", currentUser, "Role:", userRole);
}

// ========== FOYDALANUVCHI ROLINI YUKLASH ==========
async function loadUserRole() {
    try {
        const userSnap = await db.ref('users/' + currentUser).once('value');
        if (userSnap.exists()) {
            const userData = userSnap.val();
            userRole = userData.role || 'user';
        } else {
            userRole = 'user';
        }
    } catch (error) {
        console.error("Role yuklashda xatolik:", error);
        userRole = 'user';
    }
}

// ========== MUTE STATUSINI TEKSHIRISH ==========
async function checkMuteStatus() {
    try {
        const muteSnap = await db.ref('muted/' + currentUser).once('value');
        if (muteSnap.exists()) {
            const muteData = muteSnap.val();
            const now = Date.now();
            
            if (muteData.until > now) {
                isMuted = true;
                muteReason = muteData.reason || '';
                
                const remainingTime = Math.ceil((muteData.until - now) / 60000);
                alert(`❌ Siz ${remainingTime} daqiqaga mute qilingansiz!\nSabab: ${muteReason}`);
            } else {
                await db.ref('muted/' + currentUser).remove();
                isMuted = false;
            }
        } else {
            isMuted = false;
        }
        
        // Mute status o'zgarishini kuzatish
        db.ref('muted/' + currentUser).on('value', snap => {
            if (snap.exists()) {
                const muteData = snap.val();
                const now = Date.now();
                
                if (muteData.until > now) {
                    isMuted = true;
                    muteReason = muteData.reason || '';
                } else {
                    db.ref('muted/' + currentUser).remove();
                    isMuted = false;
                }
            } else {
                isMuted = false;
                muteReason = '';
            }
        });
    } catch (error) {
        console.error("Mute status tekshirishda xatolik:", error);
    }
}

// ========== INPUT LISTENERS ==========
function setupInputListeners() {
    const input = document.getElementById('message-input');
    const fileInput = document.getElementById('file-input');
    
    if (input) {
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessageBtn();
            }
        });
    }
    
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelect);
    }
}

// ========== FAYL FUNKSIYALARI ==========
function triggerFileInput() {
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
        fileInput.click();
    }
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
        alert("❌ Fayl hajmi 10MB dan kichik bo'lishi kerak!");
        event.target.value = '';
        return;
    }
    
    selectedFile = file;
    
    const preview = document.getElementById('file-preview');
    const fileName = document.getElementById('file-name');
    
    if (preview && fileName) {
        fileName.textContent = `📄 ${file.name} (${formatFileSize(file.size)})`;
        preview.style.display = 'block';
    }
}

function cancelFile() {
    selectedFile = null;
    const fileInput = document.getElementById('file-input');
    const preview = document.getElementById('file-preview');
    
    if (fileInput) fileInput.value = '';
    if (preview) preview.style.display = 'none';
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// ========== XABAR YUBORISH ==========
function sendMessageBtn() {
    sendMessage();
}

async function sendMessage() {
    if (isProcessing) return;
    
    // Mute tekshiruvi
    if (isMuted) {
        alert(`❌ Siz mute qilingansiz!\nSabab: ${muteReason}`);
        return;
    }
    
    const input = document.getElementById('message-input');
    if (!input) return;
    
    const text = input.value.trim();
    
    if (!text && !selectedFile) return;

    isProcessing = true;
    const sendBtn = document.getElementById('send-button');
    
    try {
        if (text.startsWith("/") && !selectedFile) {
            await handleAdminCommand(text);
            input.value = "";
            return;
        }

        let fileData = null;
        
        if (selectedFile) {
            if (sendBtn) sendBtn.classList.add('uploading');
            fileData = await uploadFile(selectedFile);
            if (sendBtn) sendBtn.classList.remove('uploading');
        }

        const messageData = {
            user: currentUser,
            time: getTime(),
            timestamp: Date.now(),
            role: userRole
        };
        
        if (text) messageData.text = text;
        if (fileData) messageData.file = fileData;

        await db.ref('messages').push(messageData);
        
        input.value = "";
        cancelFile();
        
        setTimeout(() => {
            const chatBox = document.getElementById('chat-messages');
            if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
        }, 100);
        
    } catch (error) {
        console.error("❌ Xabar yuborishda xatolik:", error);
        alert("Xabar yuborilmadi! Qaytadan urinib ko'ring.");
    } finally {
        isProcessing = false;
    }
}

// ========== FAYL YUKLASH ==========
async function uploadFile(file) {
    const timestamp = Date.now();
    const fileName = `${currentUser}_${timestamp}_${file.name}`;
    const storageRef = storage.ref('files/' + fileName);
    
    try {
        const snapshot = await storageRef.put(file);
        const downloadURL = await snapshot.ref.getDownloadURL();
        
        return {
            name: file.name,
            url: downloadURL,
            type: file.type,
            size: file.size
        };
    } catch (error) {
        console.error("Fayl yuklashda xatolik:", error);
        throw error;
    }
}

// ========== ADMIN KOMANDALAR ==========
async function handleAdminCommand(text) {
    const parts = text.split(" ");
    const cmd = parts[0].toLowerCase();
    const target = parts[1] ? parts[1].toLowerCase() : null;
    const value = parts.slice(2).join(" ");

    const isMainAdmin = (currentUser === "vuroxen");
    const isSubAdmin = (userRole === 'subadmin');

    try {
        switch(cmd) {
            // ===== ADMIN VA SUB-ADMIN KOMANDALAR =====
            case "/clear":
                if (isMainAdmin || isSubAdmin) {
                    if (confirm("Barcha xabarlarni o'chirmoqchimisiz?")) {
                        await db.ref('messages').remove();
                        alert("✅ Barcha xabarlar o'chirildi!");
                    }
                } else {
                    alert("❌ Sizda huquq yo'q!");
                }
                break;
                
            case "/pin":
                if (isMainAdmin || isSubAdmin) {
                    const pinMsg = text.replace("/pin ", "").trim();
                    if (pinMsg && pinMsg !== "/pin") {
                        await db.ref('settings/pin').set(pinMsg);
                        alert("✅ Xabar PIN qilindi!");
                    } else {
                        alert("❌ PIN uchun xabar kiriting!");
                    }
                } else {
                    alert("❌ Sizda huquq yo'q!");
                }
                break;
                
            case "/unpin":
                if (isMainAdmin || isSubAdmin) {
                    await db.ref('settings/pin').remove();
                    alert("✅ PIN xabar o'chirildi!");
                } else {
                    alert("❌ Sizda huquq yo'q!");
                }
                break;
                
            case "/alert":
                if (isMainAdmin || isSubAdmin) {
                    const alertMsg = text.replace("/alert ", "").trim();
                    if (alertMsg && alertMsg !== "/alert") {
                        await db.ref('messages').push({ 
                            user: "TIZIM", 
                            text: "📢 " + alertMsg, 
                            type: 'system', 
                            time: getTime(),
                            timestamp: Date.now()
                        });
                        alert("✅ Tizim xabari yuborildi!");
                    }
                } else {
                    alert("❌ Sizda huquq yo'q!");
                }
                break;
            
            case "/users":
                if (isMainAdmin || isSubAdmin) {
                    const usersSnap = await db.ref('users').once('value');
                    const users = [];
                    usersSnap.forEach(child => {
                        const userData = child.val();
                        users.push(`${child.key} (${userData.role || 'user'})`);
                    });
                    alert("👥 Foydalanuvchilar:\n\n" + users.join('\n'));
                } else {
                    alert("❌ Sizda huquq yo'q!");
                }
                break;
                
            case "/mute":
                if (isMainAdmin || isSubAdmin) {
                    // Format: /mute user daqiqa sabab
                    const muteParts = text.split(" ");
                    if (muteParts.length < 4) {
                        alert("❌ Format: /mute [user] [daqiqa] [sabab]");
                        break;
                    }
                    
                    const muteUser = muteParts[1].toLowerCase();
                    const minutes = parseInt(muteParts[2]);
                    const reason = muteParts.slice(3).join(" ");
                    
                    if (!muteUser || isNaN(minutes) || minutes < 1) {
                        alert("❌ Noto'g'ri format!");
                        break;
                    }
                    
                    const until = Date.now() + (minutes * 60000);
                    
                    await db.ref('muted/' + muteUser).set({
                        by: currentUser,
                        reason: reason,
                        until: until,
                        mutedAt: Date.now()
                    });
                    
                    alert(`✅ ${muteUser} ${minutes} daqiqaga mute qilindi!\nSabab: ${reason}`);
                } else {
                    alert("❌ Sizda huquq yo'q!");
                }
                break;
                
            case "/unmute":
                if (isMainAdmin || isSubAdmin) {
                    if (target) {
                        await db.ref('muted/' + target).remove();
                        alert(`✅ ${target} mutesi olib tashlandi!`);
                    }
                } else {
                    alert("❌ Sizda huquq yo'q!");
                }
                break;
                
            case "/kick":
                if (isMainAdmin || isSubAdmin) {
                    if (target) {
                        await db.ref('online/' + target).remove();
                        
                        await db.ref('messages').push({
                            user: "TIZIM",
                            text: `⚠️ ${target} chatdan chiqarildi!`,
                            type: 'system',
                            time: getTime(),
                            timestamp: Date.now()
                        });
                        
                        alert(`✅ ${target} chatdan chiqarildi!`);
                    }
                } else {
                    alert("❌ Sizda huquq yo'q!");
                }
                break;
            
            // ===== FAQAT MAIN ADMIN KOMANDALAR =====
            case "/makeadmin":
                if (isMainAdmin) {
                    if (target) {
                        await db.ref('users/' + target).update({ role: 'subadmin' });
                        alert(`✅ ${target} endi Sub-Admin!`);
                    }
                } else {
                    alert("❌ Faqat asoschi admin bu komandani ishlatishi mumkin!");
                }
                break;
                
            case "/removeadmin":
                if (isMainAdmin) {
                    if (target) {
                        await db.ref('users/' + target).update({ role: 'user' });
                        alert(`✅ ${target} oddiy foydalanuvchiga aylantirildi!`);
                    }
                } else {
                    alert("❌ Faqat asoschi admin bu komandani ishlatishi mumkin!");
                }
                break;
                
            case "/parol":
                if (isMainAdmin) {
                    if (target && value) {
                        const userRef = db.ref('users/' + target);
                        const userSnap = await userRef.once('value');
                        
                        if (userSnap.exists()) {
                            await userRef.update({ password: value });
                            alert(`✅ ${target} ning paroli o'zgartirildi!`);
                        } else {
                            alert(`❌ ${target} topilmadi!`);
                        }
                    } else {
                        alert("❌ Format: /parol [user] [yangi_parol]");
                    }
                } else {
                    alert("❌ Faqat asoschi admin bu komandani ishlatishi mumkin!");
                }
                break;
                
            case "/deluser":
                if (isMainAdmin) {
                    if (target) {
                        if (confirm(`${target} foydalanuvchisini butunlay o'chirmoqchimisiz?`)) {
                            // Foydalanuvchi ma'lumotlarini o'chirish
                            await db.ref('users/' + target).remove();
                            await db.ref('online/' + target).remove();
                            await db.ref('muted/' + target).remove();
                            
                            // Xabarlarni o'chirish (ixtiyoriy)
                            const messagesSnap = await db.ref('messages').once('value');
                            const updates = {};
                            messagesSnap.forEach(child => {
                                if (child.val().user === target) {
                                    updates[child.key] = null;
                                }
                            });
                            if (Object.keys(updates).length > 0) {
                                await db.ref('messages').update(updates);
                            }
                            
                            alert(`✅ ${target} butunlay o'chirildi!`);
                        }
                    } else {
                        alert("❌ Format: /deluser [username]");
                    }
                } else {
                    alert("❌ Faqat asoschi admin bu komandani ishlatishi mumkin!");
                }
                break;
                
            case "/ban":
                if (isMainAdmin) {
                    if (target) {
                        await db.ref('banned/' + target).set(true);
                        await db.ref('online/' + target).remove();
                        alert(`✅ ${target} banlandi!`);
                    }
                } else {
                    alert("❌ Faqat asoschi admin bu komandani ishlatishi mumkin!");
                }
                break;
                
            case "/unban":
                if (isMainAdmin) {
                    if (target) {
                        await db.ref('banned/' + target).remove();
                        alert(`✅ ${target} banidan chiqarildi!`);
                    }
                } else {
                    alert("❌ Faqat asoschi admin bu komandani ishlatishi mumkin!");
                }
                break;
                
            case "/help":
                showHelpMessage();
                break;
                
            default:
                alert("❌ Noma'lum komanda! /help ni ishlatib ko'ring.");
        }
    } catch (error) {
        console.error("Komanda bajarilmadi:", error);
        alert("Xatolik yuz berdi: " + error.message);
    }
}

function showHelpMessage() {
    let helpText = "🔧 MAVJUD KOMANDALAR:\n\n";
    
    if (userRole === 'admin' || currentUser === 'vuroxen') {
        helpText += "👑 ASOSCHI ADMIN:\n";
        helpText += "/makeadmin [user] - Sub-admin qilish\n";
        helpText += "/removeadmin [user] - Adminlikdan olish\n";
        helpText += "/parol [user] [parol] - Parolni o'zgartirish\n";
        helpText += "/deluser [user] - Foydalanuvchini o'chirish\n";
        helpText += "/ban [user] - Ban qilish\n";
        helpText += "/unban [user] - Banini olib tashlash\n\n";
    }
    
    if (userRole === 'subadmin' || userRole === 'admin' || currentUser === 'vuroxen') {
        helpText += "⭐ SUB-ADMIN:\n";
        helpText += "/clear - Xabarlarni tozalash\n";
        helpText += "/pin [xabar] - PIN xabar\n";
        helpText += "/unpin - PIN xabarni olib tashlash\n";
        helpText += "/alert [xabar] - Tizim xabari\n";
        helpText += "/mute [user] [daq] [sabab] - Mute qilish\n";
        helpText += "/unmute [user] - Muteni olib tashlash\n";
        helpText += "/kick [user] - Chatdan chiqarish\n";
        helpText += "/users - Foydalanuvchilar ro'yxati\n";
    }
    
    if (helpText === "🔧 MAVJUD KOMANDALAR:\n\n") {
        helpText = "❌ Sizda admin huquqlari yo'q!";
    }
    
    alert(helpText);
}

// ========== XABARLARNI YUKLASH ==========
function loadMessages() {
    const box = document.getElementById('chat-messages');
    if (!box) return;
    
    db.ref('messages').limitToLast(100).on('child_added', snap => {
        if (document.querySelector(`[data-msg-id="${snap.key}"]`)) {
            return;
        }
        
        const data = snap.val();
        const isMe = data.user === currentUser;
        const isSystem = data.type === 'system';
        const msgRole = data.role || 'user';
        
        const div = document.createElement('div');
        div.className = `msg-box ${isMe ? 'sent' : 'received'} ${isSystem ? 'system-msg' : ''}`;
        div.setAttribute('data-msg-id', snap.key);
        
        let headerHTML = '';
        if (!isSystem) {
            let badge = '';
            if (data.user === 'vuroxen') {
                badge = '<span class="admin-tag">ADMIN</span>';
            } else if (msgRole === 'subadmin') {
                badge = '<span class="subadmin-tag">SUB-ADMIN</span>';
            }
            
            headerHTML = `
                <div class="msg-header">
                    <span>${data.user}</span>
                    ${badge}
                    <span>•</span>
                    <span>${data.time}</span>
                </div>
            `;
        }
        
        let contentHTML = '';
        if (data.text) {
            contentHTML += `<div class="msg-content">${escapeHtml(data.text)}</div>`;
        }
        
        if (data.file) {
            contentHTML += renderFile(data.file);
        }
        
        div.innerHTML = headerHTML + contentHTML;
        
        box.appendChild(div);
        box.scrollTop = box.scrollHeight;
    });

    db.ref('messages').on('value', snapshot => { 
        if (!snapshot.exists()) {
            box.innerHTML = '<div style="text-align:center; opacity:0.5; margin-top:40px; font-size:1.1rem;">💬<br><br>Hozircha xabarlar yo\'q</div>';
        }
    });
}

// ========== FAYL RENDER ==========
function renderFile(file) {
    if (!file || !file.url) return '';
    
    if (file.type && file.type.startsWith('image/')) {
        return `<img src="${file.url}" class="msg-image" alt="${escapeHtml(file.name)}" onclick="window.open('${file.url}', '_blank')">`;
    }
    
    if (file.type && file.type.startsWith('audio/')) {
        return `<audio controls class="msg-audio"><source src="${file.url}" type="${file.type}"></audio>`;
    }
    
    if (file.type && file.type.startsWith('video/')) {
        return `<video controls class="msg-video"><source src="${file.url}" type="${file.type}"></video>`;
    }
    
    return `<a href="${file.url}" target="_blank" class="msg-file">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
            <polyline points="13 2 13 9 20 9"></polyline>
        </svg>
        ${escapeHtml(file.name)}
    </a>`;
}

// ========== ONLINE TRACKING ==========
function trackOnline() {
    if (!currentUser) return;
    
    const ref = db.ref('online/' + currentUser);
    ref.set(true);
    ref.onDisconnect().remove();
    
    db.ref('online').on('value', snapshot => {
        const count = snapshot.numChildren();
        const elements = document.querySelectorAll('.online-count');
        elements.forEach(el => {
            el.innerText = count;
        });
    });
}

// ========== PIN XABAR ==========
function syncPin() {
    db.ref('settings/pin').on('value', snapshot => {
        const pinBar = document.getElementById('pin-bar');
        const pinText = document.getElementById('pin-text');
        
        if (snapshot.exists() && snapshot.val()) {
            const pinValue = snapshot.val();
            if (pinBar) pinBar.style.display = "flex";
            if (pinText) pinText.innerText = pinValue;
        } else {
            if (pinBar) pinBar.style.display = "none";
            if (pinText) pinText.innerText = "";
        }
    });
}

// ========== FOYDALANUVCHI DARAJASI ==========
function updateRankDisplay() {
    const rankEl = document.getElementById('user-rank');
    if (!rankEl) return;
    
    if (currentUser === "vuroxen") {
        rankEl.innerText = "Asoschi / Admin";
    } else if (userRole === "subadmin") {
        rankEl.innerText = "Sub-Admin";
    } else {
        rankEl.innerText = "Foydalanuvchi";
    }
}

// ========== YORDAMCHI FUNKSIYALAR ==========
function getTime() { 
    return new Date().toLocaleTimeString('uz-UZ', { 
        hour: '2-digit', 
        minute: '2-digit' 
    }); 
}

function logout() { 
    if (confirm("Chiqishni xohlaysizmi?")) {
        if (localStorage.getItem('auth_method') === 'google') {
            auth.signOut();
        }
        
        if (currentUser) {
            db.ref('online/' + currentUser).remove();
        }
        
        localStorage.removeItem('chat_user');
        localStorage.removeItem('auth_method');
        
        location.reload();
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

console.log("✅ Vuroxen Chat yuklandi!");
