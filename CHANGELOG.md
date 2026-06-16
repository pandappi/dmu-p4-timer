# Changelog

이 문서는 현재 코드(`app/`) 기준으로 정리한 변경 이력입니다.
형식은 [Keep a Changelog](https://keepachangelog.com/)를 따릅니다.

## [Unreleased] - 2026-06-16

### Added (추가)

- **모듈 구조 분리** — 단일 `app/page.tsx`에 몰려 있던 로직을 다음으로 분리.
  - `app/lib/`: `types`, `constants`, `rules`, `actions`, `storage`, `utils`
  - `app/hooks/`: `useDebuffTimer`, `useNow`, `useAlertSound`
  - `app/components/`: `TimerApp`, `TopBar`, `StatusPanel`, `RoundStrip`,
    `Workspace`, `DebuffButton`, `EntryList`, `Timeline`, `AoeGuide`,
    `SettingsModal`
  - `app/page.tsx`는 `<TimerApp/>`만 렌더하는 서버 컴포넌트로 축소.
- **처리법(행동) 텍스트** — 디버프 + 진실/거짓 조합으로 만료 시 행동을 표시
  (`app/lib/actions.ts`). 예: 번개 진실→산개/거짓→쉐어, 물은 반대, 폭탄
  가만히/움직이기, 저주의 외침 뒤돌기/마안보기, Entropy·Dynamic Fluid는
  원형장판피하기/도넛장판.
- **1·3차 저주의 외침(마안) 자동 타이머** — 선택 디버프와 별개로 자동 등록
  (1차 60초 / 3차 69초), 해당 차수의 진실/거짓을 따름.
- **5차 조합 처리** — 상처 색(파랑=Black/보라=White) + 최종 디버프
  (죽음초월=같은 색, 알라그필드=다른 색) → "파랑 맞기" / "보라 맞기".
- **처리 순서 타임라인** — 5차 완료 시 만료 시각순으로 행동을 표시하고 해당
  패널로 자동 스크롤(`Timeline`).
- **장판 기억(`AoeGuide`)** — 번개/얼음(또는 직선/부채꼴) 4개 입력의 XOR로
  "둘다 밟기 / 둘다 안밟기 / OO만 밟기"를 안내.
- **TTS 음성 알림 + 진동** — `speechSynthesis`로 행동 텍스트를 읽고 진동.
  설정에서 알림음(off/tts)·진동을 토글.
- **라이트/다크 테마** — CSS 변수 토큰 기반(`globals.css`)으로 전환.
- **차수 잠금** — 이전 차수가 완료되지 않으면 다음 차수 탭 비활성화
  (`RoundStrip`).
- **헤더 로고 + 파비콘** — 헤더 좌측 아이콘을 로고 이미지로 교체하고
  `app/icon.png`(512), `app/apple-icon.png`(180), `public/logo.png`(96) 추가.
- **설정 항목** — 알림 N초 전, 보조 모드(personal/raid), 등록 방식
  (confirm/instant), 알림음(off/tts), 진동, 테마(dark/light),
  장판 라벨(element/shape).

### Changed (변경)

- 디버프 한국어 표기 **'마안' → '저주의 외침'**(`app/lib/actions.ts`).
- **새로고침 시 전투 상태 초기화** — 등록 디버프·차수·로그는 저장하지 않고,
  설정(옵션)만 `localStorage`에 유지(`app/lib/storage.ts`).
- 디버프 선택 표시를 **체크 아이콘 제거 후 색상 강조만** 사용
  (`DebuffButton`).
- 헤더 타이틀 **"DMU P4 Assist"**, 헤더/하단바 높이 축소로 가시 영역 확대.

### Fixed (수정)

- **장판 기억의 진실/거짓 8버튼 폭 불균등** — 두 번째 그룹에만 붙은
  `margin-left`/`padding-left` 때문에 화면이 좁아질수록 오른쪽 버튼이 더
  좁아지던 문제 수정. 비대칭 여백을 제거하고 `minmax(0, 1fr)` 트랙으로
  모든 버튼이 동일 폭이 되도록 정렬(`globals.css`).
- **라이트 모드 가시성** — 4차 자동 결정 안내 박스와 초기화 버튼 텍스트가
  라이트 테마에서 보이지 않던 문제를 테마 토큰화로 수정.

[Unreleased]: https://github.com/pandappi/dmu-p4-timer/compare/main...feat/timer-features
