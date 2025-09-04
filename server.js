// server.js
const express = require('express');
const cors = require('cors');
const body = require('body-parser');
const jwt = require('jsonwebtoken');
const os = require('os');

const app = express();
app.use(cors());
app.use(body.json());

// --- 바인드 대상: 모든 인터페이스(LAN 포함) ---
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// 현재 머신의 LAN IP 구하기(로그용)
function getLocalIp() {
  const ifs = os.networkInterfaces();
  for (const name of Object.keys(ifs)) {
    for (const i of ifs[name] || []) {
      if (i.family === 'IPv4' && !i.internal) return i.address; // 192.168.x.x 등
    }
  }
  return '127.0.0.1';
}

// ---------------- 이하 API 그대로 ----------------
const SECRET = 'dev-secret';
const users = [];
const sessions = new Set();

// (생략 없이 너가 쓰던 라우트들 그대로…) 
// 예시로 하나만:
app.get('/api/users/check-email', (req, res) => {
  const email = req.query.email;
  const taken = users.some(u => u.email === email);
  res.json({ available: !taken, message: taken ? '이미 사용 중' : '사용 가능' });
});

// ... (나머지 signup/login/logout/find-id/find-password/change-password/verify-phone 라우트)

app.listen(PORT, HOST, () => {
  const lan = getLocalIp();
  console.log('Mock API listening:');
  console.log(`  Local:   http://127.0.0.1:${PORT}`);
  console.log(`  LAN:     http://${lan}:${PORT}`);        // ← 폰/다른 기기에서 접속할 주소
  console.log(`  Public:  (원하면 localtunnel/cloudflared)`);
});