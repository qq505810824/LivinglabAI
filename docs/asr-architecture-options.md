## 实时 ASR 架构方案对比（自建 vs 云厂商）

> 背景：当前项目使用 Next.js（App Router）+ API Routes 部署在 Vercel，仅有前端和轻量后端，没有类似 Munlingo 的长期运行后端服务。需要在此架构下实现「Streaming ASR（实时语音转文字）」以支持连续对话。

---

### 一、统一前提与约束

- **运行环境**
  - 前端与 API：Next.js（App Router）部署在 Vercel（Serverless / Edge Functions）。
  - 无常驻 Node 进程或 GPU 服务器；Serverless 函数执行时间和连接时长受限。
- **业务目标**
  - 支持实时语音对话：用户持续说话 → 实时转写 → 文字进入 Dify / LLM → Azure TTS 播放。
  - 希望尽量减少开发复杂度与运维成本，同时保证稳定性与可扩展性。

在此前提下，Streaming ASR 必须通过「长连接 + 持续推流」实现，而这类计算通常不适合直接跑在 Vercel Serverless 上，需要：

- 要么：自建一套独立 ASR 服务（部署在 VM / 容器 / 其他平台），Next.js 仅作为前端与路由层；
- 要么：直接使用云厂商或第三方提供的 Streaming ASR API（WebSocket / gRPC）。

---

### 二、方案一：自建 Streaming ASR 服务

#### 2.1 架构思路

1. **ASR 引擎选择**
   - 开源引擎：如 Whisper.cpp / faster-whisper / Vosk / Kaldi 等；
   - 自行封装为 HTTP / WebSocket 接口。
2. **部署方式**
   - 在云服务器（例如阿里云 / 腾讯云 / AWS / GCP）上部署常驻服务：
     - 单机 + GPU（如 A10 / T4）→ 支持更高并发和更低延迟；
     - 或 CPU-only（成本低但单路延迟高，适合并发不多的 MVP）。
3. **通信协议**
   - 提供 WebSocket 端点，例如：
     - `wss://asr.your-domain.com/stream?lang=zh`
   - 前端通过浏览器录音，将 PCM/WAV chunk 持续发送到该 WebSocket；
   - 服务端持续返回 partial / final 文本。
4. **与 Next.js 的关系**
   - Next.js (Vercel) 只负责：
     - 前端 UI（录音、字幕展示、状态）；
     - 管理 Dify 对话（`/api/conversations/message`）；
     - ASR 则直接由前端连接自建 ASR WebSocket，不经过 Vercel（减轻 Serverless 限制）。

#### 2.2 在现有框架上的落地方式（高层步骤）

1. **选择并包装 ASR 引擎**
   - 选定引擎（如 faster-whisper）：
     - 编写一个简单的 Python / Node / Go 服务：
       - 接收 WebSocket 音频流；
       - 按帧调用 ASR 引擎；
       - 推送 partial / final 文本到客户端。
2. **部署 ASR 服务**
   - 在云上开一台 VM（或 Kubernetes 集群）：
     - 配置 GPU（推荐）或 CPU；
     - 暴露 HTTPS + WebSocket 端点；
     - 配置域名与证书（例如 `asr.your-domain.com`）。
3. **前端接入（Next.js + Vercel）**
   - 在前端 Hook（如 `useStreamingASR`）中：
     - 通过 `navigator.mediaDevices.getUserMedia` 获取音频流；
     - 使用 `WebSocket` 直接连接 `wss://asr.your-domain.com/stream`；
     - `onmessage` 中解析 partial / final 文本，更新 `transcriptLive` 与对话列表；
   - 无需改动 Vercel 配置，ASR 通信不经 Vercel。
4. **安全与多租户**
   - 在 WebSocket 连接中添加鉴权参数：
     - 例如 `?token=JWT`，由 Next.js API 颁发；
     - ASR 服务验证 token，避免被滥用。

#### 2.3 优点

- **完全可控**
  - 模型版本、采样率、语言支持完全可自定义；
  - 可采用自训练 / 微调模型，满足特定领域（如企业内部术语）。
- **长期成本在高并发时更可控**
  - 对于高流量场景，自建 GPU 服务的单位成本可能低于按量付费的云 ASR；
  - 允许细粒度的性能优化（batching、量化等）。
- **无厂商锁定**
  - 可以随时更换模型或迁移到其他云，前端协议保持不变。

#### 2.4 缺点

- **运维与 DevOps 复杂度高**
  - 需要自行处理部署、监控、扩容、故障恢复、日志收集等；
  - 需要关注模型升级、安全补丁、GPU 驱动等底层问题。
- **前期研发成本高**
  - 需要 ASR / 音频工程经验（降噪、分片策略、延迟优化）；
  - 需要设计和实现稳定的 WebSocket 协议。
- **对小团队不友好**
  - 在产品早期，投入大量精力在基础设施上，可能分散业务开发资源。

---

### 三、方案二：使用云厂商 Streaming ASR 服务

#### 3.1 主流可选厂商（概览）

1. **Azure Cognitive Services – Speech to Text**
   - 与当前项目已使用的 **Azure TTS** 同属一个产品线，集成度高；
   - 提供 Streaming API（WebSocket / gRPC），支持中文与多语言；
   - 支持自定义语言模型和词表。

2. **Google Cloud Speech-to-Text**
   - 语音识别成熟度高，支持 streaming 模式；
   - 对长语音、多语言有良好支持。

3. **AWS Transcribe**
   - 与 AWS 生态整合良好，支持 streaming；
   - 商业级稳定性强。

4. **专注语音厂商（如 Deepgram / AssemblyAI 等）**
   - 通常提供非常简洁的 WebSocket 接口；
   - 对实时场景、嘈杂环境优化较好；
   - 文档和 SDK 面向前端开发者友好。

> 鉴于本项目已使用 Azure TTS，**在综合考虑集成成本与统一性时，Azure Speech-to-Text 是首选候选**。  
> 若更看重接入简单、专注语音质量，也可以考虑专门的 ASR 厂商（如 Deepgram / AssemblyAI）。

#### 3.2 在现有框架上的落地方式（以 Azure Speech 为例）

1. **开通 Azure Speech 服务**
   - 在 Azure Portal 创建 Speech 资源（同区域尽量与 TTS 所在资源一致）；  
   - 获取 `SPEECH_KEY` 与 `SPEECH_REGION`。
2. **生成前端可用的 token**
   - 出于安全考虑，不应在前端直接暴露长效 key；
   - 在 Next.js API Route（如 `/api/asr/token`）中：
     - 使用 `SPEECH_KEY` + `SPEECH_REGION` 调用 Azure 的 token 接口；
     - 返回短期 token 给前端。
3. **前端接入 Streaming ASR**
   - 使用 Azure 提供的 JavaScript SDK 或直接使用 WebSocket：
     - 建立到 Azure 的 streaming endpoint 的连接；
     - 将录音 chunk 推送到 Azure；
     - 监听 SDK 回调（partial / final transcription）更新 UI；
   - 这一层逻辑集中在 `useStreamingASR` 或 `useVoiceConversation` 内部，对业务透明。
4. **与 Dify / TTS 集成**
   - final 文本 → `/api/conversations/message`（现有逻辑基本不变）；
   - AI 文本回复 → Azure TTS（已接入）；
   - 保持 Supabase 对话记录、summary、todos 的逻辑不变。

#### 3.3 云厂商方案的优点

- **接入简单，专注业务**
  - 无需自建模型与服务，直接调用稳定的 Streaming API；
  - SDK 与示例丰富，前端集成相对简单；
  - 可专注于对话体验和产品逻辑，而不是底层 ASR 实现。
- **高可靠性与可扩展性**
  - SLA、监控、扩容由云厂商负责；
  - 大规模并发时无需自己处理 GPU 调度与负载均衡。
- **与现有栈统一（以 Azure 为例）**
  - 与 Azure TTS 共用一套认证与配置；
  - 统一计费与资源管理，简化运维。

#### 3.4 云厂商方案的缺点

- **成本按量计费**
  - 按音频时长 / 请求数计费，单价通常高于自建在高并发下的边际成本；
  - 需要做用量监控与预算控制。
- **厂商锁定**
  - 不同云厂商的协议与 SDK 不兼容，迁移需要适配成本；
  - 有些高级功能（自定义模型等）进一步加深绑定。
- **部分地区网络依赖**
  - 若用户主要在中国大陆，访问境外云区域可能存在网络波动（需合理选择区域与网络优化策略）。

---

### 四、两种方案的对比（集成难度 / 成本 / 灵活性）

| 维度              | 自建 Streaming ASR                     | 云厂商 Streaming ASR（如 Azure Speech）             |
|-------------------|----------------------------------------|-----------------------------------------------------|
| 集成复杂度        | 高：需自建服务、协议、部署、监控       | 中：调用成熟 API，主要工作在前端集成与鉴权         |
| 运行与运维成本    | 需要自行承担服务器、GPU、运维成本      | 按量计费，无需运维底层基础设施                     |
| 前期开发成本      | 高：音频工程 + WebSocket + 模型接入    | 中：主要是阅读文档 + 按官方示例接入                |
| 可控性 / 灵活性   | 极高：模型、参数、部署环境完全可控     | 中：受制于云厂商接口与配置                         |
| 可扩展性          | 取决于自建架构与资源规划               | 高：自动扩容与负载均衡由云厂商处理                 |
| 与现有栈兼容性    | 需额外部署，自行管理域名与安全         | 高：Azure 方案与现有 Azure TTS 完整对齐            |
| 适合阶段          | 用户量大、团队有 DevOps & ASR 能力时   | 项目早期 / 中期，尤其是小团队、追求快速上线与稳定  |

---

### 五、在本项目中的推荐选择

结合本项目特点：

- 技术栈：Next.js + Vercel Serverless 部署，无长驻服务；
- 现状：已接入 Azure TTS；ASR 尚未定型；
- 团队精力：当前主要精力在对话体验、会议总结、任务管理等业务层；

**更推荐优先采用「云厂商 Streaming ASR 方案」，具体建议：**

1. **首选 Azure Speech-to-Text**
   - 与现有 Azure TTS 共用一套配置与认证；
   - 一致的 SDK 和运维体验；
   - 官方支持中文实时识别，适合当前场景。
2. **作为备选，可评估专注语音服务厂商（如 Deepgram / AssemblyAI）**
   - 看重接入简单与语音质量时，可作为对比方案；
   - 可通过抽象的 `useStreamingASR` Hook 保持前端接口稳定，支持后续替换。
3. **自建 Streaming ASR 作为中长期选项**
   - 当产品进入规模化阶段、对成本和定制化要求更高时，可以逐步自建 ASR 服务；
   - 现阶段可通过合理抽象前端接口，为未来切换留接口（比如 `useStreamingASR` 内部仅切换实现）。

---

### 六、总结

- 在当前「Next.js + Vercel + Azure TTS」的堆栈下，**自建 Streaming ASR** 方案在可控性和长期成本上有优势，但需要额外搭建与维护一整套语音服务基础设施，对小团队和产品早期并不友好。
- **云厂商 Streaming ASR 方案**（尤其是 Azure Speech）则可以在很小的集成成本下快速获得稳定的实时语音转文字能力，让团队将主要精力集中在：
  - 对话体验（Streaming UI、状态机）；
  - 会议总结与 Todo 生成逻辑；
  - Supabase 数据与多端集成。
- 因此，本项目应优先选择云厂商 ASR（推荐 Azure Speech），并通过良好的 Hook 与服务抽象，为未来可能的自建 ASR 或更换厂商预留扩展空间。 

