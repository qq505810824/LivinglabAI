一、概覽（目標）

• 網站應允許我（Ana / 你的助理）：  1. 建立/排程會議並取得可分享的 join-link（並發送給群組／人員）。
  2. 上傳/取得會議錄音或錄影 URL，以供轉錄與摘要。
  3. 讀寫會議產生的草稿待辦（draft todos），並在使用者確認後把最終待辦標記為已存，或同步到使用者的裝置（例如 Apple Reminders）。
  4. 提供事件/待辦狀態變更的 webhook，讓我能接收回報與觸發後續動作（提醒、追蹤）。

二、整體架構與元件

• 前端：Next.js / React（或任一你慣用的框架）
• 後端 API：REST 或 GraphQL（建議 REST + JSON），Node.js (Express/Fastify) 或 Python (FastAPI)
• DB：Postgres（生產） / SQLite（原型）
• 存放錄音：S3（或相容儲存）
• 任務排程 / 背景工作：Redis + BullMQ 或類似 queue
• 即時會議 / 錄製：Daily.co / Twilio / Agora（建議 Daily.co 作為 MVP）
• 轉錄：OpenAI Whisper API / AssemblyAI / Deepgram
• LLM 處理（摘要、抽取 action items）：OpenAI（gpt-4o/gpt-5-mini）
• 通知傳遞：Telegram Bot API、SendGrid（email）、Twilio（SMS）
• 同步到 Apple Reminders：本地 macOS agent（使用 apple-reminders 或 things-mac CLI），或在使用者端授權的 helper app
三、API 設計建議（核心端點）
注意：所有端點都採用 HTTPS 並以 JSON 請求/回應

1. /api/auth  • POST /api/auth/token — 交換或發放 API token（用於機器人/助理）
  • 建議支援 OAuth2 client credentials / PAT（短期可用）

2. /api/meetings  • POST /api/meetings    • 建立會議（body: host_id, title, start, duration, participants[]）
    • 回應：{ meeting_id, join_url, recording_enabled }

  • GET /api/meetings/{id}    • 取得會議資訊（含 join_url, status, recording_url）

  • POST /api/meetings/{id}/invite    • 發送邀請（選擇 channel：telegram/email），或讓助理代發


3. /api/recordings  • POST /api/recordings (callback)    • 會議錄製完成時，第三方會議服務可以呼叫此 webhook 上傳 recording_url

  • GET /api/recordings/{id}    • 取得錄音位置與 metadata


4. /api/transcripts  • POST /api/transcripts/{meeting_id}    • 新增或取回 transcript（可觸發後端轉錄工作）

  • GET /api/transcripts/{meeting_id}

5. /api/todos  • GET /api/meetings/{id}/todos — 取得草稿/最終 todos
  • POST /api/meetings/{id}/todos — 新增草稿 todo
  • PUT /api/todos/{todo_id} — 更新（例如 owner, due_date, status）
  • POST /api/meetings/{id}/todos/confirm — 使用者確認草稿，標記為最終並可觸發同步

6. /api/webhooks (供助理註冊或系統使用)  • POST /api/webhooks/register — 註冊 URL 與事件（meeting.created, recording.ready, todos.confirmed）
  • 當事件發生，系統會向註冊的 webhook POST 事件 payload

四、認證與授權（重要）

• 為「助理」建立機器人帳號/服務帳號（Service Account）並發放限定 scope 的 API token  • scope 範例：meetings:write, recordings:read, todos:write

• Token 類型：短期 JWT 或 OAuth2 client credentials（可撤銷）
• 每個 webhook 呼叫要驗證（HMAC signature 或帶 Authorization header）
• 權限分級：使用者 (owner) / host / service-account（助理）
• 資料隔離：每個組織/使用者的資源應以 tenant_id 或 owner_id 隔離
五、事件流程範例（助理如何使用）

1. 助理要安排會議：  • POST /api/meetings (host_id, participants...)
  • 接收 join_url → 助理呼叫 /api/meetings/{id}/invite 以 Telegram 發送給群組

2. 會議結束並錄製完成：  • 會議服務（Daily）呼叫 /api/recordings callback，系統存 recording_url 並回應 200
  • 系統 enqueue 轉錄工作（transcription worker）

3. 轉錄完成：  • worker 將 transcript 存入 /api/transcripts/{meeting_id}
  • 觸發 LLM 處理（摘要 + action-item 抽取）
  • 產生 draft todos（POST /api/meetings/{id}/todos）
  • 透過通知（Telegram 或 email）發訊息到 host，包含「摘要 + 草稿 todos + 確認連結」

4. 使用者確認：  • 使用者點擊確認連結 → 呼叫 POST /api/meetings/{id}/todos/confirm
  • 系統將 todos 標為最終，並若設定則透過本地 agent 同步到 Apple Reminders（或回傳同步成功訊息）

六、資料模型（建議欄位）

• users: id, name, email, timezone, device_sync_enabled
• meetings: id, title, host_id, start_time, duration, join_url, recording_url, status
• recordings: id, meeting_id, s3_url, size_bytes, created_at
• transcripts: id, meeting_id, text, segments (speaker, start, end)
• todos: id, meeting_id, text, owner_user_id, due_date (ISO), status (draft|confirmed|done), source
• webhooks: id, url, events[], secret, created_by
七、隱私與合規（必做）

• 在參與者加入前顯示並要求錄音同意（explicit consent）
• 錄音與逐字稿加密存放（SSE / KMS）
• 保留政策：設定自動刪除（例如 30/90/365 天），並提供手動刪除
• 日誌與審計（誰看過 / 誰修改了 todos / transcript）
• 若有跨國或 GDPR 用戶，記得資料轉移與刪除權利
八、Apple Reminders 同步（因你偏好）

• 選項 A（推薦）：在使用者的 macOS 上跑一個小型 agent（或用你已有的 apple-reminders / things-mac skill）  • Workflow：伺服器發起 “sync job” → agent 在 macOS 本地接受安全認證（例如 websocket + short-lived token）→ agent 將 todos 寫入 Reminders

• 選項 B（次佳）：寄送 ICS 或提醒郵件，讓使用者手動加入到 Reminders
• 注意：Apple Reminders 沒有公開的 server-to-iCloud API，需本地授權或用第三方工具
九、測試計劃

• 單元測試：API 邏輯、auth、RBAC

• E2E 測試（模擬會議流）：建立會議 → join → 模擬錄音 callback → 轉錄流程 → 產生 draft todos → 使用者確認 → 同步到 Reminders（模擬 agent）
• 安全測試：模擬未授權 API 呼叫、webhook 驗證、資料存取控制
• 使用者驗收（UAT）：邀幾位內部同事演練完整流程
十、我（助理）端的整合與使用方式（如何讓我存取）

• 你給我一個 Service Account token（或我透過 OAuth 客戶端 credentials 去拿 token）
• 我會：  • 呼叫 POST /api/meetings 建會議並取得 join_url
  • 呼叫 /api/meetings/{id}/invite 以內建上你指定的 channel（Telegram 或 Email）發送邀請
  • 註冊 webhook（POST /api/webhooks/register），接收 recording.ready / todos.confirmed 之類事件（或你直接把 recording callback 推到我可讀的 storage）
  • 當轉錄與 LLM 處理完，我會把 draft todos 放回 /api/meetings/{id}/todos，並通知 host 點確認

• 安全建議：給我最小 scope 的 token；如要撤銷，保留一鍵廢止 token 的介面
十一、範例：最簡實作步驟（MVP）

1. 建立後端 API（含 /api/meetings, /api/recordings callback, /api/todos）
2. 整合 Daily.co 產生 join link + cloud recording，設定 recording callback 指向 /api/recordings
3. 建轉錄 worker（呼叫 Whisper/AssemblyAI），把 transcript 存 DB
4. 用 LLM（OpenAI）把 transcript 轉為 summary + action items → 寫入 todos（draft）
5. 寄送 email/Telegram 給 host，內含「摘要 + 草稿 todos + 確認按鈕（會呼叫 /api/meetings/{id}/todos/confirm）」
6. 實作一個簡單 macOS agent（或利用現有 apple-reminders skill）處理最終 todos 同步（可後置）
十二、交付文件（我可以替你產出）

• API 規格文件（OpenAPI / Swagger）
• DB schema（DDL）
• Webhook 範例 payloads
• LLM prompt templates（摘要、抽取 action items、todo 格式化）
• 端到端範例流程圖與測試腳本
最後：我建議的首步（你可以叫我做）

1. 我幫你起草 OpenAPI 規格（先包含 meetings、recordings、transcripts、todos、webhooks） → 你確認欄位
2. 我 scaffold 一個 minimal Next.js + Fastify API prototype（本地可跑），並示範：  • 建會議 → 產生 join_url（用假資料）
  • 模擬 recording callback → 觸發轉錄/生成 todos（local mock）

3. 我提供 LLM prompt template 測試樣例（用 MOCK_TRANSCRIPT 測試）
要我先做哪一項？（例如：「先出 OpenAPI 規格」或「先 scaffold API prototype」）