VUROXEN CHAT - TO'LIQ O'RNATISH KO'RSATMALARI
==============================================

📦 KERAKLI FAYLLAR:
1. index.html
2. style.css  
3. script.js
4. image.jpg (fon rasmi)

🚀 O'RNATISH:

1. Yangi papka yarating (masalan: vuroxen-chat)

2. Barcha fayllarni shu papkaga joylashtiring:
   vuroxen-chat/
   ├── index.html
   ├── style.css
   ├── script.js
   └── image.jpg

3. Fon rasmini qo'shish:
   - Yuklagan rasmingizni "image.jpg" deb nomlang
   - Chat papkasiga joylashtiring
   
4. index.html faylini brauzerda oching

5. Google Auth sozlash (ixtiyoriy):
   - Firebase Console ga kiring
   - Authentication > Sign-in method
   - Google'ni yoqing

✨ XUSUSIYATLAR:
- ✅ Google orqali kirish (real ishlaydi)
- ✅ Parol bilan kirish
- ✅ Real-time xabar almashish
- ✅ Uzun xabarlar to'g'ri ko'rsatiladi (word-wrap)
- ✅ Rasm, audio, video yuklash
- ✅ Admin va Sub-Admin tizimi
- ✅ Online foydalanuvchilar
- ✅ PIN xabarlar

👥 FOYDALANUVCHI DARAJALARI:

1. 👤 ODDIY FOYDALANUVCHI:
   - Xabar yuborish
   - Fayl yuborish
   - Online ko'rish

2. ⭐ SUB-ADMIN:
   - Barcha oddiy funksiyalar
   - /clear - Xabarlarni tozalash
   - /pin [xabar] - PIN xabar
   - /alert [xabar] - Tizim xabari
   - /users - Foydalanuvchilar ro'yxati
   - /help - Yordam

3. 👑 ASOSCHI ADMIN (vuroxen):
   - Barcha sub-admin funksiyalari
   - /makeadmin [user] - Sub-admin qilish
   - /removeadmin [user] - Adminlikdan olish
   - /parol [user] [parol] - Parolni o'zgartirish
   - /deluser [user] - Foydalanuvchini o'chirish
   - /ban [user] - Ban qilish
   - /unban [user] - Banini olib tashlash

🔧 ADMIN KOMANDALAR:

ASOSCHI ADMIN KOMANDALAR:
/makeadmin [username] - Foydalanuvchini Sub-Admin qilish
/removeadmin [username] - Sub-Admin huquqini olish
/parol [username] [yangi_parol] - Parolni o'zgartirish
/deluser [username] - Foydalanuvchini butunlay o'chirish
/ban [username] - Foydalanuvchini ban qilish
/unban [username] - Banini olib tashlash

SUB-ADMIN KOMANDALAR:
/clear - Barcha xabarlarni tozalash
/pin [xabar] - Xabarni yuqoriga PIN qilish (bo'sh qoldiring olib tashlash uchun)
/alert [xabar] - Tizim xabari yuborish
/users - Barcha foydalanuvchilar ro'yxati

UMUMIY:
/help - Mavjud komandalarni ko'rish

📝 MUHIM ESLATMALAR:

1. Google Auth:
   - Firebase Console'da Google Auth yoqilgan bo'lishi kerak
   - authDomain to'g'ri sozlangan bo'lishi kerak
   - Popup blocker o'chirilgan bo'lishi kerak

2. Xabar Word-Wrap:
   - Uzun xabarlar avtomatik ravishda yangi qatorga o'tadi
   - Emoji va maxsus belgilar to'g'ri ko'rsatiladi
   - URL'lar avtomatik ajratiladi

3. Sub-Admin tizimi:
   - Faqat asoschi admin (vuroxen) boshqa adminlar tayinlashi mumkin
   - Sub-adminlar foydalanuvchilarni ban qila olmaydi
   - Sub-adminlar boshqa adminlar tayinlay olmaydi

4. Xavfsizlik:
   - Google Auth Google serverlari orqali amalga oshiriladi
   - Parollar Firebase'da saqlanadi
   - Ban qilingan foydalanuvchilar kirish imkoniyatiga ega emas

🆘 MUAMMOLARNI HAL QILISH:

1. Google kirish ishlamayotgan bo'lsa:
   - Popup blocker tekshiring
   - Firebase Console'da Google Auth yoqilganligini tekshiring
   - Browser console'da xatolarni tekshiring

2. Xabarlar ko'rinmayotgan bo'lsa:
   - Internet aloqasini tekshiring
   - Firebase Database Rules tekshiring
   - Browser console'da xatolarni tekshiring

3. Fon rasmi ko'rinmayotgan bo'lsa:
   - image.jpg fayli to'g'ri joyda ekanligini tekshiring
   - Fayl nomi to'g'ri yozilganligini tekshiring
   - Browser cache'ni tozalang

4. Admin komandalar ishlamayotgan bo'lsa:
   - Foydalanuvchi nomingiz to'g'ri ekanligini tekshiring
   - Role database'da to'g'ri o'rnatilganligini tekshiring

📊 DATABASE STRUKTURA:

users/
  └─ username/
      ├─ password (agar parol bilan kirilgan bo'lsa)
      ├─ email (agar Google orqali kirilgan bo'lsa)
      ├─ role: "user" | "subadmin" | "admin"
      ├─ joined: timestamp
      └─ lastLogin: timestamp

messages/
  └─ messageId/
      ├─ user: username
      ├─ text: xabar matni
      ├─ role: user role
      ├─ time: vaqt
      ├─ timestamp: timestamp
      └─ file: {} (agar fayl bo'lsa)

banned/
  └─ username: true

online/
  └─ username: true

settings/
  └─ pin: PIN xabar matni

✅ TAYYOR! Savollar bo'lsa, /help komandasi yordamida yordam oling!

© 2026 Vuroxen Chat - Barcha huquqlar himoyalangan
