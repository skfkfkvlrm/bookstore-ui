# Admin AI Prompt Guide

아래 프롬프트를 AI에게 그대로 전달해 사용하세요.

```text
당신은 React + TypeScript + Tailwind 기반의 시니어 프론트엔드 엔지니어다.
목표는 “기존 admin 디자인 톤을 유지”하면서, admin UI를 컬러 시스템/레이어 가이드 기반으로 정리하는 것이다.

[반드시 먼저 읽을 파일]
- /Users/jwon/VsCodeProjects/day_by_spring_sm_ui/src/admin/layout/Layout.tsx
- /Users/jwon/VsCodeProjects/day_by_spring_sm_ui/src/admin/layout/Sidebar.tsx
- /Users/jwon/VsCodeProjects/day_by_spring_sm_ui/src/admin/layout/Header.tsx
- /Users/jwon/VsCodeProjects/day_by_spring_sm_ui/src/admin/pages/Dashboard.tsx
- /Users/jwon/VsCodeProjects/day_by_spring_sm_ui/src/shared/components/common/Button.tsx
- /Users/jwon/VsCodeProjects/day_by_spring_sm_ui/src/shared/components/common/Badge.tsx
- /Users/jwon/VsCodeProjects/day_by_spring_sm_ui/src/shared/components/common/StatCard.tsx
- /Users/jwon/VsCodeProjects/day_by_spring_sm_ui/src/shared/components/common/Table.tsx
- /Users/jwon/VsCodeProjects/day_by_spring_sm_ui/src/index.css
- /Users/jwon/VsCodeProjects/day_by_spring_sm_ui/tailwind.config.js

[현재 디자인 기준(유지 대상)]
- Primary 핵심색: #2f9e5f
- Light 배경: gray-100 / white
- Dark 배경: #101922 / #1a2632
- Border: gray-200 / gray-700
- Text: gray-900, gray-600, gray-400 계열
- 구현 방식: Tailwind 유틸리티 + 일부 hex 하드코딩 혼합
- 요구사항: 기존 화면 인상(톤/밀도/정보배치)은 유지, 급격한 리디자인 금지

[작업 목표]
1) Admin 전용 디자인 토큰 정의
2) 컬러 시스템(상태 포함) 정리
3) 레이어 가이드(z-index, shadow, radius, border) 정리
4) 공용 컴포넌트(Button/Badge/Table/StatCard/Filter 계열)에 토큰 적용
5) admin layout(Header/Sidebar/Main) 일관성 확보
6) 접근성(contrast, focus-visible) 강화

[구현 규칙]
- TypeScript strict, 2-space indent, double quotes
- Tailwind 우선, 필요 시 src/index.css에 CSS 변수 추가
- 새 라이브러리 추가 금지
- 다크모드 클래스 패턴 유지
- 하드코딩 hex를 토큰으로 치환하되, 기존 톤과 유사해야 함

[컬러 시스템 명세(반드시 산출)]
- Brand:
  - --color-brand-50 ~ 900 (기준색 #2f9e5f 중심)
- Neutral:
  - --color-bg-page, --color-bg-surface, --color-bg-elevated
  - --color-text-primary, --color-text-secondary, --color-text-muted
  - --color-border-default, --color-border-strong
- Semantic:
  - success / warning / error / info 각각 bg, text, border, soft 배경
- State:
  - hover, active, disabled, focus ring 토큰
- 차트/뱃지/버튼에서 semantic 색 재사용 규칙 명시

[레이어 가이드 명세(반드시 산출)]
- z-index scale:
  - base(0), sticky(10), sidebar(20), header(30), dropdown(40), modal(50), toast(60), tooltip(70)
- elevation(shadow) scale:
  - sm / md / lg 사용 기준
- radius scale:
  - sm / md / lg / pill
- 컴포넌트별 레이어 규칙:
  - Header는 Sidebar보다 위인지 여부를 명확히
  - Dropdown/Modal/Toast 충돌 규칙 명시

[필터 시스템 요구]
- 공통 FilterBar 컴포넌트 설계:
  - keyword, status, dateRange, sort
- 상태관리:
  - useState 또는 useReducer 선택 근거 제시
- URL query sync 가능하도록 확장 포인트 제공

[출력 형식]
1. 현행 분석 요약 (문제점 5개 이내)
2. 디자인 토큰 제안 (색상/레이어 표)
3. 파일별 수정안
   - 경로
   - 변경 이유
   - 코드
4. 컴포넌트 적용 예시
   - admin/dashboard
   - admin/list 페이지 1개 이상
5. 검증 체크리스트
   - contrast, focus-visible, dark mode, hover/active/disabled, 레이어 충돌
6. 리스크/롤백 포인트

[완료 기준]
- admin 화면에서 Primary/Neutral/Semantic 색이 일관되게 보일 것
- Button/Badge/Table/StatCard의 상태 표현이 통일될 것
- 헤더/사이드바/드롭다운/모달의 레이어 우선순위가 문서화+코드 반영될 것
- 기존 디자인 톤은 유지하되 유지보수성은 상승할 것
```
