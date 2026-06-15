# Dancing Mad Debuff Timer

Mobile-first debuff timer for Dancing Mad phase 4.

## Run

```bash
pnpm install
pnpm dev
```

The app starts at `http://localhost:4000` and exposes a single mobile-friendly timer screen.

## Implemented MVP

- Round 1-5 debuff input
- Rule-based duration calculation
- Truth/Lie selection for every round
- Round 3 duration inference from round 1
- Round 3 candidate filtering from round 1 assignment rules
- Round 4 debuff inference from round 2
- Round 4 Truth/Lie-only confirmation after automatic inference
- Countdown display from absolute `expiresAt`
- Debuff icon selection grid
- Display mode setting for icon-only or icon-with-name buttons
- Registration mode setting for confirm-button or instant selection flow
- Sound and vibration alert test flow in settings
- Configurable early alert timing, default 4 seconds before expiration
- Local reset and localStorage persistence
- Round 5 pair selection: Black/White Wound + Allagan Field/Beyond Death

## Alert Permission Flow

Mobile browsers usually block audio until the user performs a direct action.
Open `설정` and use `알림 테스트` before combat to resume the Web Audio context and trigger a short vibration pattern.

The app does not request Notification API permission yet because MVP alerts happen while the page is open.

## Specs

- `docs/debuff-timer-service-spec.md`
- `docs/debuff-assignment-rule-spec.md`
