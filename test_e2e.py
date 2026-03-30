import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


# =============================================================================
# TC-01: GET /api/subscribers
# =============================================================================

def test_get_all_subscribers():
    """TC-01-1: 전체 구독자 5명 반환"""
    res = client.get("/api/subscribers")
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 5

def test_subscriber_fields():
    """TC-01-7: 응답 필드 확인 (userId, name, plan, status, deviceCount)"""
    res = client.get("/api/subscribers")
    item = res.json()[0]
    for field in ["userId", "name", "plan", "status", "deviceCount"]:
        assert field in item

def test_search_by_name():
    """TC-01-2: 이름 검색 - search=Kim"""
    res = client.get("/api/subscribers?search=Kim")
    assert res.status_code == 200
    data = res.json()
    assert all("kim" in s["name"].lower() for s in data)

def test_filter_by_plan():
    """TC-01-3: 플랜 필터 - plan=Basic"""
    res = client.get("/api/subscribers?plan=Basic")
    assert res.status_code == 200
    data = res.json()
    assert all(s["plan"] == "Basic" for s in data)

def test_filter_by_status():
    """TC-01-4: 상태 필터 - status=Active"""
    res = client.get("/api/subscribers?status=Active")
    assert res.status_code == 200
    data = res.json()
    assert all(s["status"] == "Active" for s in data)

def test_filter_no_result():
    """TC-01-6: 결과 없으면 빈 배열 반환"""
    res = client.get("/api/subscribers?search=없는이름")
    assert res.status_code == 200
    assert res.json() == []


# =============================================================================
# TC-02: GET /api/subscribers/{userId}/devices
# =============================================================================

def test_get_devices_for_user_with_devices():
    """TC-02-1: U001 가전 2개 반환"""
    res = client.get("/api/subscribers/U001/devices")
    assert res.status_code == 200
    assert len(res.json()) == 2

def test_get_devices_empty_user():
    """TC-02-3: U005 가전 없음 - 빈 배열 반환"""
    res = client.get("/api/subscribers/U005/devices")
    assert res.status_code == 200
    assert res.json() == []

def test_get_devices_user_not_found():
    """TC-02-4: 존재하지 않는 사용자 - 404 반환"""
    res = client.get("/api/subscribers/U999/devices")
    assert res.status_code == 404

def test_device_fields():
    """TC-02-5: 가전 응답 필드 확인"""
    res = client.get("/api/subscribers/U001/devices")
    item = res.json()[0]
    for field in ["deviceId", "type", "model", "location", "status", "lastSeen"]:
        assert field in item


# =============================================================================
# TC-03: GET /api/devices/{deviceId}/usage
# =============================================================================

def test_get_device_usage():
    """TC-03-1: D001 사용 현황 정상 반환"""
    res = client.get("/api/devices/D001/usage")
    assert res.status_code == 200

def test_usage_fields():
    """TC-03-4: 사용 현황 응답 필드 확인"""
    res = client.get("/api/devices/D001/usage")
    data = res.json()
    for field in ["deviceId", "deviceName", "powerStatus", "lastUsedAt",
                  "totalUsageHours", "weeklyUsageCount", "healthStatus",
                  "remark", "weeklyUsageTrend"]:
        assert field in data

def test_weekly_usage_trend_length():
    """TC-03-5: weeklyUsageTrend 길이 7 (Mon~Sun)"""
    res = client.get("/api/devices/D001/usage")
    assert len(res.json()["weeklyUsageTrend"]) == 7

def test_get_device_usage_not_found():
    """TC-03-3: 존재하지 않는 가전 - 404 반환"""
    res = client.get("/api/devices/D999/usage")
    assert res.status_code == 404


# =============================================================================
# TC-04: GET /health
# =============================================================================

def test_health_check():
    """TC-04-1: 서버 상태 확인"""
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}
