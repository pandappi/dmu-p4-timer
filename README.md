# Dancing Mad Debuff Assist

Mobile-first debuff assist for Dancing Mad phase 4.

## Run

```bash
pnpm install
pnpm dev
```

The app starts at `http://localhost:4000` and exposes a single mobile-friendly assist screen.

## Implemented MVP

- Round 1-5 debuff input
- Rule-based duration calculation
- Truth/Lie selection for every round
- Round 3 duration inference from round 1
- Round 4 debuff inference from round 2
- Round 4 Truth/Lie-only confirmation after automatic inference
- Countdown display from absolute `expiresAt`
- Debuff icon selection grid
- Registration mode setting for confirm-button or instant selection flow
- TTS sound alert and optional vibration
- Configurable early alert timing, default 5 seconds before expiration
- Local reset and localStorage persistence
- Round 5 pair selection: Black/White Wound + Allagan Field/Beyond Death

## Alert Permission Flow

Some mobile browsers may block TTS until the user performs a direct action.
The app attempts TTS without a setup step, and `설정` still includes `알림 테스트` for device checks.

The app does not request Notification API permission yet because MVP alerts happen while the page is open.

## Specs

- `docs/debuff-timer-service-spec.md`
- `docs/debuff-assignment-rule-spec.md`
