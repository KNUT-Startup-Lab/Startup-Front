// server.js
// DormHub 더미(목업) API 서버 - 명세 기반 구현
// 실행: npm i express cors && node server.js
// 주의: 실기기 테스트 시 BASE_URL = "http://<내IP>:3000"

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// ====== 기본 미들웨어 ======
app.use(cors());
app.use(express.json());

// 모든 응답을 JSON으로 강제 (HTML 404 방지)
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// ====== 인메모리 "DB"(재실행 시 초기화) ======
/**
 * users: {
 *   id, role: 'student'|'admin',
 *   email, password, name, phone, student_num,
 *   createdAt
 * }
 */
const users = [];
/** phoneCodes: { phone -> { code, expiresAt } } */
const phoneCodes = new Map();
/** refreshTokens: { token -> userId } */
const refreshTokens = new Map();

// 샘플 유저
seed();
function seed() {
  if (users.length) return;
  users.push({
    id: 'u_1',
    role: 'student',
    email: 'test@test.com',
    password: '1234',
    name: '카리나',
    phone: '01012345678',
    student_num: 'A-204',
    createdAt: new Date().toISOString(),
  });
}

const ok = (res, data = {}, code = 200) => res.status(code).json(data);
const bad = (res, message = '잘못된 요청입니다.', code = 400) =>
  res.status(code).json({ message });

const uid = () => crypto.randomBytes(8).toString('hex');
const signToken = () => crypto.randomBytes(16).toString('hex');

// 간단 인증 미들웨어 (Bearer 토큰 검사 흉내)
function authRequired(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return bad(res, '인증 토큰이 없습니다.', 401);

  // 여기선 accessToken 자체를 userId처럼 취급(목업)
  // 실제로는 JWT 검증 필요
  const user = users.find(u => u.id === token || u.accessToken === token);
  if (!user) return bad(res, '유효하지 않은 토큰입니다.', 401);

  req.user = user;
  next();
}

// ====== 유틸 ======
function findUserByEmail(email) {
  return users.find(u => u.email.toLowerCase() === String(email).toLowerCase());
}
function findUserByPhone(phone) {
  return users.find(u => u.phone === phone);
}

// ====== Health 체크 ======
app.get('/health', (req, res) => ok(res, { ok: true, time: new Date().toISOString() }));

// ====== API: 회원가입 ======
// POST /api/users
// { email, password, name, phone, student_num, role? }
app.post('/api/users', (req, res) => {
  const { email, password, name, phone, student_num, role } = req.body || {};
  if (!email || !password || !name || !phone || !student_num) {
    return bad(res, '필수 항목(email, password, name, phone, student_num)이 필요합니다.');
  }
  if (findUserByEmail(email)) {
    return bad(res, '이미 사용 중인 이메일입니다.', 409);
  }
  const id = 'u_' + uid();
  users.push({
    id,
    role: role === 'admin' ? 'admin' : 'student',
    email,
    password,
    name,
    phone,
    student_num,
    createdAt: new Date().toISOString(),
  });
  return ok(res, { message: '회원가입 성공' }, 201);
});

// ====== API: 로그인 ======
// POST /api/auth/login
// { email, password } -> { user_id, email, accessToken, refreshToken, message }
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return bad(res, '이메일과 비밀번호를 입력하세요.');
  const user = findUserByEmail(email);
  if (!user || user.password !== password) {
    return bad(res, '이메일 또는 비밀번호가 잘못되었습니다.', 401);
  }
  const accessToken = user.id; // 목업: 간단히 userId를 accessToken처럼 사용
  const refreshToken = 'rt_' + signToken();
  refreshTokens.set(refreshToken, user.id);
  user.accessToken = accessToken;

  return ok(res, {
    user_id: user.id,
    email: user.email,
    accessToken,
    refreshToken,
    message: '로그인 성공',
  });
});

// ====== API: 로그아웃 ======
// POST /api/auth/logout -> { message }
app.post('/api/auth/logout', authRequired, (req, res) => {
  // refresh 토큰 제거 정도만(목업)
  for (const [rt, uid] of refreshTokens) {
    if (uid === req.user.id) refreshTokens.delete(rt);
  }
  delete req.user.accessToken;
  return ok(res, { message: '로그아웃 성공' });
});

// ====== API: 아이디(이메일) 찾기 ======
// POST /api/users/find-email { name, phone } -> { email, message }
app.post('/api/users/find-email', (req, res) => {
  const { name, phone } = req.body || {};
  if (!name || !phone) return bad(res, '이름과 전화번호가 필요합니다.');
  const user = findUserByPhone(phone);
  if (!user || user.name !== name) return bad(res, '일치하는 사용자를 찾을 수 없습니다.', 404);
  return ok(res, { email: user.email, message: '아이디 찾기 성공' });
});

// ====== API: 비밀번호 찾기(임시 비번 발송 시뮬레이션) ======
// POST /api/users/find-password { email, phone } -> { message }
app.post('/api/users/find-password', (req, res) => {
  const { email, phone } = req.body || {};
  const user = findUserByEmail(email);
  if (!user || user.phone !== phone) {
    return bad(res, '사용자 정보가 일치하지 않습니다.', 404);
  }
  // 실제로는 SMS/메일 발송; 여기선 콘솔 출력
  const temp = 'tmp_' + Math.floor(100000 + Math.random() * 900000);
  user.password = temp;
  console.log('[임시 비밀번호 발급]', email, temp);
  return ok(res, { message: '임시 비밀번호 발송 완료' });
});

// ====== API: 비밀번호 변경 ======
// PUT /api/users/password { current_password, new_password } (auth)
app.put('/api/users/password', authRequired, (req, res) => {
  const { current_password, new_password } = req.body || {};
  if (!current_password || !new_password) {
    return bad(res, '현재 비밀번호와 새 비밀번호를 입력하세요.');
  }
  if (req.user.password !== current_password) {
    return bad(res, '현재 비밀번호가 올바르지 않습니다.', 400);
  }
  req.user.password = new_password;
  return ok(res, { message: '비밀번호 변경 성공' });
});

// ====== API: 이메일 중복 확인 ======
// GET /api/users/check-email?email=...
app.get('/api/users/check-email', (req, res) => {
  const email = req.query.email;
  if (!email) return bad(res, 'email 쿼리 파라미터가 필요합니다.');
  const exists = !!findUserByEmail(email);
  return ok(res, {
    available: !exists,
    message: exists ? '이미 사용 중인 이메일' : '사용 가능한 이메일',
  });
});

// ====== API: 휴대폰 인증 코드 검증(시뮬레이션) ======
// 1) 코드 요청(시뮬) - 실제 SMS 발송 대신 콘솔로 표시
app.post('/api/auth/request-phone', (req, res) => {
  const { phone } = req.body || {};
  if (!phone) return bad(res, 'phone 이 필요합니다.');
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = Date.now() + 3 * 60 * 1000; // 3분
  phoneCodes.set(phone, { code, expiresAt });
  console.log(`[SMS 전송 시뮬] ${phone} -> 인증코드 ${code}`);
  return ok(res, { message: '인증 코드 발송 완료' });
});

// 2) 코드 검증
// POST /api/auth/verify-phone { phone, verification_code } -> { verified: boolean, message }
app.post('/api/auth/verify-phone', (req, res) => {
  const { phone, verification_code } = req.body || {};
  const entry = phoneCodes.get(phone);
  if (!entry) return ok(res, { verified: false, message: '코드를 요청한 내역이 없습니다.' });
  if (Date.now() > entry.expiresAt) {
    phoneCodes.delete(phone);
    return ok(res, { verified: false, message: '코드 유효시간이 지났습니다.' });
  }
  if (entry.code !== verification_code) {
    return ok(res, { verified: false, message: '코드가 일치하지 않습니다.' });
  }
  phoneCodes.delete(phone);
  return ok(res, { verified: true, message: '인증 성공' });
});

// ====== 404 & 에러 핸들러(JSON 고정) ======
app.use((req, res) => res.status(404).json({ message: 'Not Found' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal Server Error' });
});

// ====== 서버 시작 ======
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ API server running at http://0.0.0.0:${PORT}`);
  console.log(`   실기기 접속: http://<내IP>:${PORT}  (예: http://192.168.0.36:${PORT})`);
});