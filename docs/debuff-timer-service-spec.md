# Dancing Mad 디버프 타이머 웹서비스 기획/개발 명세

## 1. 서비스 목적

8인 파티 전투 중 플레이어가 자신에게 부여된 디버프 정보를 차수별로 빠르게 입력하면, 각 디버프의 지속시간 종료 시점에 맞춰 화면/소리/진동으로 알려주는 모바일 친화 웹서비스를 만든다.

핵심 목표는 다음과 같다.

```text
전투 중 손이 바쁜 상황에서도
최소 입력으로
내가 처리해야 할 디버프 만료 타이밍을 놓치지 않게 한다.
```

---

## 2. 전제 규칙

### 2.1 총 부여 차수

디버프는 총 5차례 부여된다.

| 차수 | 부여 디버프 종류 | 입력 필요 여부 |
|---:|---|---|
| 1차 | Forked Lightning / Compressed Water / Cursed Shriek / Acceleration Bomb | 필요 |
| 2차 | Entropy 또는 Dynamic Fluid | 필요 |
| 3차 | Forked Lightning / Compressed Water / Cursed Shriek / Acceleration Bomb | 일부 자동화 가능 |
| 4차 | Entropy 또는 Dynamic Fluid | 일부 자동화 가능 |
| 5차 | Black Wound / White Wound / Allagan Field / Beyond Death | 필요 |

---

## 3. 디버프 지속시간 규칙

### 3.1 1차 디버프

| 디버프 | 지속시간 |
|---|---:|
| Forked Lightning | 51초 또는 76초 |
| Compressed Water | 51초 또는 76초 |
| Cursed Shriek | 60초 |
| Acceleration Bomb | 51초 또는 76초 |

1차 Acceleration Bomb은 총 4명에게 부여되며, 그중 2명은 51초, 2명은 76초다.

### 3.2 2차 디버프

| 디버프 | 지속시간 |
|---|---:|
| Entropy | 60초 |
| Dynamic Fluid | 84초 |

### 3.3 3차 디버프

| 디버프 | 지속시간 |
|---|---:|
| Forked Lightning | 36초 또는 61초 |
| Compressed Water | 36초 또는 61초 |
| Cursed Shriek | 69초 |
| Acceleration Bomb | 36초 또는 61초 |

3차 Acceleration Bomb은 총 4명에게 부여되며, 그중 2명은 36초, 2명은 61초다.

### 3.4 4차 디버프

| 디버프 | 지속시간 |
|---|---:|
| Entropy | 45초 |
| Dynamic Fluid | 69초 |

### 3.5 5차 디버프

| 디버프 | 지속시간 |
|---|---:|
| Black Wound | 만료 알림 없음 |
| White Wound | 만료 알림 없음 |
| Allagan Field | 15초 |
| Beyond Death | 14~15초 |

실전 타이머에서는 Beyond Death를 15초 기준으로 처리한다.
Black Wound / White Wound는 함께 부여된 5차 디버프와 같은 부여 시점으로 기록하되, 별도 만료 알림은 등록하지 않는다.

---

## 4. 자동 생략 규칙

### 4.1 1차와 3차의 보완 관계

1차에서 Forked Lightning 또는 Compressed Water의 시간이 확인되면, 3차에서 같은 계열의 시간은 자동으로 추론할 수 있다.

```text
1차 51초 → 3차 61초
1차 76초 → 3차 36초
```

즉, 사용자가 1차에서 자신의 Forked Lightning / Compressed Water 시간을 입력했다면, 3차에서는 같은 계열의 시간 선택을 생략할 수 있다.

### 4.2 2차와 4차의 보완 관계

2차에서 Entropy 또는 Dynamic Fluid를 입력하면, 4차는 반대 디버프로 자동 추론할 수 있다.

```text
2차 Entropy 60초 → 4차 Dynamic Fluid 69초
2차 Dynamic Fluid 84초 → 4차 Entropy 45초
```

따라서 2차 입력 후에는 4차 디버프 종류와 시간은 자동 결정된다.
4차 화면에서는 사용자가 진실/거짓만 선택한다.

```text
2차 기준 자동 적용됨
[진실] [거짓]
```

### 4.3 고정 시간 디버프

Cursed Shriek는 차수에 따라 시간이 고정된다.

```text
1차 Cursed Shriek = 60초
3차 Cursed Shriek = 69초
```

사용자가 Cursed Shriek를 선택하면 시간 선택 버튼은 노출하지 않는다.

### 4.4 5차 디버프 중 무시 가능 항목

Black Wound / White Wound는 실질적인 만료 알림 대상이 아니다.
다만 함께 부여된 5차 디버프와 같은 시점에 붙은 것으로 기록한다.

따라서 5차에서는 다음처럼 처리한다.

```text
Allagan Field 선택 → 15초 알림 등록
Beyond Death 선택 → 15초 알림 등록
Black Wound 선택 → 같은 부여 시점 기록, 알림 없음
White Wound 선택 → 같은 부여 시점 기록, 알림 없음
```

---

## 5. 사용자 플로우

## 5.1 기본 플로우

```text
1. 전투 시작
2. 사용자가 [타이머 시작] 버튼 클릭
3. 1차 디버프 부여 시점에 사용자가 자신의 디버프 선택
4. 서비스가 해당 디버프 만료 예정 시간을 등록
5. 2차 디버프 선택
6. 3차 디버프 선택 또는 자동 추론
7. 4차 디버프 자동 추론 또는 수동 수정
8. 5차 디버프 선택
9. 각 만료 시점마다 알림 발생
10. 전투 종료 후 [초기화]
```

---

## 6. 화면 구성

## 6.1 메인 화면

### 목적

현재 차수, 남은 알림, 다음 만료 디버프를 즉시 확인한다.

### 구성

```text
[상단]
Dancing Mad Debuff Timer
전투 경과 시간 01:23

[현재 상태]
현재 입력 차수: 2차
다음 만료: Forked Lightning - 18초 후

[큰 버튼]
1차 입력
2차 입력
3차 입력
4차 자동 적용됨
5차 입력

[하단 고정]
초기화 / 알림 테스트 / 설정
```

### 모바일 기준

- 버튼 높이 최소 64px 이상
- 엄지로 누르기 쉽게 화면 하단에 주요 액션 배치
- 한 화면에 너무 많은 텍스트를 넣지 않음
- 디버프명은 아이콘 + 짧은 이름 병기
- 선택 완료된 차수는 접힌 카드 형태로 표시

---

## 6.2 차수별 입력 화면

### 공통 구조

```text
[차수 제목]
1차 디버프 선택

[설명]
현재 자신에게 걸린 디버프를 선택하세요.

[디버프 선택 버튼]
Forked Lightning
Compressed Water
Cursed Shriek
Acceleration Bomb

[시간 선택 버튼]
51초
76초

[등록 버튼]
이 디버프 등록
```

---

## 7. 차수별 입력 상세

## 7.1 1차 입력

### 선택 가능한 디버프

| 디버프 | 시간 선택 필요 여부 |
|---|---|
| Forked Lightning | 필요 |
| Compressed Water | 필요 |
| Cursed Shriek | 불필요 |
| Acceleration Bomb | 필요 |

### UI

```text
1차 디버프 선택

[Forked Lightning]
[Compressed Water]
[Cursed Shriek]
[Acceleration Bomb]

Forked Lightning 또는 Compressed Water 또는 Acceleration Bomb 선택 시:

[51초]
[76초]

Cursed Shriek 선택 시:

60초로 자동 등록됩니다.
[등록]
```

### 자동 저장 데이터

```ts
{
  round: 1,
  debuff: 'Forked Lightning',
  duration: 51,
  appliedAt: number,
  expiresAt: number
}
```

---

## 7.2 2차 입력

### 선택 가능한 디버프

| 디버프 | 시간 |
|---|---:|
| Entropy | 60초 |
| Dynamic Fluid | 84초 |

### UI

```text
2차 디버프 선택

[Entropy]
[Dynamic Fluid]

Entropy 선택 시:
- 2차 Entropy 60초 등록
- 4차 Dynamic Fluid 69초 자동 예정

Dynamic Fluid 선택 시:
- 2차 Dynamic Fluid 84초 등록
- 4차 Entropy 45초 자동 예정
```

### 자동 추론

```ts
if (round2Debuff === 'Entropy') {
  round4Debuff = 'Dynamic Fluid'
  round4Duration = 69
}

if (round2Debuff === 'Dynamic Fluid') {
  round4Debuff = 'Entropy'
  round4Duration = 45
}
```

---

## 7.3 3차 입력

### 선택 가능한 디버프

| 디버프 | 시간 선택 필요 여부 |
|---|---|
| Forked Lightning | 조건부 자동 가능 |
| Compressed Water | 조건부 자동 가능 |
| Cursed Shriek | 불필요 |
| Acceleration Bomb | 필요 |

### UI

```text
3차 디버프 선택

[Forked Lightning]
[Compressed Water]
[Cursed Shriek]
[Acceleration Bomb]
```

### Forked Lightning / Compressed Water 선택 시

1차에서 동일 계열 시간이 입력되어 있으면 자동으로 시간 추천을 보여준다.

```text
1차에서 51초였으므로
3차는 61초로 자동 등록됩니다.

[자동 등록]
[수정하기]
```

또는

```text
1차에서 76초였으므로
3차는 36초로 자동 등록됩니다.

[자동 등록]
[수정하기]
```

### Cursed Shriek 선택 시

```text
3차 Cursed Shriek는 69초입니다.
[등록]
```

### Acceleration Bomb 선택 시

```text
[36초]
[61초]
```

---

## 7.4 4차 입력

4차는 2차 입력으로 자동 추론 가능하다.

### UI 기본 상태

```text
4차 디버프는 자동 적용됩니다.

2차에서 Entropy를 선택했으므로
4차는 Dynamic Fluid 69초입니다.

[진실] [거짓]
```

또는

```text
2차에서 Dynamic Fluid를 선택했으므로
4차는 Entropy 45초입니다.

[진실] [거짓]
```

4차는 디버프 선택 버튼을 노출하지 않고, 진실/거짓 선택만으로 자동 등록한다.

---

## 7.5 5차 입력

### 선택 가능한 디버프

| 디버프 | 알림 여부 |
|---|---|
| Black Wound | 알림 없음 |
| White Wound | 알림 없음 |
| Allagan Field | 15초 알림 |
| Beyond Death | 15초 알림 |

### UI

```text
5차 디버프 선택

[Black Wound] [White Wound]
[Allagan Field] [Beyond Death]
```

### 선택 결과

```text
Black Wound 또는 White Wound 중 1개 선택:
같은 부여 시점 기록, 만료 알림 없음

Allagan Field 또는 Beyond Death 중 1개 선택:
15초 후 만료, 사용자 설정값 기준으로 사전 알림 등록

예:
Black Wound + Allagan Field 선택 → 같은 appliedAt으로 2개 등록
White Wound + Beyond Death 선택 → 같은 appliedAt으로 2개 등록
```

---

## 8. 알림 방식

## 8.1 알림 종류

기본 알림 시점은 실제 디버프 만료 4초 전이다.
사용자는 설정 팝오버에서 이 값을 숫자로 직접 변경할 수 있다.

기본값은 다음과 같이 한다.

```text
만료 4초 전: 강한 사운드 + 진동
```

### 모바일 브라우저 제약

모바일 브라우저에서는 자동 사운드 재생이 제한될 수 있으므로, 사용자가 반드시 전투 시작 전에 설정 팝오버의 [알림 테스트]를 눌러 사운드 권한을 활성화하게 한다.

---

## 9. 타이머 기준

## 9.1 입력 시점 기준

사용자가 디버프를 선택하고 등록한 순간을 `appliedAt`으로 잡는다.

```text
만료 시점 = 등록 시점 + 지속시간
```

실제 게임에서는 플레이어가 디버프를 확인하고 아이콘을 누르기까지 약간의 시간이 걸린다.
이 지연은 별도 입력 보정값으로 처리하지 않고, 설정의 `몇 초 전에 알림` 값으로 흡수한다.

계산식:

```ts
appliedAt = now
expiresAt = appliedAt + duration * 1000
alertAt = expiresAt - alertLeadSeconds * 1000
```

---

## 10. 데이터 모델

## 10.1 DebuffName

```ts
type DebuffName =
  | 'Forked Lightning'
  | 'Compressed Water'
  | 'Cursed Shriek'
  | 'Acceleration Bomb'
  | 'Entropy'
  | 'Dynamic Fluid'
  | 'Black Wound'
  | 'White Wound'
  | 'Allagan Field'
  | 'Beyond Death'
```

## 10.2 DebuffEntry

```ts
type DebuffEntry = {
  id: string
  round: 1 | 2 | 3 | 4 | 5
  debuff: DebuffName
  duration: number | null
  appliedAt: number
  expiresAt: number | null
  notify: boolean
  source: 'manual' | 'auto'
  truthState: 'truth' | 'lie'
}
```

`truthState`는 각 차수에서 선택하는 진실/거짓 상태다.
예를 들어 `Compressed Water + lie`, `Compressed Water + truth`처럼 같은 디버프도 진실/거짓에 따라 구분해서 기록한다.

## 10.3 TimerState

```ts
type TimerState = {
  startedAt: number | null
  currentRound: 1 | 2 | 3 | 4 | 5
  entries: DebuffEntry[]
  round1ElementDuration?: 51 | 76
  round2Debuff?: 'Entropy' | 'Dynamic Fluid'
}
```

---

## 11. 규칙 엔진

## 11.1 차수별 지속시간 계산 함수

```ts
function getDuration(round: number, debuff: DebuffName, selectedDuration?: number) {
  if (round === 1) {
    if (debuff === 'Cursed Shriek') return 60
    if (
      debuff === 'Forked Lightning' ||
      debuff === 'Compressed Water' ||
      debuff === 'Acceleration Bomb'
    ) {
      return selectedDuration
    }
  }

  if (round === 2) {
    if (debuff === 'Entropy') return 60
    if (debuff === 'Dynamic Fluid') return 84
  }

  if (round === 3) {
    if (debuff === 'Cursed Shriek') return 69
    if (
      debuff === 'Forked Lightning' ||
      debuff === 'Compressed Water' ||
      debuff === 'Acceleration Bomb'
    ) {
      return selectedDuration
    }
  }

  if (round === 4) {
    if (debuff === 'Entropy') return 45
    if (debuff === 'Dynamic Fluid') return 69
  }

  if (round === 5) {
    if (debuff === 'Allagan Field') return 15
    if (debuff === 'Beyond Death') return 15
    if (debuff === 'Black Wound') return null
    if (debuff === 'White Wound') return null
  }

  return null
}
```

## 11.2 3차 자동 추론

```ts
function inferRound3DurationFromRound1(round1Duration: 51 | 76) {
  if (round1Duration === 51) return 61
  if (round1Duration === 76) return 36
}
```

## 11.3 4차 자동 추론

```ts
function inferRound4FromRound2(round2Debuff: 'Entropy' | 'Dynamic Fluid') {
  if (round2Debuff === 'Entropy') {
    return {
      debuff: 'Dynamic Fluid',
      duration: 69,
    }
  }

  return {
    debuff: 'Entropy',
    duration: 45,
  }
}
```

---

## 12. 모바일 UX 설계

## 12.1 버튼 크기

전투 중 터치 실수를 줄이기 위해 다음 기준을 사용한다.

```text
주요 버튼 높이: 72px
보조 버튼 높이: 52px
버튼 간격: 12px 이상
글자 크기: 18~22px
```

## 12.2 한 손 조작

- 하단에 현재 차수 선택 영역 고정
- 가장 자주 누르는 버튼은 화면 아래쪽에 배치
- 스크롤 없이 한 화면에서 선택 가능하게 구성
- 가로모드보다 세로모드 우선

## 12.3 색상 구분

| 종류 | 표시 방식 |
|---|---|
| Forked Lightning | 노란색 계열 |
| Compressed Water | 파란색 계열 |
| Cursed Shriek | 보라색 계열 |
| Acceleration Bomb | 빨간색 계열 |
| Entropy | 어두운 보라/검정 계열 |
| Dynamic Fluid | 청록색 계열 |
| Allagan Field | 주황색 계열 |
| Beyond Death | 회색/검정 계열 |

색상만으로 구분하지 않고 반드시 텍스트와 아이콘을 함께 표시한다.

---

## 13. 입력 최소화 전략

## 13.1 사용자가 반드시 입력해야 하는 것

```text
1차: 내 디버프 + 시간
2차: Entropy / Dynamic Fluid 중 하나
3차: 내 디버프
5차: 내 디버프
```

## 13.2 자동으로 생략 가능한 것

```text
3차 Forked Lightning / Compressed Water 시간
4차 전체
Cursed Shriek 시간 선택
5차 Black/White Wound 알림 등록
```

## 13.3 최단 입력 예시

```text
1차: Forked Lightning + 51초 선택
2차: Dynamic Fluid 선택
3차: Forked Lightning 선택 → 61초 자동
4차: Entropy 45초 자동
5차: Allagan Field 선택 → 15초 등록
```

---

## 14. 화면 예시

## 14.1 1차 화면

```text
┌─────────────────────────┐
│ 1차 디버프 선택           │
│ 내게 붙은 디버프를 선택    │
├─────────────────────────┤
│ [ Forked Lightning ]     │
│ [ Compressed Water ]     │
│ [ Cursed Shriek ]        │
│ [ Acceleration Bomb ]    │
├─────────────────────────┤
│ 시간 선택                 │
│ [ 51초 ] [ 76초 ]         │
├─────────────────────────┤
│ [ 등록하기 ]              │
└─────────────────────────┘
```

## 14.2 3차 자동 추론 화면

```text
┌─────────────────────────┐
│ 3차 디버프 선택           │
├─────────────────────────┤
│ [ Forked Lightning ]     │
│ [ Compressed Water ]     │
│ [ Cursed Shriek ]        │
│ [ Acceleration Bomb ]    │
├─────────────────────────┤
│ 1차에서 51초였으므로       │
│ 3차는 61초로 자동 등록됨   │
├─────────────────────────┤
│ [ 자동 등록 ] [ 수정하기 ] │
└─────────────────────────┘
```

## 14.3 타이머 진행 화면

```text
┌─────────────────────────┐
│ 다음 만료                 │
│ Forked Lightning          │
│ 00:18                     │
├─────────────────────────┤
│ 등록된 알림               │
│ 1차 Forked Lightning 18초 │
│ 2차 Dynamic Fluid 42초    │
│ 4차 Entropy 자동 예정     │
├─────────────────────────┤
│ [ 다음 차수 입력 ]         │
│ [ 초기화 ]                │
└─────────────────────────┘
```

---

## 15. MVP 범위

첫 버전에서는 다음만 구현한다.

```text
- 모바일 우선 단일 페이지
- 1~5차 디버프 입력
- 규칙 기반 지속시간 자동 계산
- 3차/4차 자동 추론
- 화면 카운트다운
- 사운드 알림
- 진동 알림
- 초기화
- 알림 테스트
```

다음 기능은 MVP 이후로 미룬다.

```text
- 파티원 8명 전체 입력
- 로그 업로드 자동 분석
- 전투 타임라인 자동 동기화
- 사용자별 프리셋
- 디버프 아이콘 이미지 커스텀
- PWA 설치 지원
- WebSocket 멀티 동기화
```

---

## 16. 기술 스택 제안

사용자가 React / Next.js / TypeScript 기반 개발 경험이 있으므로 다음 구성을 권장한다.

```text
Next.js App Router
TypeScript
React
Zustand 또는 Jotai
Tailwind CSS
shadcn/ui 선택 가능
Web Audio API
Vibration API
localStorage
```

상태가 복잡하지 않으므로 전역 상태는 Zustand 또는 Jotai 정도면 충분하다.

---

## 17. 구현 우선순위

## 17.1 1단계

```text
디버프 규칙 데이터 정의
차수별 선택 UI 구현
등록된 디버프 리스트 표시
```

## 17.2 2단계

```text
카운트다운 구현
사용자 설정값 기준 사전 알림 구현
설정 팝오버 알림 테스트 버튼 구현
```

## 17.3 3단계

```text
3차 자동 추론
4차 자동 추론
입력 지연 보정
모바일 터치 UX 개선
```

## 17.4 4단계

```text
PWA 적용
오프라인 사용 가능 처리
화면 꺼짐 방지 안내
사용자 설정 저장
```

---

## 18. 주의사항

### 18.1 브라우저 백그라운드 제한

모바일 브라우저는 백그라운드 상태에서 타이머와 사운드가 정확하지 않을 수 있다.

따라서 서비스는 다음 안내를 표시해야 한다.

```text
전투 중에는 화면을 켜둔 상태로 사용하세요.
절전 모드나 백그라운드 전환 시 알림이 지연될 수 있습니다.
```

### 18.2 사운드 권한

모바일 브라우저는 사용자의 직접 입력 없이 소리를 재생하지 못할 수 있다.

따라서 전투 시작 전 반드시 다음 버튼을 누르게 한다.

```text
[알림 테스트]
```

이 버튼은 짧은 사운드를 재생하고 진동을 발생시켜, 이후 알림이 정상 작동할 가능성을 높인다.

---

## 19. 최종 요약

이 서비스는 디버프를 전부 직접 입력하는 도구가 아니라, 규칙으로 추론 가능한 부분을 최대한 생략하는 전투 보조 타이머다.

핵심 UX는 다음과 같다.

```text
1차에서 시간 입력
2차에서 Entropy/Dynamic Fluid 입력
3차와 4차는 가능한 자동 처리
5차는 알림 필요한 디버프만 처리
```

가장 중요한 설계 원칙은 다음이다.

```text
전투 중에는 정확성보다 입력 부담 감소가 더 중요하다.
하지만 자동 추론 결과는 항상 수정 가능해야 한다.
```
