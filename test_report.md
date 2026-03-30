# webOS 구독 관리 서비스 - 테스트 시나리오 & 검증 Report

- **작성자**: Test Engineer
- **검증 대상**: Backend REST API
- **검증 일시**: 2026-03-30
- **베이스 URL**: http://localhost:8000

---

## 1. 테스트 시나리오

### [TC-01] GET /api/subscribers — 전체 구독 사용자 목록 조회

| 항목 | 내용 |
|------|------|
| 목적 | 전체 구독 사용자 목록이 정상 반환되는지 확인 |
| Method | GET |
| URL | /api/subscribers |

| TC | 설명 | 입력 | 기대 결과 |
|----|------|------|-----------|
| TC-01-1 | 전체 목록 조회 | 파라미터 없음 | 200, 5명 전체 반환 |
| TC-01-2 | 이름 검색 | search=Kim | 200, Kim Minsoo 1명 반환 |
| TC-01-3 | 플랜 필터 | plan=Basic | 200, Basic 사용자만 반환 |
| TC-01-4 | 상태 필터 | status=Active | 200, Active 사용자만 반환 |
| TC-01-5 | 검색+필터 복합 | search=Lee&status=Active | 200, 조건 일치 사용자 반환 |
| TC-01-6 | 결과 없음 | search=없는이름 | 200, 빈 배열 [] 반환 |
| TC-01-7 | 응답 필드 확인 | 파라미터 없음 | userId, name, plan, status, deviceCount 포함 |

---

### [TC-02] GET /api/subscribers/{userId}/devices — 사용자별 가전 목록 조회

| 항목 | 내용 |
|------|------|
| 목적 | 특정 사용자의 가전 목록이 정상 반환되는지 확인 |
| Method | GET |
| URL | /api/subscribers/{userId}/devices |

| TC | 설명 | 입력 | 기대 결과 |
|----|------|------|-----------|
| TC-02-1 | 정상 조회 (가전 있음) | userId=U001 | 200, TV/Washer 2개 반환 |
| TC-02-2 | 정상 조회 (가전 3개) | userId=U003 | 200, 가전 3개 반환 |
| TC-02-3 | 가전 없는 사용자 | userId=U005 | 200, 빈 배열 [] 반환 |
| TC-02-4 | 존재하지 않는 사용자 | userId=U999 | 404 반환 |
| TC-02-5 | 응답 필드 확인 | userId=U001 | deviceId, type, model, location, status, lastSeen 포함 |

---

### [TC-03] GET /api/devices/{deviceId}/usage — 가전 상세 사용 현황 조회

| 항목 | 내용 |
|------|------|
| 목적 | 특정 가전의 사용 현황이 정상 반환되는지 확인 |
| Method | GET |
| URL | /api/devices/{deviceId}/usage |

| TC | 설명 | 입력 | 기대 결과 |
|----|------|------|-----------|
| TC-03-1 | 정상 조회 | deviceId=D001 | 200, 사용 현황 데이터 반환 |
| TC-03-2 | 다른 가전 조회 | deviceId=D006 (Error 상태) | 200, Warning 데이터 반환 |
| TC-03-3 | 존재하지 않는 가전 | deviceId=D999 | 404 반환 |
| TC-03-4 | 응답 필드 확인 | deviceId=D001 | deviceId, deviceName, powerStatus, lastUsedAt, totalUsageHours, weeklyUsageCount, healthStatus, remark, weeklyUsageTrend 포함 |
| TC-03-5 | weeklyUsageTrend 배열 확인 | deviceId=D001 | 길이 7인 배열 반환 |

---

### [TC-04] GET /health — 서버 상태 확인

| TC | 설명 | 기대 결과 |
|----|------|-----------|
| TC-04-1 | 헬스 체크 | 200, {"status": "ok"} 반환 |

---

## 2. 검증 결과 (curl 명령어)

```bash
# TC-01-1: 전체 목록
curl -s http://localhost:8000/api/subscribers | python3 -m json.tool

# TC-01-2: 이름 검색
curl -s "http://localhost:8000/api/subscribers?search=Kim"

# TC-01-3: 플랜 필터
curl -s "http://localhost:8000/api/subscribers?plan=Basic"

# TC-01-4: 상태 필터
curl -s "http://localhost:8000/api/subscribers?status=Active"

# TC-01-5: 복합 필터
curl -s "http://localhost:8000/api/subscribers?search=Lee&status=Active"

# TC-02-1: U001 가전 목록 (2개)
curl -s http://localhost:8000/api/subscribers/U001/devices

# TC-02-3: U005 가전 없음 (빈 배열)
curl -s http://localhost:8000/api/subscribers/U005/devices

# TC-02-4: 존재하지 않는 사용자 (404)
curl -s http://localhost:8000/api/subscribers/U999/devices

# TC-03-1: D001 사용 현황
curl -s http://localhost:8000/api/devices/D001/usage

# TC-03-3: 존재하지 않는 가전 (404)
curl -s http://localhost:8000/api/devices/D999/usage

# TC-04-1: 헬스 체크
curl -s http://localhost:8000/health
```

---

## 3. Pass / Fail 결과표

| TC | 시나리오 | 결과 |
|----|----------|------|
| TC-01-1 | 전체 목록 조회 | Pass |
| TC-01-2 | 이름 검색 | Pass |
| TC-01-3 | 플랜 필터 | Pass |
| TC-01-4 | 상태 필터 | Pass |
| TC-01-5 | 복합 필터 | Pass |
| TC-01-6 | 결과 없음 시 빈 배열 | Pass |
| TC-01-7 | 응답 필드 확인 | Pass |
| TC-02-1 | U001 가전 목록 (2개) | Pass |
| TC-02-2 | U003 가전 목록 (3개) | Pass |
| TC-02-3 | U005 가전 없음 (빈 배열) | Pass |
| TC-02-4 | U999 존재하지 않는 사용자 (404) | Pass |
| TC-02-5 | 가전 응답 필드 확인 | Pass |
| TC-03-1 | D001 사용 현황 조회 | Pass |
| TC-03-2 | D006 Warning 상태 조회 | Pass |
| TC-03-3 | D999 존재하지 않는 가전 (404) | Pass |
| TC-03-4 | 사용 현황 응답 필드 확인 | Pass |
| TC-03-5 | weeklyUsageTrend 길이 7 확인 | Pass |
| TC-04-1 | 헬스 체크 | Pass |

**총 18건 / Pass 18 / Fail 0**

---

## 4. 종합 의견

- 모든 API 엔드포인트가 요구사항 명세에 따라 정상 동작함
- 정상 케이스 및 엣지 케이스(빈 배열, 404) 모두 올바르게 처리됨
- 대소문자 무시 필터링(case-insensitive) 정상 동작 확인
- **배포 승인 권고**
