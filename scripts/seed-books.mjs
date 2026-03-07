/**
 * 네이버 도서 검색 API를 이용한 도서 초기 데이터 등록 스크립트
 *
 * 실행: npm run seed
 * 전제 조건: Spring Boot 백엔드(localhost:8080)가 실행 중이어야 한다.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// .env 파일 파싱
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  const content = fs.readFileSync(envPath, 'utf-8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx < 0) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    env[key] = value;
  }
  return env;
}

const env = loadEnv();
const NAVER_CLIENT_ID = env.NAVER_CLIENT_ID;
const NAVER_CLIENT_SECRET = env.NAVER_CLIENT_SECRET;
const ADMIN_EMAIL = env.ADMIN_EMAIL;
const ADMIN_PASSWORD = env.ADMIN_PASSWORD;
const API_BASE = env.API_BASE_URL || 'http://localhost:8080';
const TARGET_COUNT = 1000;

// IT/개발 관련 검색 키워드
const KEYWORDS = [
  '프로그래밍', '알고리즘', '자바', '파이썬', '리액트',
  '스프링', '데이터베이스', '인공지능', '클라우드', '네트워크',
  '운영체제', '보안', '자바스크립트', '타입스크립트', '도커',
  '머신러닝', '딥러닝', '소프트웨어공학', '컴퓨터과학', '데이터분석',
];

function stripHtml(str = '') {
  return str.replace(/<[^>]*>/g, '').trim();
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function searchNaverBooks(keyword, start = 1) {
  const url = `https://openapi.naver.com/v1/search/book.json?query=${encodeURIComponent(keyword)}&display=100&start=${start}`;
  const res = await fetch(url, {
    headers: {
      'X-Naver-Client-Id': NAVER_CLIENT_ID,
      'X-Naver-Client-Secret': NAVER_CLIENT_SECRET,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`네이버 API 오류 ${res.status}: ${text}`);
  }
  const data = await res.json();
  return data.items || [];
}

async function loginAdmin() {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`관리자 로그인 실패 ${res.status}: ${text}`);
  }
  const data = await res.json();
  return data.accessToken;
}

async function createBook(book, token) {
  const res = await fetch(`${API_BASE}/api/books`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(book),
  });
  return { ok: res.ok, status: res.status };
}

async function main() {
  console.log('📚 도서 시드 스크립트 시작\n');

  // 1. 관리자 로그인
  console.log('🔐 관리자 로그인 중...');
  const token = await loginAdmin();
  console.log('✅ 로그인 성공\n');

  // 2. 네이버 API로 도서 수집
  console.log(`🔍 네이버 도서 검색 중... (목표: ${TARGET_COUNT}권)\n`);
  const bookMap = new Map(); // isbn → book

  for (const keyword of KEYWORDS) {
    if (bookMap.size >= TARGET_COUNT) break;

    try {
      // 키워드당 최대 200건 (start=1, start=101 두 번)
      for (const start of [1, 101]) {
        if (bookMap.size >= TARGET_COUNT) break;

        const items = await searchNaverBooks(keyword, start);
        if (items.length === 0) break;

        for (const item of items) {
          // ISBN: 스페이스로 구분된 경우 13자리 우선
          const isbnRaw = item.isbn || '';
          const isbn = isbnRaw.split(' ').find((s) => s.length === 13)
            || isbnRaw.split(' ').find((s) => s.length >= 10)
            || '';
          if (!isbn) continue;
          if (bookMap.has(isbn)) continue;

          const price = parseInt(item.discount || item.price || '0', 10);
          if (!price || price <= 0) continue;

          const title = stripHtml(item.title);
          const author = stripHtml(item.author);
          if (!title || !author) continue;

          bookMap.set(isbn, {
            title,
            author,
            isbn,
            price,
            available: true,
            coverImageUrl: item.image || '',
          });
        }

        await sleep(150); // 요청 간격
      }

      console.log(`  ✔ "${keyword}" → 누적 ${bookMap.size}권`);
    } catch (e) {
      console.error(`  ✘ "${keyword}" 검색 실패: ${e.message}`);
    }
  }

  const books = [...bookMap.values()];
  console.log(`\n📦 수집 완료: ${books.length}권 → 백엔드 등록 시작\n`);

  // 3. 백엔드에 등록
  let success = 0;
  let duplicate = 0;
  let fail = 0;

  for (const book of books) {
    const { ok, status } = await createBook(book, token);
    if (ok) {
      success++;
    } else if (status === 409) {
      duplicate++; // ISBN 중복
    } else {
      fail++;
    }

    if ((success + duplicate + fail) % 100 === 0) {
      console.log(`  📖 진행: 등록 ${success} / 중복 ${duplicate} / 실패 ${fail}`);
    }

    await sleep(80); // 요청 간격
  }

  console.log('\n=============================');
  console.log(`✅ 등록 성공: ${success}권`);
  console.log(`⏭  ISBN 중복 스킵: ${duplicate}권`);
  console.log(`❌ 실패: ${fail}권`);
  console.log('=============================\n');
}

main().catch((e) => {
  console.error('❌ 오류 발생:', e.message);
  process.exit(1);
});
