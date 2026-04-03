/* =========================================================
   QueryVault — script.js
   · Page switcher (Docs / Dashboard / Auth / Rate Limits)
   · Endpoint switcher (sidebar + sub-tabs in sync)
   · Fake API tester (Send button → realistic JSON response)
   · Chart.js dashboard bar chart
   · Recent requests table (auto-generates rows)
   · Rate limit live animation (setInterval)
   · Copy-to-clipboard for API keys
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initPageSwitcher();
  initEndpointSwitcher();
  initCopyButtons();
  loadEndpoint("get-users"); // default docs view
  initDashboardChart();
  initRecentRequests();
  initRateLimitAnimation();
  initScrollReveal();
});

/* ═══════════════════════════════════════════════════════════
   1. PAGE SWITCHER — scrolls to sections instead of hiding
   ═══════════════════════════════════════════════════════════ */
function initPageSwitcher() {
  const tabs = document.querySelectorAll(".ptab");

  // Click → smooth scroll to the target section
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.page;
      const section = document.getElementById("page-" + target);
      if (section) section.scrollIntoView({ behavior: "smooth" });
    });
  });

  // IntersectionObserver → highlight active tab as user scrolls
  const sections = document.querySelectorAll(".page-section");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id.replace("page-", "");
          tabs.forEach((t) =>
            t.classList.toggle("active", t.dataset.page === id),
          );
        }
      });
    },
    { rootMargin: "-60px 0px -60% 0px", threshold: 0 },
  );

  sections.forEach((s) => observer.observe(s));
}

/* ═══════════════════════════════════════════════════════════
   2. ENDPOINT SWITCHER (Docs page)
   Syncs the top sub-tabs AND the sidebar items
   ═══════════════════════════════════════════════════════════ */
function initEndpointSwitcher() {
  // Top sub-tabs
  document.querySelectorAll(".eptab").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".eptab")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      syncSidebar(btn.dataset.ep);
      loadEndpoint(btn.dataset.ep);
    });
  });

  // Sidebar items
  document.querySelectorAll(".sb-ep-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".sb-ep-item")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      syncEptab(btn.dataset.ep);
      loadEndpoint(btn.dataset.ep);
    });
  });
}

function syncSidebar(ep) {
  document.querySelectorAll(".sb-ep-item").forEach((b) => {
    b.classList.toggle("active", b.dataset.ep === ep);
  });
}
function syncEptab(ep) {
  document.querySelectorAll(".eptab").forEach((b) => {
    b.classList.toggle("active", b.dataset.ep === ep);
  });
}

/* ═══════════════════════════════════════════════════════════
   3. ENDPOINT DEFINITIONS
   Each entry has: method, path, color, description,
   params[], fakeResponse (the JSON object to display)
   ═══════════════════════════════════════════════════════════ */
const ENDPOINTS = {
  "get-users": {
    method: "GET",
    methodClass: "text-green-400",
    path: "/v1/users",
    description:
      "Returns a paginated list of all users in your workspace. Supports filtering by role and status.",
    defaultUrl: "https://api.queryvault.dev/v1/users?limit=10",
    params: [
      {
        name: "limit",
        type: "integer",
        req: false,
        desc: "Max records returned (default 20)",
      },
      {
        name: "page",
        type: "integer",
        req: false,
        desc: "Page offset for pagination",
      },
      {
        name: "role",
        type: "string",
        req: false,
        desc: "Filter by role: admin | member",
      },
      {
        name: "Authorization",
        type: "header",
        req: true,
        desc: "Bearer tg_query_live_••••",
      },
    ],
    fakeResponse: {
      status: 200,
      statusText: "200 OK",
      body: `{
  <span class="json-key">"status"</span>: <span class="json-num">200</span>,
  <span class="json-key">"data"</span>: [
    { <span class="json-key">"id"</span>: <span class="json-str">"usr_01HX..."</span>, <span class="json-key">"name"</span>: <span class="json-str">"Ada Lovelace"</span>, <span class="json-key">"role"</span>: <span class="json-str">"admin"</span> },
    { <span class="json-key">"id"</span>: <span class="json-str">"usr_02YK..."</span>, <span class="json-key">"name"</span>: <span class="json-str">"Alan Turing"</span>, <span class="json-key">"role"</span>: <span class="json-str">"member"</span> }
  ],
  <span class="json-key">"total"</span>: <span class="json-num">248</span>,
  <span class="json-key">"page"</span>: <span class="json-num">1</span>
}`,
    },
  },

  "get-user-id": {
    method: "GET",
    methodClass: "text-green-400",
    path: "/v1/users/:id",
    description:
      "Fetch a single user by their unique ID. Returns 404 if the user does not exist.",
    defaultUrl: "https://api.queryvault.dev/v1/users/usr_01HX",
    params: [
      { name: "id", type: "string", req: true, desc: "User ID (path param)" },
      {
        name: "Authorization",
        type: "header",
        req: true,
        desc: "Bearer tg_query_live_••••",
      },
    ],
    fakeResponse: {
      status: 200,
      statusText: "200 OK",
      body: `{
  <span class="json-key">"id"</span>: <span class="json-str">"usr_01HX"</span>,
  <span class="json-key">"name"</span>: <span class="json-str">"Ada Lovelace"</span>,
  <span class="json-key">"email"</span>: <span class="json-str">"ada@queryvault.dev"</span>,
  <span class="json-key">"role"</span>: <span class="json-str">"admin"</span>,
  <span class="json-key">"created_at"</span>: <span class="json-str">"2024-01-15T09:32:00Z"</span>
}`,
    },
  },

  "post-users": {
    method: "POST",
    methodClass: "text-amber-400",
    path: "/v1/users",
    description:
      "Create a new user in your workspace. Returns the created user object with assigned ID.",
    defaultUrl: "https://api.queryvault.dev/v1/users",
    params: [
      {
        name: "name",
        type: "string",
        req: true,
        desc: "Full name of the user",
      },
      {
        name: "email",
        type: "string",
        req: true,
        desc: "Unique email address",
      },
      {
        name: "role",
        type: "string",
        req: false,
        desc: "admin | member (default: member)",
      },
      {
        name: "Authorization",
        type: "header",
        req: true,
        desc: "Bearer tg_query_live_••••",
      },
    ],
    fakeResponse: {
      status: 201,
      statusText: "201 Created",
      body: `{
  <span class="json-key">"id"</span>: <span class="json-str">"usr_09ZQ..."</span>,
  <span class="json-key">"name"</span>: <span class="json-str">"Grace Hopper"</span>,
  <span class="json-key">"email"</span>: <span class="json-str">"grace@queryvault.dev"</span>,
  <span class="json-key">"role"</span>: <span class="json-str">"member"</span>,
  <span class="json-key">"created_at"</span>: <span class="json-str">"2026-03-15T12:00:00Z"</span>
}`,
    },
  },

  "delete-user": {
    method: "DELETE",
    methodClass: "text-red-400",
    path: "/v1/users/:id",
    description:
      "Permanently delete a user. This action cannot be undone. Requires admin role.",
    defaultUrl: "https://api.queryvault.dev/v1/users/usr_01HX",
    params: [
      {
        name: "id",
        type: "string",
        req: true,
        desc: "User ID to delete (path param)",
      },
      {
        name: "Authorization",
        type: "header",
        req: true,
        desc: "Bearer tg_query_live_•••• (admin only)",
      },
    ],
    fakeResponse: {
      status: 204,
      statusText: "204 No Content",
      body: `<span class="json-null">// 204 No Content — user deleted successfully</span>`,
    },
  },

  "post-login": {
    method: "POST",
    methodClass: "text-amber-400",
    path: "/auth/login",
    description:
      "Authenticate with email and password. Returns a signed JWT access token valid for 3600 seconds.",
    defaultUrl: "https://api.queryvault.dev/auth/login",
    params: [
      {
        name: "email",
        type: "string",
        req: true,
        desc: "Registered email address",
      },
      {
        name: "password",
        type: "string",
        req: true,
        desc: "Account password (min 8 chars)",
      },
    ],
    fakeResponse: {
      status: 200,
      statusText: "200 OK",
      body: `{
  <span class="json-key">"token"</span>: <span class="json-str">"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."</span>,
  <span class="json-key">"expires_in"</span>: <span class="json-num">3600</span>,
  <span class="json-key">"token_type"</span>: <span class="json-str">"Bearer"</span>,
  <span class="json-key">"user_id"</span>: <span class="json-str">"usr_01HX"</span>
}`,
    },
  },

  "post-refresh": {
    method: "POST",
    methodClass: "text-amber-400",
    path: "/auth/refresh",
    description:
      "Refresh an expired access token using a valid refresh token. Returns a new token pair.",
    defaultUrl: "https://api.queryvault.dev/auth/refresh",
    params: [
      {
        name: "refresh_token",
        type: "string",
        req: true,
        desc: "The refresh token from login response",
      },
    ],
    fakeResponse: {
      status: 200,
      statusText: "200 OK",
      body: `{
  <span class="json-key">"token"</span>: <span class="json-str">"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new..."</span>,
  <span class="json-key">"expires_in"</span>: <span class="json-num">3600</span>,
  <span class="json-key">"refresh_token"</span>: <span class="json-str">"rt_newtoken..."</span>
}`,
    },
  },

  "get-analytics": {
    method: "GET",
    methodClass: "text-green-400",
    path: "/v1/analytics",
    description:
      "Returns aggregate API usage stats for the last 30 days. Includes request count, uptime, and error rate.",
    defaultUrl: "https://api.queryvault.dev/v1/analytics",
    params: [
      {
        name: "period",
        type: "string",
        req: false,
        desc: "7d | 30d | 90d (default: 30d)",
      },
      {
        name: "Authorization",
        type: "header",
        req: true,
        desc: "Bearer tg_query_live_••••",
      },
    ],
    fakeResponse: {
      status: 200,
      statusText: "200 OK",
      body: `{
  <span class="json-key">"requests"</span>: <span class="json-num">1840000</span>,
  <span class="json-key">"uptime"</span>: <span class="json-num">99.97</span>,
  <span class="json-key">"avg_latency_ms"</span>: <span class="json-num">142</span>,
  <span class="json-key">"error_rate"</span>: <span class="json-num">0.03</span>,
  <span class="json-key">"period"</span>: <span class="json-str">"30d"</span>
}`,
    },
  },

  "get-analytics-events": {
    method: "GET",
    methodClass: "text-green-400",
    path: "/v1/analytics/events",
    description:
      "Returns a stream of the most recent API events for your workspace. Useful for audit logs.",
    defaultUrl: "https://api.queryvault.dev/v1/analytics/events?limit=5",
    params: [
      {
        name: "limit",
        type: "integer",
        req: false,
        desc: "Number of events to return (max 100)",
      },
      {
        name: "Authorization",
        type: "header",
        req: true,
        desc: "Bearer tg_query_live_••••",
      },
    ],
    fakeResponse: {
      status: 200,
      statusText: "200 OK",
      body: `{
  <span class="json-key">"events"</span>: [
    { <span class="json-key">"type"</span>: <span class="json-str">"GET /v1/users"</span>, <span class="json-key">"status"</span>: <span class="json-num">200</span>, <span class="json-key">"ms"</span>: <span class="json-num">134</span> },
    { <span class="json-key">"type"</span>: <span class="json-str">"POST /auth/login"</span>, <span class="json-key">"status"</span>: <span class="json-num">200</span>, <span class="json-key">"ms"</span>: <span class="json-num">88</span> },
    { <span class="json-key">"type"</span>: <span class="json-str">"DELETE /v1/users/:id"</span>, <span class="json-key">"status"</span>: <span class="json-num">204</span>, <span class="json-key">"ms"</span>: <span class="json-num">61</span> }
  ],
  <span class="json-key">"total"</span>: <span class="json-num">18402</span>
}`,
    },
  },
};

/* Fake response map keyed by URL fragment */
const URL_RESPONSES = {
  "/v1/users": ENDPOINTS["get-users"].fakeResponse,
  "/users/:id": ENDPOINTS["get-user-id"].fakeResponse,
  "/auth/login": ENDPOINTS["post-login"].fakeResponse,
  "/auth/refresh": ENDPOINTS["post-refresh"].fakeResponse,
  "/analytics/events": ENDPOINTS["get-analytics-events"].fakeResponse,
  "/analytics": ENDPOINTS["get-analytics"].fakeResponse,
  default: {
    status: 404,
    statusText: "404 Not Found",
    body: `{ <span class="json-key">"error"</span>: <span class="json-str">"404 Not Found"</span>, <span class="json-key">"message"</span>: <span class="json-str">"Endpoint does not exist"</span> }`,
  },
};

/* ═══════════════════════════════════════════════════════════
   4. LOAD ENDPOINT into docs main panel
   ═══════════════════════════════════════════════════════════ */
function loadEndpoint(epKey) {
  const ep = ENDPOINTS[epKey];
  const main = document.getElementById("docs-main");
  if (!ep || !main) return;

  const statusClass = `status-${ep.fakeResponse.status}`;

  main.innerHTML = `
    <!-- Endpoint title -->
    <div class="flex items-center gap-4 mb-3 reveal reveal-left">
      <span class="font-mono font-bold text-[22px] ${ep.methodClass}">${ep.method}</span>
      <span class="font-mono text-[22px] text-white">${ep.path}</span>
    </div>
    <p class="text-[15px] text-white/40 mb-8 leading-relaxed reveal reveal-fade reveal-d1">${ep.description}</p>

    <!-- Try It panel -->
    <div class="bg-[#111827] border border-white/[0.06] rounded-xl p-6 mb-8 reveal reveal-scale reveal-d2">
      <p class="font-mono text-[13px] text-white/35 tracking-[0.22em] mb-5">// TRY IT LIVE</p>
      <div class="flex gap-3 mb-5">
        <input id="try-url" type="text" value="${ep.defaultUrl}"
               class="flex-1 bg-slate-950 border border-white/10 rounded-md px-4 py-3
                      font-mono text-[14px] text-white/70 outline-none focus:border-indigo-500/40
                      transition-colors" />
        <button id="try-send"
                class="bg-indigo-500 hover:bg-indigo-400 text-white text-[14px] font-bold
                       px-4 py-3 rounded-md transition-colors whitespace-nowrap">
          Send →
        </button>
      </div>

      <!-- Response box -->
      <div id="try-response" class="bg-[#0a0f1a] border border-white/[0.06] rounded-md p-5 hidden">
        <div class="flex items-center gap-3 mb-4">
           <span id="resp-status" class="font-mono text-[13px] font-bold px-3 py-1 rounded ${statusClass}">
            ${ep.fakeResponse.statusText}
           </span>
           <span id="resp-time" class="font-mono text-[13px] text-white/25"></span>
        </div>
        <div class="font-mono text-[13px] text-white/55 leading-loose" id="resp-body">
          ${ep.fakeResponse.body}
        </div>
      </div>
    </div>

    <!-- Params table -->
    <div class="reveal reveal-fade reveal-d3">
      <p class="font-mono text-[13px] text-white/25 tracking-[0.22em] mb-5">// QUERY PARAMETERS</p>
      <table class="w-full border-collapse text-[13px]">
        <thead>
          <tr class="border-b border-white/[0.06]">
            <th class="font-mono text-[11px] text-white/25 text-left pb-3 pr-6 tracking-[0.1em]">PARAM</th>
            <th class="font-mono text-[11px] text-white/25 text-left pb-3 pr-6 tracking-[0.1em]">TYPE</th>
            <th class="font-mono text-[11px] text-white/25 text-left pb-3 pr-6 tracking-[0.1em]">REQ</th>
            <th class="font-mono text-[11px] text-white/25 text-left pb-3 tracking-[0.1em]">DESCRIPTION</th>
          </tr>
        </thead>
        <tbody>
          ${ep.params
            .map(
              (p) => `
            <tr class="border-b border-white/[0.03]">
              <td class="font-mono text-slate-200 py-3 pr-6">${p.name}</td>
              <td class="py-3 pr-6">
                <span class="font-mono text-[11px] bg-white/5 text-white/40 px-2 py-1 rounded">${p.type}</span>
              </td>
              <td class="py-3 pr-6 text-red-400 text-[11px]">${p.req ? "required" : ""}</td>
              <td class="text-white/45 py-3">${p.desc}</td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;

  // Wire up Send button
  document.getElementById("try-send").addEventListener("click", () => {
    sendFakeRequest(ep);
  });

  // Re-init reveal observer for the newly injected content
  initScrollReveal();
}

/* ═══════════════════════════════════════════════════════════
   5. FAKE API TESTER — Send button handler
   ═══════════════════════════════════════════════════════════ */
function sendFakeRequest(ep) {
  const urlInput = document.getElementById("try-url");
  const respBox = document.getElementById("try-response");
  const respBody = document.getElementById("resp-body");
  const respTime = document.getElementById("resp-time");
  const respStat = document.getElementById("resp-status");
  const sendBtn = document.getElementById("try-send");

  const url = urlInput.value.trim();

  // Loading state
  sendBtn.textContent = "...";
  sendBtn.disabled = true;
  respBox.classList.add("hidden");

  // Simulate network latency
  const latency = Math.round(80 + Math.random() * 140);

  setTimeout(() => {
    // Match URL to a response
    const matchKey =
      Object.keys(URL_RESPONSES).find((k) => url.includes(k)) ?? "default";
    const resp = URL_RESPONSES[matchKey];

    // Update DOM
    respStat.textContent = resp.statusText;
    respStat.className = `font-mono text-[9px] font-bold px-2 py-0.5 rounded status-${resp.status}`;
    respTime.textContent = `${latency}ms · ${(Math.random() * 1.5 + 0.5).toFixed(1)}kb`;
    respBody.innerHTML = resp.body;

    respBox.classList.remove("hidden");
    sendBtn.textContent = "Send →";
    sendBtn.disabled = false;
  }, latency);
}

/* ═══════════════════════════════════════════════════════════
   6. DASHBOARD CHART (Chart.js)
   ═══════════════════════════════════════════════════════════ */
let chartInstance = null;

function initDashboardChart() {
  const canvas = document.getElementById("dash-chart");
  if (!canvas || typeof Chart === "undefined") return;

  // Destroy previous instance if switching pages
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  const labels = [
    "Mar 2",
    "Mar 3",
    "Mar 4",
    "Mar 5",
    "Mar 6",
    "Mar 7",
    "Mar 8",
    "Mar 9",
    "Mar 10",
    "Mar 11",
    "Mar 12",
    "Mar 13",
    "Mar 14",
    "Mar 15",
  ];
  const data = [35, 52, 48, 61, 57, 73, 68, 89, 76, 83, 74, 92, 100, 90];

  chartInstance = new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: data.map((v, i) =>
            v === Math.max(...data) ? "#818cf8" : "rgba(99,102,241,0.65)",
          ),
          borderRadius: 3,
          borderSkipped: false,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#111827",
          borderColor: "rgba(255,255,255,0.08)",
          borderWidth: 1,
          titleColor: "#a5b4fc",
          bodyColor: "rgba(255,255,255,0.6)",
          titleFont: { family: "Space Mono", size: 10 },
          bodyFont: { family: "Space Mono", size: 10 },
          callbacks: {
            label: (ctx) => ` ${ctx.parsed.y}k requests`,
          },
        },
      },
      scales: {
        x: {
          grid: { color: "rgba(255,255,255,0.04)" },
          ticks: {
            color: "rgba(255,255,255,0.2)",
            font: { family: "Space Mono", size: 8 },
          },
        },
        y: {
          grid: { color: "rgba(255,255,255,0.04)" },
          ticks: {
            color: "rgba(255,255,255,0.2)",
            font: { family: "Space Mono", size: 8 },
            callback: (v) => v + "k",
          },
        },
      },
    },
  });
}

/* ═══════════════════════════════════════════════════════════
   7. RECENT REQUESTS TABLE (dashboard)
   ═══════════════════════════════════════════════════════════ */
function initRecentRequests() {
  const tbody = document.getElementById("recent-requests-body");
  if (!tbody) return;

  const rows = [
    { ep: "GET /v1/users", status: 200, latency: 134, time: "2s ago" },
    { ep: "POST /auth/login", status: 200, latency: 88, time: "5s ago" },
    { ep: "DELETE /v1/users/:id", status: 204, latency: 61, time: "12s ago" },
    { ep: "GET /v1/analytics", status: 200, latency: 192, time: "28s ago" },
    { ep: "POST /v1/users", status: 201, latency: 110, time: "44s ago" },
    { ep: "GET /v1/users/:id", status: 404, latency: 42, time: "1m ago" },
    { ep: "POST /auth/refresh", status: 200, latency: 77, time: "2m ago" },
  ];

  const statusColour = (s) => {
    if (s < 300) return "text-green-400";
    if (s < 400) return "text-indigo-400";
    if (s < 500) return "text-amber-400";
    return "text-red-400";
  };

  tbody.innerHTML = rows
    .map(
      (r) => `
    <tr class="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
      <td class="font-mono text-white/60 py-2">${r.ep}</td>
      <td class="py-2 ${statusColour(r.status)} font-mono">${r.status}</td>
      <td class="font-mono text-white/40 py-2">${r.latency}ms</td>
      <td class="text-white/25 py-2">${r.time}</td>
    </tr>
  `,
    )
    .join("");
}

/* ═══════════════════════════════════════════════════════════
   8. RATE LIMIT LIVE ANIMATION
   "Requests this minute" slowly increments — looks live
   ═══════════════════════════════════════════════════════════ */
function initRateLimitAnimation() {
  let current = 28;
  const limit = 100;

  const bar = document.getElementById("rl-min-bar");
  const label = document.getElementById("rl-min-label");

  if (!bar || !label) return;

  setInterval(() => {
    // Randomly increment by 1–3 per tick, reset at limit
    current =
      current >= limit ? 0 : current + Math.floor(Math.random() * 3) + 1;
    const pct = Math.min((current / limit) * 100, 100);

    bar.style.width = pct + "%";
    label.textContent = `${current} / ${limit}`;

    // Switch colour when getting close
    bar.classList.remove(
      "bg-green-500",
      "bg-amber-500",
      "bg-red-500",
      "danger",
    );
    if (pct < 50) bar.classList.add("bg-green-500");
    else if (pct < 85) bar.classList.add("bg-amber-500");
    else bar.classList.add("bg-red-500", "danger");
  }, 1200);
}

/* ═══════════════════════════════════════════════════════════
   9. COPY BUTTONS (Auth page)
   ═══════════════════════════════════════════════════════════ */
function initCopyButtons() {
  document.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key =
        btn.dataset.key || btn.closest("[data-key]")?.dataset.key || "";
      navigator.clipboard.writeText(key).then(() => {
        btn.textContent = "Copied!";
        btn.classList.add("copied");
        setTimeout(() => {
          btn.textContent = "Copy";
          btn.classList.remove("copied");
        }, 2000);
      });
    });
  });
}

/* ═══════════════════════════════════════════════════════════
   10. SCROLL REVEAL & NUMBER ANIMATIONS
   ═══════════════════════════════════════════════════════════ */
function animateCountUp(el) {
  const target = parseFloat(el.getAttribute("data-target"));
  if (isNaN(target)) return;
  const suffix = el.getAttribute("data-suffix") || "";
  const decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
  const duration = 2000; // 2s

  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    
    // easeOutExpo
    const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    const current = easeProgress * target;
    
    el.textContent = current.toFixed(decimals) + suffix;

    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      el.textContent = target.toFixed(decimals) + suffix;
    }
  };

  window.requestAnimationFrame(step);
}

function initScrollReveal() {
  const revealables = document.querySelectorAll(
    ".reveal, .reveal-fade, .reveal-scale, .reveal-left, .reveal-right",
  );

  if (!revealables.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");

          // Check if this element or its children have count-up
          if (entry.target.classList.contains("count-up")) {
            animateCountUp(entry.target);
          }
          const countUps = entry.target.querySelectorAll(".count-up");
          countUps.forEach(animateCountUp);

          observer.unobserve(entry.target); // animate only once
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
  );

  revealables.forEach((el) => observer.observe(el));
}
