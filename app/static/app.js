// =============================================================================
// 전역 변수
// =============================================================================
let subscribers = [];
let currentDevices = [];
let selectedUserId = null;
let selectedDeviceId = null;
let usageChart = null;


// =============================================================================
// [요구사항 #3] 상태 기반 Badge 스타일
// =============================================================================
function badgeClass(value) {
    const v = (value || "").toLowerCase();

    if (["active", "online", "normal"].includes(v)) return "badge status-active";
    if (["paused", "standby"].includes(v)) return "badge status-paused";
    if (["expired", "error", "warning"].includes(v)) return "badge status-expired";
    if (v === "offline") return "badge status-offline";
    if (["on", "cleaning"].includes(v)) return "badge status-on";
    if (v === "off") return "badge status-off";
    return "badge";
}


// =============================================================================
// [요구사항 #1] 구독 사용자 조회 + 검색/필터
// =============================================================================

async function fetchSubscribers() {
    const res = await fetch("/api/subscribers");
    subscribers = await res.json();
    renderSubscribers();
}

function renderSubscribers() {
    const tbody = document.getElementById("subscriber-body");
    const search = document.getElementById("subscriber-search").value.toLowerCase();
    const statusFilter = document.getElementById("subscriber-status-filter").value;

    const filtered = subscribers.filter((s) => {
        const matchesSearch =
            !search ||
            s.name.toLowerCase().includes(search) ||
            s.plan.toLowerCase().includes(search) ||
            s.status.toLowerCase().includes(search) ||
            s.userId.toLowerCase().includes(search);
        const matchesStatus = !statusFilter || s.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    tbody.innerHTML = filtered
        .map(
            (s) => `
        <tr class="clickable ${s.userId === selectedUserId ? "selected" : ""}" onclick="selectSubscriber('${s.userId}')">
            <td>${s.userId}</td>
            <td>${s.name}</td>
            <td>${s.plan}</td>
            <td><span class="${badgeClass(s.status)}">${s.status}</span></td>
            <td>${s.deviceCount}</td>
        </tr>`
        )
        .join("");
}


// =============================================================================
// [요구사항 #2] 사용자별 가전 목록 + 사용 현황 + 차트
// =============================================================================

async function selectSubscriber(userId) {
    selectedUserId = userId;
    selectedDeviceId = null;
    renderSubscribers();

    document.getElementById("usage-detail").classList.add("hidden");
    document.getElementById("usage-empty").classList.remove("hidden");
    document.getElementById("usage-empty").textContent = "Select a device to view usage details.";

    const res = await fetch(`/api/subscribers/${userId}/devices`);
    currentDevices = await res.json();
    renderDevices();
}

function renderDevices() {
    const emptyEl = document.getElementById("device-empty");
    const tableEl = document.getElementById("device-table");
    const tbody = document.getElementById("device-body");
    const search = document.getElementById("device-search").value.toLowerCase();
    const statusFilter = document.getElementById("device-status-filter").value;

    if (currentDevices.length === 0) {
        emptyEl.textContent = "No registered devices.";
        emptyEl.classList.remove("hidden");
        tableEl.classList.add("hidden");
        tbody.innerHTML = "";
        return;
    }

    const filtered = currentDevices.filter((d) => {
        const matchesSearch =
            !search ||
            d.type.toLowerCase().includes(search) ||
            d.model.toLowerCase().includes(search) ||
            d.status.toLowerCase().includes(search) ||
            d.deviceId.toLowerCase().includes(search) ||
            d.location.toLowerCase().includes(search);
        const matchesStatus = !statusFilter || d.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (filtered.length === 0) {
        emptyEl.textContent = "No devices matched your filter.";
        emptyEl.classList.remove("hidden");
        tableEl.classList.add("hidden");
        tbody.innerHTML = "";
        return;
    }

    emptyEl.classList.add("hidden");
    tableEl.classList.remove("hidden");

    tbody.innerHTML = filtered
        .map(
            (d) => `
        <tr class="clickable ${d.deviceId === selectedDeviceId ? "selected" : ""}" onclick="selectDevice('${d.deviceId}')">
            <td>${d.deviceId}</td>
            <td>${d.type}</td>
            <td>${d.model}</td>
            <td>${d.location}</td>
            <td><span class="${badgeClass(d.status)}">${d.status}</span></td>
        </tr>`
        )
        .join("");
}

async function selectDevice(deviceId) {
    selectedDeviceId = deviceId;
    renderDevices();

    const res = await fetch(`/api/devices/${deviceId}/usage`);
    const data = await res.json();

    document.getElementById("usage-empty").classList.add("hidden");
    document.getElementById("usage-detail").classList.remove("hidden");

    document.getElementById("usage-info").innerHTML = `
        <div class="label">Device ID</div><div class="value">${data.deviceId}</div>
        <div class="label">Device Name</div><div class="value">${data.deviceName}</div>
        <div class="label">Power Status</div><div class="value"><span class="${badgeClass(data.powerStatus)}">${data.powerStatus}</span></div>
        <div class="label">Last Used</div><div class="value">${data.lastUsedAt}</div>
        <div class="label">Total Usage Hours</div><div class="value">${data.totalUsageHours}h</div>
        <div class="label">Weekly Usage Count</div><div class="value">${data.weeklyUsageCount}</div>
        <div class="label">Health Status</div><div class="value"><span class="${badgeClass(data.healthStatus)}">${data.healthStatus}</span></div>
        <div class="label">Remark</div><div class="value">${data.remark}</div>
    `;

    renderUsageChart(data.weeklyUsageTrend);
}

function renderUsageChart(trend) {
    const ctx = document.getElementById("usageChart");

    if (usageChart) {
        usageChart.destroy();
    }

    usageChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            datasets: [
                {
                    label: "Usage Count",
                    data: trend,
                    backgroundColor: "rgba(31, 60, 136, 0.6)",
                    borderRadius: 4,
                },
            ],
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
        },
    });
}


// =============================================================================
// 이벤트 바인딩 + 초기화
// =============================================================================
function bindEvents() {
    document.getElementById("subscriber-search").addEventListener("input", renderSubscribers);
    document.getElementById("subscriber-status-filter").addEventListener("change", renderSubscribers);

    document.getElementById("device-search").addEventListener("input", renderDevices);
    document.getElementById("device-status-filter").addEventListener("change", renderDevices);
}

bindEvents();
fetchSubscribers();
