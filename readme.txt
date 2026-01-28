VUROXEN CHAT - TO'LIQ XUSUSIYATLAR VA KO'RSATMALAR
====================================================

📦 KERAKLI FAYLLAR:
1. index.html
2. style.css  
3. script.js
4. image.jpg (fon rasmi)

✨ YANGI FUNKSIYALAR (TUZATILDI):

✅ PIN xabar null muammosi tuzatildi
✅ Sub-admin xabarlari to'g'ri tomonda (o'ngda) ko'rsatiladi
✅ /deluser to'liq ishlaydi (foydalanuvchi va xabarlarni o'chiradi)
✅ /unpin funksiyasi qo'shildi
✅ /mute funksiyasi qo'shildi (vaqt va sabab bilan)
✅ /unmute funksiyasi qo'shildi
✅ /kick funksiyasi qo'shildi

🔧 BARCHA ADMIN KOMANDALAR:

┌─────────────────────────────────────────────────────────────┐
│ 👑 ASOSCHI ADMIN (faqat vuroxen):                           │
├─────────────────────────────────────────────────────────────┤
│ /makeadmin [user]          - Sub-admin qilish               │
│ /removeadmin [user]        - Adminlikdan olish              │
│ /parol [user] [parol]      - Parolni o'zgartirish          │
│ /deluser [user]            - Foydalanuvchini o'chirish      │
│ /ban [user]                - Ban qilish                     │
│ /unban [user]              - Banini olib tashlash           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ⭐ SUB-ADMIN (va Admin):                                     │
├─────────────────────────────────────────────────────────────┤
│ /clear                     - Barcha xabarlarni tozalash     │
│ /pin [xabar]               - Xabarni PIN qilish             │
│ /unpin                     - PIN xabarni olib tashlash      │
│ /alert [xabar]             - Tizim xabari yuborish          │
│ /mute [user] [daq] [sabab] - Foydalanuvchini mute qilish   │
│ /unmute [user]             - Muteni olib tashlash           │
│ /kick [user]               - Chatdan chiqarish              │
│ /users                     - Foydalanuvchilar ro'yxati      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 📖 UMUMIY:                                                   │
├─────────────────────────────────────────────────────────────┤
│ /help                      - Mavjud komandalarni ko'rish    │
└─────────────────────────────────────────────────────────────┘

📝 FUNKSIYALAR TAFSILOTI:

1. /MUTE - Foydalanuvchini mute qilish
   Format: /mute [username] [daqiqa] [sabab]
   Misol: /mute alijon 30 Spam qildi
   
   - Foydalanuvchi ko'rsatilgan vaqt davomida xabar yoza olmaydi
   - Mute sababi foydalanuvchiga ko'rsatiladi
   - Vaqt o'tgach avtomatik mute olinadi

2. /UNMUTE - Muteni olib tashlash
   Format: /unmute [username]
   Misol: /unmute alijon

3. /KICK - Chatdan chiqarish
   Format: /kick [username]
   Misol: /kick spammer
   
   - Foydalanuvchi online holatidan chiqariladi
   - Qaytadan kirishi mumkin

4. /UNPIN - PIN xabarni olib tashlash
   Format: /unpin
   
   - PIN xabar butunlay o'chiriladi
   - Hech qanday parametr kerak emas

5. /DELUSER - Foydalanuvchini butunlay o'chirish
   Format: /deluser [username]
   Misol: /deluser baduser
   
   - Foydalanuvchi ma'lumotlari o'chiriladi
   - Barcha xabarlari o'chiriladi
   - Online holatidan chiqariladi
   - Mute ma'lumotlari o'chiriladi

🛡️ XAVFSIZLIK XUSUSIYATLARI:

✅ Mute qilingan foydalanuvchilar xabar yoza olmaydi
✅ Mute sababi foydalanuvchiga ko'rsatiladi
✅ Ban qilingan foydalanuvchilar kirish imkoniyatiga ega emas
✅ Google Auth orqali xavfsiz kirish
✅ Sub-adminlar asoschi admin funksiyalarini ishlatishi mumkin emas

📊 DATABASE STRUKTURA:

users/
  └─ username/
      ├─ password
      ├─ role: "user" | "subadmin" | "admin"
      ├─ joined: timestamp
      └─ lastLogin: timestamp

messages/
  └─ messageId/
      ├─ user: username
      ├─ text: xabar
      ├─ role: user role
      └─ timestamp: timestamp

muted/
  └─ username/
      ├─ by: admin username
      ├─ reason: sabab
      ├─ until: tugash vaqti
      └─ mutedAt: boshlangan vaqt

banned/
  └─ username: true

online/
  └─ username: true

settings/
  └─ pin: PIN xabar matni

🎯 MISOLLAR:

1. Sub-admin qilish:
   /makeadmin alijon

2. Mute qilish:
   /mute baduser 60 Haqorat qildi
   (60 daqiqaga mute)

3. PIN xabar:
   /pin Eslatma: Chat qoidalariga rioya qiling!

4. PIN xabarni olib tashlash:
   /unpin

5. Chatdan chiqarish:
   /kick spammer

6. Muteni olib tashlash:
   /unmute alijon

7. Foydalanuvchini o'chirish:
   /deluser baduser

🔍 TUZATILGAN XATOLAR:

✅ PIN xabar "null" ko'rsatgan xato tuzatildi
✅ Sub-admin xabarlari chap tomonda emas, o'ngda ko'rsatiladi
✅ /deluser butunlay ishlaydi
✅ Xabar word-wrap to'g'ri ishlaydi
✅ Online sanash to'g'ri ishlaydi
✅ Google Auth real ishlaydi

⚠️ MUHIM ESLATMALAR:

1. Mute vaqti daqiqalarda beriladi
2. /deluser qaytarib bo'lmaydigan amal
3. Sub-adminlar bir-birlarini ban/mute qila olmaydi
4. Asoschi admin (vuroxen) o'zini ban/mute qila olmaydi
5. Mute qilinganlar admin komandalarini ishlatishi mumkin

📱 QO'LLAB-QUVVATLASH:

- Barcha zamonaviy brauzerlar
- Mobil qurilmalar
- Planshetlar

✅ TAYYOR! Savol bo'lsa /help yozing!

© 2026 Vuroxen Chat - Barcha huquqlar himoyalangan