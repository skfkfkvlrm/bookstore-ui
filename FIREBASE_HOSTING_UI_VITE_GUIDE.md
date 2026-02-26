# Day-by-Spring React Vite Firebase Hosting 가이드

기준:
- GCP/Firebase 프로젝트: `spring-book-store-488423`
- 로컬 백엔드: `http://localhost:8080`
- 운영 백엔드(Cloud Run): `https://day-by-spring-823460860566.asia-northeast3.run.app`

## 1. 사전 준비

```bash
node -v
npm -v
firebase --version
```

Firebase CLI 없으면:

```bash
npm i -g firebase-tools
```

## 2. Firebase 프로젝트 연결

```bash
firebase login
firebase use --add
```

선택:
- project: `spring-book-store-488423`
- alias: `prod`

확인:

```bash
firebase use
```

## 3. React Vite 환경변수 분리

개발용 `.env.local`:

```bash
VITE_API_BASE_URL=http://localhost:8080
```

운영용 `.env.production`:

```bash
VITE_API_BASE_URL=https://day-by-spring-823460860566.asia-northeast3.run.app
```

사용 코드 예시:

```ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
```

## 4. 로컬 개발 CORS 회피 (Vite 프록시)

`vite.config.ts` 예시:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true
      }
    }
  }
});
```

프론트 호출 예시:

```ts
fetch("/api/books");
```

## 5. Firebase Hosting 초기화

```bash
firebase init hosting
```

권장 선택:
- `Use an existing project`: Yes
- Project: `spring-book-store-488423`
- Public directory: `dist`
- SPA 설정: Yes

## 6. 운영 기본안 (현재)

현재는 UI가 Cloud Run API를 직접 호출하는 방식을 기본으로 사용합니다.

- UI: Firebase Hosting
- API: Cloud Run 공개 URL 직접 호출
- 예: `VITE_API_BASE_URL=https://day-by-spring-823460860566.asia-northeast3.run.app`

## 7. 향후 고려사항: Hosting rewrite(`/api/**`)

필요 시 아래 방식으로 전환 검토:
- 브라우저는 `/api/**` 상대경로 호출
- Firebase Hosting이 Cloud Run으로 프록시 전달

장점:
- CORS 설정 단순화
- 프론트 코드에서 백엔드 원본 URL 노출 완화

주의:
- Cloud Run이 공개 상태면 직접 URL 호출 자체는 가능
- 요청 비용은 Hosting + Cloud Run 모두 발생

검토용 `firebase.json` 예시:

```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "/api/**",
        "run": {
          "serviceId": "day-by-spring",
          "region": "asia-northeast3"
        }
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

## 8. 빌드/배포

```bash
npm ci
npm run build
firebase use prod
firebase deploy --only hosting
```

## 9. 빠른 점검

- UI 접속 확인
- 로그인/회원가입 API 호출 확인
- 브라우저 콘솔 CORS 에러 없는지 확인
