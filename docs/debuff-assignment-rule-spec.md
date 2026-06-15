# Dancing Mad 디버프 부여 규칙 정리

## 1. 목적

이 문서는 `Dancing Mad` 페이즈의 디버프 부여 데이터를 기반으로, 디버프 타이머 웹서비스에서 사용할 수 있는 **부여 차수별 시간 규칙**과 **플레이어별 디버프 전환 규칙**을 정리한 문서다.

서비스 목표는 다음과 같다.

```text
전투 중 플레이어가 현재 자신에게 부여된 디버프를 빠르게 입력하면,
규칙상 자동 추론 가능한 디버프/시간은 자동 계산하고,
지속시간 만료 시점에 알림을 제공한다.
```

---

## 2. 전체 구조

총 8명의 플레이어가 있으며, 각 플레이어는 전체 흐름에서 총 5회 디버프를 받는다.

```text
1번째 부여: 랜덤 디버프 묶음
2번째 부여: Entropy 또는 Dynamic Fluid
3번째 부여: 랜덤 디버프 묶음
4번째 부여: Entropy 또는 Dynamic Fluid
5번째 부여: 최종 디버프 묶음
```

---

# 3. 차수별 디버프 구성

## 3.1 1번째 부여

1번째 부여에서는 다음 디버프가 부여된다.

| 디버프 | 대상자 수 | 지속시간 |
|---|---:|---:|
| Forked Lightning | 2명 | 51초 또는 76초 |
| Compressed Water | 2명 | 51초 또는 76초 |
| Cursed Shriek | 2명 | 60초 |
| Acceleration Bomb | 4명 | 51초 2명 + 76초 2명 |

### 1번째 부여 규칙

```text
Forked Lightning과 Compressed Water는 같은 시간 그룹으로 묶인다.

패턴 A:
- Forked Lightning 51초
- Compressed Water 51초

패턴 B:
- Forked Lightning 76초
- Compressed Water 76초
```

Acceleration Bomb은 항상 51초와 76초가 섞인다.

```text
Acceleration Bomb 4명 중
- 2명은 51초
- 2명은 76초
```

Cursed Shriek는 고정이다.

```text
Cursed Shriek = 60초
```

---

## 3.2 2번째 부여

2번째 부여에서는 8명 전원에게 아래 둘 중 하나가 부여된다.

| 디버프 | 대상자 수 | 지속시간 |
|---|---:|---:|
| Entropy | 8명 | 60초 |
| Dynamic Fluid | 8명 | 84초 |

### 2번째 부여 규칙

```text
2번째가 Entropy면 60초
2번째가 Dynamic Fluid면 84초
```

2번째 디버프는 4번째 디버프와 짝을 이룬다.

```text
2번째 Entropy → 4번째 Dynamic Fluid
2번째 Dynamic Fluid → 4번째 Entropy
```

따라서 2번째 디버프를 입력하면 4번째 디버프는 자동 추론할 수 있다.

---

## 3.3 3번째 부여

3번째 부여에서는 1번째와 같은 종류의 랜덤 디버프 묶음이 다시 부여된다.

| 디버프 | 대상자 수 | 지속시간 |
|---|---:|---:|
| Forked Lightning | 2명 | 36초 또는 61초 |
| Compressed Water | 2명 | 36초 또는 61초 |
| Cursed Shriek | 2명 | 69초 |
| Acceleration Bomb | 4명 | 36초 2명 + 61초 2명 |

### 3번째 부여 시간 규칙

```text
Forked Lightning / Compressed Water:
- 36초 또는 61초

Cursed Shriek:
- 69초

Acceleration Bomb:
- 36초 2명 + 61초 2명
```

---

## 3.4 4번째 부여

4번째 부여에서는 2번째에 나오지 않은 디버프가 8명 전원에게 부여된다.

| 2번째 디버프 | 4번째 디버프 | 4번째 지속시간 |
|---|---|---:|
| Entropy 60초 | Dynamic Fluid | 69초 |
| Dynamic Fluid 84초 | Entropy | 45초 |

### 4번째 부여 규칙

```text
2번째 Entropy 60초
→ 4번째 Dynamic Fluid 69초

2번째 Dynamic Fluid 84초
→ 4번째 Entropy 45초
```

따라서 4번째는 별도 입력하지 않아도 된다.

---

## 3.5 5번째 부여

5번째 부여에서는 최종 디버프가 부여된다.

| 디버프 | 지속시간 | 용도 |
|---|---:|---|
| Black Wound | 9999초 | 상태 표시용 |
| White Wound | 9999초 | 상태 표시용 |
| Allagan Field | 15초 | 타이머 알림 필요 |
| Beyond Death | 14~15초 | 타이머 알림 필요 |

### 5번째 부여 규칙

```text
Black Wound / White Wound:
- 9999초
- 실질적으로 만료 알림보다는 상태 표시용

Allagan Field:
- 15초

Beyond Death:
- 로그상 14초 또는 15초
- 서비스 기본값은 15초 권장
- 빠른 알림 옵션이 필요하면 14초 기준 보조 알림 제공
```

---

# 4. 1번째 ↔ 3번째 시간 보완 규칙

1번째와 3번째의 Forked Lightning / Compressed Water 시간은 서로 보완된다.

```text
1번째 Forked Lightning / Compressed Water가 51초
→ 3번째 Forked Lightning / Compressed Water는 61초

1번째 Forked Lightning / Compressed Water가 76초
→ 3번째 Forked Lightning / Compressed Water는 36초
```

암기용으로는 아래처럼 정리할 수 있다.

```text
51 → 61
76 → 36
```

## 예시

| 1번째 FL/CW 시간 | 3번째 FL/CW 시간 |
|---:|---:|
| 51초 | 61초 |
| 76초 | 36초 |

---

# 5. 1번째 ↔ 3번째 대상자 전환 규칙

전체 데이터 기준으로, 1번째와 3번째 사이에는 단순 시간 규칙뿐 아니라 **대상자 전환 규칙**도 존재한다.

## 5.1 같은 랜덤 디버프는 반복되지 않음

다음 케이스는 확인된 데이터에서 발생하지 않았다.

```text
1번째 Forked Lightning → 3번째 Forked Lightning
1번째 Compressed Water → 3번째 Compressed Water
1번째 Cursed Shriek → 3번째 Cursed Shriek
1번째 Acceleration Bomb → 3번째 Acceleration Bomb
```

즉, 1번째에 받은 랜덤 디버프와 동일한 디버프는 3번째에 다시 나오지 않는다.

---

## 5.2 번개/물 그룹과 폭탄 그룹은 서로 교차한다

가장 중요한 전환 규칙은 다음과 같다.

```text
1번째 Forked Lightning / Compressed Water 대상자 4명
→ 3번째 Acceleration Bomb 대상자 4명

1번째 Acceleration Bomb 대상자 4명
→ 3번째 Forked Lightning / Compressed Water 대상자 4명
```

즉, 그룹 단위로 보면 아래처럼 교차한다.

```text
1차 번개/물 그룹 → 3차 폭탄 그룹
1차 폭탄 그룹 → 3차 번개/물 그룹
```

---

## 5.3 Cursed Shriek 전환 규칙

Cursed Shriek도 반복되지 않는다.

```text
1번째 Cursed Shriek 대상자 2명
→ 3번째 Cursed Shriek 대상자가 아님
→ 3번째 Forked Lightning / Compressed Water 쪽으로 이동
```

3번째 Cursed Shriek 대상자는 1번째 Forked Lightning / Compressed Water 대상자 중에서 나온다.

```text
3번째 Cursed Shriek 대상자 2명
→ 1번째 Forked Lightning / Compressed Water 대상자 중 일부
```

---

# 6. 플레이어별 3번째 후보 자동 제한 규칙

웹서비스에서는 1번째 입력값을 기반으로 3번째 선택지를 줄일 수 있다.

## 6.1 1번째가 Forked Lightning인 경우

```text
1번째: Forked Lightning

3번째에서 제외 가능:
- Forked Lightning
- Compressed Water

3번째 후보:
- Acceleration Bomb
- Cursed Shriek
```

단, 실제 구조상 1차 번개/물 대상자는 3차 Acceleration Bomb 그룹으로 이동하고, 그중 일부가 Cursed Shriek를 추가로 받는 형태로 보인다.

---

## 6.2 1번째가 Compressed Water인 경우

```text
1번째: Compressed Water

3번째에서 제외 가능:
- Forked Lightning
- Compressed Water

3번째 후보:
- Acceleration Bomb
- Cursed Shriek
```

---

## 6.3 1번째가 Acceleration Bomb인 경우

```text
1번째: Acceleration Bomb

3번째에서 제외 가능:
- Acceleration Bomb
- Cursed Shriek

3번째 후보:
- Forked Lightning
- Compressed Water
```

---

## 6.4 1번째가 Cursed Shriek인 경우

```text
1번째: Cursed Shriek

3번째에서 제외 가능:
- Cursed Shriek
- Acceleration Bomb

3번째 후보:
- Forked Lightning
- Compressed Water
```

---

# 7. 실제 만료 웨이브 규칙

서비스에서는 개별 지속시간보다 **실제 만료 웨이브**를 기준으로 알림을 구성하는 것이 더 안정적이다.

1번째 부여 시점을 `T+0`으로 잡으면 주요 만료 웨이브는 다음과 같다.

| 웨이브 | 만료 대상 |
|---:|---|
| T+51초 | 1차 51초 FL/CW, 1차 51초 Acceleration Bomb, 3차 36초 FL/CW, 3차 36초 Acceleration Bomb |
| T+60초 | 1차 Cursed Shriek |
| T+67초 | Entropy 계열 만료 |
| T+76초 | 1차 76초 FL/CW, 1차 76초 Acceleration Bomb, 3차 61초 FL/CW, 3차 61초 Acceleration Bomb |
| T+84초 | 3차 Cursed Shriek |
| T+90초 | Dynamic Fluid 계열 만료 |

암기용으로는 아래처럼 정리할 수 있다.

```text
주요 알림 웨이브:
- 51초
- 60초
- 67초
- 76초
- 84초
- 90초
```

---

# 8. 웹서비스 입력 최적화 규칙

## 8.1 1번째 입력

플레이어가 직접 입력해야 하는 값:

```text
- 내 1번째 디버프 종류
- 필요한 경우 지속시간
```

입력 생략 가능:

```text
Cursed Shriek는 항상 60초이므로 시간 선택 불필요
```

권장 UI:

```text
[ Forked Lightning ] [ Compressed Water ]
[ Cursed Shriek ]    [ Acceleration Bomb ]

시간 선택:
[ 51초 ] [ 76초 ]

단, Cursed Shriek 선택 시 시간 버튼 숨김
```

---

## 8.2 2번째 입력

플레이어가 직접 입력해야 하는 값:

```text
- Entropy인지 Dynamic Fluid인지
```

입력 후 자동 계산:

```text
Entropy 선택 → 2번째 60초, 4번째 Dynamic Fluid 69초 자동 등록
Dynamic Fluid 선택 → 2번째 84초, 4번째 Entropy 45초 자동 등록
```

권장 UI:

```text
[ Entropy ] [ Dynamic Fluid ]
```

---

## 8.3 3번째 입력

1번째 입력값에 따라 3번째 선택지를 자동 제한한다.

```text
1번째 FL/CW → 3번째 후보: Acceleration Bomb / Cursed Shriek
1번째 Acceleration Bomb → 3번째 후보: Forked Lightning / Compressed Water
1번째 Cursed Shriek → 3번째 후보: Forked Lightning / Compressed Water
```

시간 자동 계산:

```text
1번째 FL/CW 51초 → 3번째 FL/CW는 61초
1번째 FL/CW 76초 → 3번째 FL/CW는 36초
Cursed Shriek → 69초 고정
```

Acceleration Bomb은 36초 또는 61초 중 본인에게 부여된 시간을 선택해야 한다.

권장 UI:

```text
1번째 입력 기반으로 불가능한 버튼은 숨김 또는 비활성화
가능성이 높은 버튼만 크게 표시
```

---

## 8.4 4번째 입력

4번째는 직접 입력하지 않아도 된다.

```text
2번째 Entropy → 4번째 Dynamic Fluid 69초
2번째 Dynamic Fluid → 4번째 Entropy 45초
```

권장 UI:

```text
4번째는 자동 등록된 타이머만 표시
사용자가 수정할 수 있는 '수동 보정' 버튼은 선택 기능으로 제공
```

---

## 8.5 5번째 입력

입력해야 하는 값:

```text
- Allagan Field 여부
- Beyond Death 여부
- Black Wound / White Wound 상태
```

서비스 처리:

```text
Allagan Field → 15초 타이머 등록
Beyond Death → 기본 15초 타이머 등록
Black/White Wound → 상태 표시만 등록
```

권장 UI:

```text
[ Allagan Field ] [ Beyond Death ]
[ Black Wound ]   [ White Wound ]
```

---

# 9. 최종 암기 규칙

## 9.1 시간 암기

```text
1차
- 번개/물: 51 or 76
- 시선: 60
- 폭탄: 51/76

2차
- Entropy: 60
- Dynamic Fluid: 84

3차
- 번개/물: 1차와 보완
  51 → 61
  76 → 36
- 시선: 69
- 폭탄: 36/61

4차
- 2차의 반대
  Entropy: 45
  Dynamic Fluid: 69

5차
- Field: 15
- Beyond Death: 14~15
- Wound: 9999
```

## 9.2 대상자 전환 암기

```text
1차 번개/물 → 3차 폭탄 쪽
1차 폭탄/시선 → 3차 번개/물 쪽
같은 랜덤 디버프 반복 없음
3차 시선은 1차 번개/물 대상자 중에서 발생
```

## 9.3 웹서비스용 핵심 요약

```text
1차 입력으로 3차 후보를 줄인다.
2차 입력으로 4차를 자동 계산한다.
고정 시간 디버프는 시간 선택을 생략한다.
알림은 51 / 60 / 67 / 76 / 84 / 90초 웨이브 중심으로 관리한다.
```

---

# 10. 구현 시 주의점

## 10.1 로그 시간 오차

FF Logs에서는 일부 디버프가 14초 또는 15초처럼 다르게 찍힐 수 있다.

```text
Beyond Death는 14~15초로 표기하고,
서비스 기본값은 15초로 처리하는 것을 권장한다.
```

## 10.2 수동 보정 기능

규칙 기반 자동 계산을 기본으로 하되, 실제 전투 중 예외 상황이나 입력 실수를 고려해 수동 보정 기능을 제공하는 것이 좋다.

권장 기능:

```text
- 타이머 직접 수정
- 차수 되돌리기
- 현재 차수 재입력
- 전체 초기화
```

## 10.3 모바일 우선 설계

전투 중 조작을 전제로 하므로, UI는 모바일 터치에 최적화해야 한다.

권장 사항:

```text
- 버튼 높이 최소 56px 이상
- 디버프 이름 + 아이콘 표시
- 한 화면에 현재 차수만 크게 표시
- 불가능한 선택지는 숨김
- 자동 추론된 항목은 '자동 계산됨'으로 표시
- 알림은 소리 + 진동 + 화면 점멸 조합
```

