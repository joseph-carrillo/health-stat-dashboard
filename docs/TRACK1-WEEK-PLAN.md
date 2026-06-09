# Track 1 — One-Week Plan (Province Dashboard)

**Goal:** Bosses can log in, upload Immunization data, see **trusted province-level numbers** on maps/cards, and you have a deploy package for ICTU.

**Out of scope this week:** Track 2 (62 Excel files, barangay maps, template error fixes).

---

## Week at a glance

| Day | Theme | Done when… |
|-----|--------|------------|
| **Mon** | Trust the pipeline | Upload → approve → Indicator Report raw numbers match Excel for 3+ LGUs |
| **Tue** | API & data audit | Province/coverage APIs return expected rows for your test month |
| **Wed** | Overview + Home | Maps and summary cards use real API data (same month as upload) |
| **Thu** | Polish & roles | Coverage/Rankings sane for province view; login roles tested |
| **Fri** | Deploy prep | ICTU checklist, `.env.example`, dev bypass documented for removal |
| **Sat–Sun** | Buffer (optional) | Fix whatever broke in Fri dry-run |

---

## Monday — Trust the numbers

**You do**
1. `run startup protocols`
2. Upload test CPAB file (Child Care → Immunization, correct year/month)
3. Copy Batch ID → Staging → Approve
4. Indicator Report: same year/month → compare **Male/Female** for 3 LGUs vs Excel

**Agent can help**
- Fix LGU name mismatches (empty rows in report)
- Fix parser/staging bugs if counts differ

**Exit criteria:** You can say “these raw counts are correct for January 2026” (or your test period).

---

## Tuesday — API & database check

**You do**
1. DBeaver: spot-check `health_data` for your test period
2. Open `http://localhost:8000/docs` — try `coverage-summary`, `coverage-breakdown`, `health-data`

**Agent can help**
- Add or fix province-level aggregation if Overview needs a new shape
- Document which `indicator_code` each page uses

**Exit criteria:** You know which API each page should call and rows exist for that period.

---

## Wednesday — Overview + Home (real data)

**You do**
1. Overview: set year/month → map colors and summary cards should reflect DB
2. Home: Immunization scorecard should match `CPAB_PCT` averages

**Agent can help**
- Wire any remaining mock data to live endpoints
- Fix name normalization (map GeoJSON vs DB location names)

**Exit criteria:** No mock/fake numbers on Overview/Home for Immunization test month.

---

## Thursday — Polish & access control

**You do**
1. Log in as `admin`, `jsmith` (program_manager) — confirm menus match role
2. Quick pass: Coverage + Rankings for province-level story (one period)
3. Management → History shows your test upload

**Agent can help**
- Small UI fixes, loading/error states
- Hide or gate pages not ready for Track 1 demo

**Exit criteria:** Demo path works: Login → Upload → Approve → Overview → Indicator Report.

---

## Friday — Deploy prep (ICTU)

**You do**
1. List what ICTU must install: Docker, Python deps, Node build, ports, firewall
2. Decide: remove `dev`/`dev` bypass before or right after first deploy
3. Dry-run: `run shutdown protocols` (docs pushed to GitHub)

**Agent can help**
- `requirements.txt` / deploy README for ICTU
- `.env.example` (no real secrets)
- Production checklist in `docs/`

**Exit criteria:** Another person could follow your deploy doc without guessing.

---

## Daily habits (every work day)

```text
Morning:  run startup protocols
Evening:  run shutdown protocols
Stuck:    run session health check
```

---

## Success at end of week

- [ ] One approved Immunization upload verified in Indicator Report
- [ ] Overview + Home show real province-level Immunization data
- [ ] Demo script written (5 steps for higher ops)
- [ ] Deploy checklist ready for ICTU
- [ ] Memory bank + GitHub updated via shutdown protocol

---

## What to tell the agent each day

| Day | Example prompt |
|-----|----------------|
| Mon | “Upload approved but Binalbagan CPAB Male is wrong — trace parser to report” |
| Tue | “List which endpoints Overview and Home should use” |
| Wed | “Wire Overview summary cards to real coverage API” |
| Thu | “Program manager should not see X — check RBAC” |
| Fri | “Write ICTU deploy checklist from our docker-compose setup” |

---

## If you fall behind

Drop order: Rankings polish → Coverage polish → keep **upload trust + Overview + deploy doc**.

Never drop: **approve workflow** and **Indicator Report verification**.
