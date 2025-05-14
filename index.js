const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL ulanish
const db = mysql.createConnection({
    host: 'sql7.freesqldatabase.com',
    user: 'sql7778590',
    password: '6RA9qkP8tJ',
    database: 'sql7778590',
    port: 3306
});

// Ulanishni tekshirish
db.connect((err) => {
    if (err) {
        console.error('❌ MySQL ulanishda xatolik:', err);
        process.exit(1);
    }
    console.log('✅ MySQLga muvaffaqiyatli ulandi');
});

// ✅ POST /signup — Ro‘yxatdan o‘tish
app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Barcha maydonlar to‘ldirilishi kerak' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)';

        db.query(query, [username, email, hashedPassword], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ message: 'Username yoki email allaqachon mavjud' });
                }
                return res.status(500).json({ message: 'Saqlashda xatolik' });
            }
            res.status(201).json({ message: 'Foydalanuvchi muvaffaqiyatli ro‘yxatdan o‘tdi' });
        });
    } catch (err) {
        res.status(500).json({ message: 'Serverda xatolik yuz berdi' });
    }
});

// ✅ POST /login — Kirish
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username va parol kerak' });
    }

    const query = 'SELECT * FROM users WHERE username = ?';

    db.query(query, [username], async (err, results) => {
        if (err) return res.status(500).json({ message: 'Server xatoligi' });

        if (results.length === 0) {
            return res.status(401).json({ message: 'Foydalanuvchi topilmadi' });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Parol noto‘g‘ri' });
        }

        res.json({
            message: 'Tizimga muvaffaqiyatli kirdingiz',
            user: { id: user.id, username: user.username }
        });
    });
});

// ✅ Test route — foydali bo‘ladi
app.get('/', (req, res) => {
    res.send('✅ JobHub server online ishlayapti!');
});

// 🔊 Serverni ishga tushirish
app.listen(port, () => {
    console.log(`🚀 Server online: http://localhost:${port}`);
});
