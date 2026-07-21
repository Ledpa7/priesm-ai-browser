# Approval Policy v0

> 관련: `AGENT_RUNTIME_API.md`, `AI_BROWSER_STRATEGY.md`

## 원칙
1. Read path open, Act path closed by default
2. Human is the final brake
3. No growth via silent autonomous clicking (early phases)

## Matrix

| Action | Default | Note |
|--------|---------|------|
| search | allow | rate limited |
| open public http(s) | allow | attended preferred |
| read/extract | allow | |
| screenshot | allow | |
| expand | allow | budgeted |
| bundle/render | allow | |
| click / type | prompt | |
| submit form | prompt | |
| download / upload | deny | explicit enable |
| open private IP / file | deny | |
| use user logged-in profile | deny | opt-in profile |
| password / payment fields | block | |

## UX
- toast + timeline entry
- Allow once / Allow for domain session / Deny
- TTL 60s default
- requesting agent name visible

## Audit
Local log: actor, action, url, ts, decision.