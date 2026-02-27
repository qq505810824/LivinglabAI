# 阿里云实时语音识别通用库（`aliyun-asr`）设计文档

> 目标：将目前项目中与阿里云 Streaming ASR 相关的能力，抽象为一个可复用的 `lib/aliyun-asr`，在其他项目中**只需要复制该 lib + 现有 `aliyun-tts` / Dify 封装**，以及自行实现 UI，即可获得完整的「实时语音对话」体验，而无需重新拼装业务逻辑。

---

## 一、设计目标与边界

### 1.1 主要目标

- **低耦合复制使用**：在任意 React / Next.js 项目中，只要具备：
  - 阿里云 ASR Token 获取 API（或直接提供 Token 获取函数）；
  - Dify LLM 消息接口（或其他 LLM 接口）；
  - Aliyun TTS（`aliyun-tts`）或自定义 TTS；
  即可复制 `lib/aliyun-asr` 目录并直接使用。
- **对外暴露统一的“对话”接口**，屏蔽底层：
  - WebSocket 连接与重连；
  - 浏览器录音与音频流处理（AudioContext / PCM）；
  - 阿里云 ASR 协议细节（Start/Stop/SentenceBegin/ResultChanged/...）；
  - Dify LLM 请求与回复；
  - TTS 合成与播放。
- **只关注 `asrMode = 'aliyun'` 场景**：
  - 不再耦合 `dify` ASR 模式；
  - 但仍需要对接 Dify **LLM 对话**（文本输入 → 文本回复）。
- **满足当前项目的业务需求**：
  - 开始对话 / 结束对话；
  - 连续多轮语音对话（用户说 → ASR → LLM → TTS 播放 → 自动进入下一轮监听）；
  - 获取当前会话的**对话记录列表**；
  - UI 只关心状态和回调，不关心底层实现。

### 1.2 非目标

- 不负责：
  - Supabase / 数据库存储（插入 conversations/todos/summary）。
  - 会议 `user_meets` / `meet` 状态流转。
  - 任务（Todo）生成、会议总结生成。
- 这些仍由上层（如当前 `useVoiceConversation` + API routes）处理，`aliyun-asr` 只提供**对话级别**的结果数据。

---

## 二、目录结构与集成方式

建议在项目中新增目录：

```text
src/lib/
  aliyun-asr/
    index.ts                # 主入口（对外 API）
    types.ts                # 类型定义
    core/                   # 纯逻辑层（可在非 React 环境使用）
      AsrClient.ts          # 管理 WS 连接、ASR 状态
      AudioRecorder.ts      # 录音 & PCM 处理
      ConversationManager.ts# 对话记录管理
    react/
      useAliyunAsrConversation.ts  # 高级 React Hook，组合 core 能力
```

> 说明：当前项目已有 `src/hooks/useAliyunASR.ts`，新库会吸收其核心逻辑，但改造成**可独立复用的 core + Hook 包装**。

---

## 三、核心概念与数据结构

### 3.1 对话与轮次

- **ConversationSession**：一次完整的“语音会话”，可包含多轮：
  - 用户多次语音输入（每次称为一个 Utterance）；
  - 每个 Utterance 对应一次 LLM 回复 + 一次 TTS 播放。
- **Utterance**：
  - `userText`: ASR 识别出的用户文本；
  - `aiText`: LLM 返回的文本；
  - `audioDuration`: 用户录音时长（秒）；
  - `timestamps`: 用户说话时间、AI 回复时间等。

### 3.2 公共类型（`types.ts`）

```ts
export type AsrLanguage = 'zh' | 'en' | string;

export interface AsrConfig {
  language?: AsrLanguage;       // 默认 'zh'
  sampleRate?: number;          // 默认 16000
  format?: 'pcm' | string;      // 默认 'pcm'
}

export interface LlmRequest {
  userText: string;
  conversationId?: string;      // LLM 会话 id（如 Dify conversation_id）
  context?: Record<string, any>;
}

export interface LlmResponse {
  conversationId: string;
  aiText: string;
  raw?: any;
}

export interface TtsConfig {
  voice?: string;               // 如 'lydia'
  // 可扩展音色、语速等
}

export interface UtteranceRecord {
  id: string;
  userText: string;
  aiText: string;
  userAudioDuration: number;    // 秒
  userSentAt: string;           // ISO
  aiRespondedAt: string;        // ISO
  // 如需要可扩展：userAudioUrl / aiAudioUrl 等
}

export interface ConversationSessionState {
  id: string;
  utterances: UtteranceRecord[];
  conversationId?: string;      // LLM 层会话 id
}

export type AsrStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'recording'
  | 'listening'
  | 'processing'
  | 'speaking'
  | 'error';

export interface AsrError {
  code?: string;
  message: string;
  raw?: any;
}
```

---

## 四、核心能力设计：`AsrClient` / `AudioRecorder` / `ConversationManager`

### 4.1 Token 获取抽象

为避免与当前项目的 `/api/asr/token` 强绑定，`aliyun-asr` 只依赖一个**函数型配置**：

```ts
export interface AsrToken {
  token: string;
  expireTime: number;   // 时间戳（秒或毫秒，库内部统一处理）
  appKey: string;
  region: string;
}

export type FetchAsrTokenFn = () => Promise<AsrToken>;
```

当前项目中，此函数可以简单封装现有 API：

```ts
const fetchAsrTokenFromApi: FetchAsrTokenFn = async () => {
  const res = await fetch('/api/asr/token');
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Failed to fetch token');
  return data.data;
};
```

### 4.2 `AsrClient`（WebSocket + 协议层）

职责：

- 维护 WebSocket 连接（连接 / 断开 / 错误重试可选）。
- 暴露方法：
  - `connect()`
  - `disconnect()`
  - `startTranscription()`：发送 `StartTranscription`；
  - `stopTranscription()`：发送 `StopTranscription`，并在确认后关闭/保持连接。
- 处理消息：
  - `TranscriptionResultChanged` → 中间结果；
  - `TranscriptionCompleted` / `SentenceEnd` → 句子结束；
  - `TaskFailed` / 错误码处理。

对外事件（通过回调或事件总线）：

```ts
interface AsrClientCallbacks {
  onConnected?: () => void;
  onDisconnected?: () => void;
  onPartialResult?: (text: string) => void;
  onFinalSentence?: (text: string) => void;   // 一句话结束
  onError?: (error: AsrError) => void;
}
```

### 4.3 `AudioRecorder`（浏览器录音）

职责：

- 使用 `getUserMedia` + `AudioContext` 将麦克风音频转换为指定采样率 / 格式（16k PCM）。
- 提供接口：

```ts
interface AudioRecorder {
  start(onPcmFrame: (pcmData: Int16Array) => void): Promise<void>;
  stop(): Promise<void>;
  isRecording(): boolean;
}
```

ASR 模式下，录音不会存文件，只是持续把 PCM 帧传给 `AsrClient` 的 `sendAudioFrame()`。

### 4.4 `ConversationManager`

职责：

- 维护当前 `ConversationSessionState`：
  - 追加新的 Utterance。
  - 提供只读历史接口。

接口：

```ts
class ConversationManager {
  getSession(): ConversationSessionState;
  appendUtterance(u: UtteranceRecord): void;
  resetSession(): void;
}
```

---

## 五、LLM 与 TTS 集成抽象

### 5.1 LLM 抽象（对接 Dify，封装为 `dify-llm`）

`aliyun-asr` 不直接依赖 Dify 具体实现，而是依赖一个函数型接口：

```ts
export type LlmHandler = (req: LlmRequest) => Promise<LlmResponse>;
```

在**当前项目**以及未来其它项目中，推荐新建独立的 `lib/dify-llm`，专门封装 Dify 相关业务逻辑，并由该库提供实现 `LlmHandler` 的函数。

#### 5.1.1 Dify 调用约定（参数约束）

结合现有实现（`useVoiceConversation.ts` 和 `/api/conversations/message`）：

- 现状（节选）：

```ts
// useVoiceConversation.ts 中调用 sendMessage（最终到 /api/conversations/message）
const response = await sendMessage({
  meetId: meet.id,
  userId,
  userMeetId,
  audioUrl: '',
  title: meet.title || '',
  topic: meet.description || '',
  hints: meet.description || '',
  transcriptionText,         // 用户说的话（ASR 文本）
  conversation_id: difyConversationId,
  audioDuration,
});
```

```ts
// /api/conversations/message/route.ts 中传给 Dify 的 inputs 片段
inputs: {
  title: title || '',
  topic: topic || '',
  hints: hints || '',
},
```

根据你的补充要求，对 Dify 集成做如下约束和简化：

- 向 Dify LLM 发起请求时：
  - **动态参数只需要**：`userId`, `title`, `topic`, `hints`；
  - 用户实际说的话（ASR 文本）作为「用户消息内容」本身传递；
  - `conversation_id` 完全由 Dify 返回并维护，**不再要求上层手动管理**。
- 其它如 `meetId` / `userMeetId` / `audioUrl` / `audioDuration` 等，属于本地业务数据，仅用于存储或统计，**不参与 Dify 调用参数约定**，由上层业务自行处理。

据此，可以将 `LlmRequest` / `LlmResponse` 在当前项目中具体化为：

```ts
// 在 lib/dify-llm 内部使用的更具体形态（示意）
export interface DifyLlmRequest {
  userId: string;          // Dify user 标识
  userText: string;        // 用户的自然语言内容（ASR 转写结果）
  title?: string;          // 会议标题（可选）
  topic?: string;          // 会议主题（可选）
  hints?: string;          // 额外提示 / 背景信息（可选）
}

export interface DifyLlmResponse {
  conversationId: string;  // 由 Dify 返回的 conversation_id
  aiText: string;          // AI 回复文本
  raw?: any;               // Dify 原始返回（可选）
}
```

在通用 `aliyun-asr` 视角下，仍然只关心抽象的：

```ts
export interface LlmRequest {
  userText: string;
  meta?: {
    userId?: string;
    title?: string;
    topic?: string;
    hints?: string;
  };
}

export interface LlmResponse {
  conversationId: string;
  aiText: string;
  raw?: any;
}

export type LlmHandler = (req: LlmRequest) => Promise<LlmResponse>;
```

`dify-llm` 负责将上述 `meta.userId/title/topic/hints` 映射到 `/api/conversations/message` 所需的 `userId/title/topic/hints`，并在库内部维护 Dify 返回的 `conversation_id`：

- 上层（如 `useVoiceConversation` 或 `aliyun-asr`）**不再需要显式传入/管理 `conversation_id`**；
- `dify-llm` 可以在闭包或内部状态中缓存 `conversationId`，在后续调用中自动携带；
- 这样不同项目只需：
  1. 提供 Dify 的基本配置（baseUrl、apiKey、appId 等）；
  2. 实现一个 `LlmHandler`，签名为 `(req: LlmRequest) => Promise<LlmResponse>`；
  3. 将该 handler 传给 `aliyun-asr`。

### 5.2 TTS 抽象（默认使用 `aliyun-tts`）

暴露一个接口：

```ts
export type TtsHandler = (text: string, config?: TtsConfig) => Promise<string>; // 返回可播放 audioUrl
export type AudioPlayer = (audioUrl: string) => Promise<void>;
```

在当前项目中：

- `TtsHandler` 可直接用现有 `synthesizeTTS` 封装；
- `AudioPlayer` 可复用现有 `useTTS().playAudio` 的实现方式抽象出来。

库内部只依赖这两个函数，不直接 import `synthesizeTTS`，以方便在其他项目中替换 TTS 供应商。

---

## 六、高级对话 API 设计（库对外主入口）

### 6.1 `createAliyunAsrConversation`（非 React 场景）

入口函数（`index.ts`）：

```ts
export interface AliyunAsrConversationOptions {
  asr: AsrConfig;
  fetchToken: FetchAsrTokenFn;
  llm: {
    handler: LlmHandler;
    initialConversationId?: string;
  };
  tts: {
    handler: TtsHandler;
    player: AudioPlayer;
    config?: TtsConfig;
  };
}

export interface AliyunAsrConversation {
  // 状态访问
  getStatus(): AsrStatus;
  getError(): AsrError | null;
  getTranscriptLive(): string;          // 已结束句子 + 当前中间结果
  getSession(): ConversationSessionState;

  // 生命周期
  startConversation(): Promise<void>;   // 建立 WS + 进入监听/录音
  stopConversation(): Promise<void>;    // 结束本次语音会话（不一定销毁 LLM 会话）
  destroy(): Promise<void>;            // 关闭所有连接、AudioContext 等

  // 用户操作
  cancelCurrentUtterance(): Promise<void>; // 取消当前“您说的内容”（清空当前句，不发送给 LLM）
  sendCurrentUtterance(): Promise<void>;   // 将当前 transcript 发送到 LLM，播放 TTS，并在完成后自动重新监听
}

export function createAliyunAsrConversation(
  options: AliyunAsrConversationOptions
): AliyunAsrConversation { ... }
```

该对象将内部协调：

1. `startConversation`：
   - 调用 `AsrClient.connect()`；
   - 调用 `AudioRecorder.start(...)`，开始流式发送 PCM 帧；
   - 监听 `onPartialResult` / `onFinalSentence` 更新 `transcriptLive` 状态。

2. `sendCurrentUtterance`：
   - 停止录音，停止向 ASR 发送音频，但**不立即关闭 WS**（可配）。
   - 从 `AsrClient` 获取当前完整文本（已结束句子 + interim，一般由 `transcriptLive` 提供）。
   - 调用 `llm.handler` 获取 `aiText` & `conversationId`。
   - 构造 `UtteranceRecord`，写入 `ConversationManager`。
   - 调用 `tts.handler` + `tts.player` 播放。
   - 播放结束后，如果仍希望继续多轮对话，则再次启动录音 + ASR（回到 listening/recording 状态）。

3. `cancelCurrentUtterance`：
   - 调用 `AsrClient` 清空当前 interim/accumulated（或由上层直接 reset transcript 状态）。
   - 不调用 LLM，也不写入 `ConversationManager`。

4. `stopConversation`：
   - 停止录音；
   - 发送 `StopTranscription` 并适时关闭 WS；
   - 保留 `ConversationSessionState`，供上层读取。

5. `destroy`：
   - 清理 AudioContext、MediaStream、WS、定时器等。

### 6.2 React Hook 包装：`useAliyunAsrConversation`

为方便在 React 中直接使用，提供 Hook 封装（`react/useAliyunAsrConversation.ts`），内部使用 `createAliyunAsrConversation`：

```ts
interface UseAliyunAsrConversationOptions extends AliyunAsrConversationOptions {
  autoStart?: boolean; // 是否在挂载时自动 startConversation
}

export interface UseAliyunAsrConversationResult {
  status: AsrStatus;
  error: AsrError | null;
  transcriptLive: string;
  session: ConversationSessionState;

  startConversation: () => Promise<void>;
  stopConversation: () => Promise<void>;
  cancelCurrentUtterance: () => Promise<void>;
  sendCurrentUtterance: () => Promise<void>;
}

export function useAliyunAsrConversation(
  options: UseAliyunAsrConversationOptions
): UseAliyunAsrConversationResult;
```

在当前项目中，原本 `useVoiceConversation` 中的 aliyun ASR 分支，可大幅简化为基于此 Hook 的上层编排。

---

## 七、与现有项目的对应关系

### 7.1 替代现有 `useAliyunASR.ts` 的部分职责

现有 `src/hooks/useAliyunASR.ts` 已经实现了：

- WebSocket 连接 + Token 复用；
- Start/StopTranscription；
- 中间结果 / 句子结束结果；
- 清理定时器、空闲超时等。

在新设计中：

- 这些逻辑将搬运到 `core/AsrClient.ts` 中；
- 并通过 `createAliyunAsrConversation` 暴露为更高级的“对话”接口；
- 现有 `test/asr/page.tsx` 可改为使用 `useAliyunAsrConversation` 进行验证。

### 7.2 与 `useVoiceConversation.ts` 的关系

目前 `useVoiceConversation` 同时处理：

- 会议维度逻辑（`meet` / `user_meets` / Supabase 存储）；
- ASR 录音、LLM 调用、TTS 播放；
- 状态机：`idle/recording/transcribing/processing/speaking/listening`；
- 多轮对话、结束会议、生成 todo/summary。

未来改造方向：

- 保留 `useVoiceConversation` 作为**会议业务编排层**；
- 将“ASR + LLM + TTS + 对话记录”的核心流程替换为调用：

```ts
const {
  status,
  transcriptLive,
  session,
  startConversation,
  stopConversation,
  sendCurrentUtterance,
  cancelCurrentUtterance,
} = useAliyunAsrConversation(...);
```

- `VoiceConversationView.tsx` 继续只关心：
  - `status` / `isRecording` / `transcriptLive`；
  - `onStartRecording` / `onStopRecording` / `onSendTranscript`；
  这些都可以由 `useVoiceConversation` 包装 `useAliyunAsrConversation` 后提供。

---

## 八、典型使用示例（伪代码）

### 8.1 在会议业务 Hook 中集成

```ts
// 假设已有：fetchAsrTokenFromApi, difyLlmHandler, aliyunTtsHandler, playAudio

const {
  status,
  error,
  transcriptLive,
  session,
  startConversation,
  stopConversation,
  sendCurrentUtterance,
  cancelCurrentUtterance,
} = useAliyunAsrConversation({
  asr: {
    language: 'zh',
    sampleRate: 16000,
    format: 'pcm',
  },
  fetchToken: fetchAsrTokenFromApi,
  llm: {
    handler: difyLlmHandler,
    initialConversationId: existingConversationId,
  },
  tts: {
    handler: aliyunTtsHandler,
    player: playAudio,
    config: { voice: 'lydia' },
  },
  autoStart: true, // 进入页面立即建立 ASR 会话并进入监听
});

// 对上层 UI 暴露：
// onStartRecording → startConversation 或内部 status 控制
// onStopRecording  → cancelCurrentUtterance 或 stopConversation
// onSendTranscript → sendCurrentUtterance
// 对话记录 session.utterances 可在会议结束时统一写入 Supabase
```

---

## 九、后续扩展点与注意事项

1. **错误码归一化**：
   - 将阿里云返回的错误码（如 token 过期、权限错误、限流）映射为 `AsrError.code`，便于上层统一处理。
2. **静音检测 / 超时断开**：
   - 现有 `useAliyunASR` 中已有 idleTimeout 逻辑，可以继续下沉到 `AsrClient` 或 `AliyunAsrConversation`。
3. **多语言与多区域支持**：
   - `AsrConfig.language` / `AsrToken.region` 已为多语言、多区域使用预留空间。
4. **可插拔 LLM / TTS**：
   - 通过函数型依赖，未来可以轻松更换为 OpenAI / Claude / 其他 TTS。

---

## 十、当前项目中的 `dify-llm` 目录结构与示例签名（建议）

> 本小节是对第 5.1 节和第 7.3 节的具体化示例，说明在 **TalentSyncAI 当前项目** 中如何落地 `lib/dify-llm`，以便配合 `aliyun-asr` 统一使用。

### 10.1 建议目录结构

```text
src/lib/
  dify-llm/
    index.ts          # 对外主入口：createDifyLlmHandler / callDifyChat 等
    types.ts          # Dify 相关类型定义
    client.ts         # 实际 HTTP 调用 Dify 的封装
```

### 10.2 类型与配置（`types.ts`）

```ts
// src/lib/dify-llm/types.ts

export interface DifyConfig {
  baseUrl: string;   // 如 `https://api.dify.ai/v1`
  apiKey: string;    // Dify 提供的 API Key
  appId: string;     // Dify 应用 ID（如使用多应用，可按需扩展）
}

export interface DifyLlmRequest {
  userId: string;    // 对应当前用户（user.id）
  userText: string;  // 用户自然语言内容（如 ASR 转写结果）
  title?: string;    // 会议标题（可选）
  topic?: string;    // 会议主题（可选）
  hints?: string;    // 额外提示 / 背景信息（可选）
}

export interface DifyLlmResponse {
  conversationId: string; // Dify 返回的 conversation_id
  aiText: string;         // AI 回复文本
  raw?: any;              // Dify 原始返回（调试/扩展用）
}
```

### 10.3 调用封装（`client.ts`）

```ts
// src/lib/dify-llm/client.ts

import type { DifyConfig, DifyLlmRequest, DifyLlmResponse } from './types';

export class DifyClient {
  private config: DifyConfig;
  private conversationId?: string;

  constructor(config: DifyConfig) {
    this.config = config;
  }

  async chat(req: DifyLlmRequest): Promise<DifyLlmResponse> {
    // 这里只给出签名示例，具体 HTTP 请求体结构按 Dify 官方文档 & 现有 /api/conversations/message 实现
    // - userId 映射到 Dify 的 user 字段
    // - title/topic/hints 映射到 inputs 中
    // - userText 作为 query 或 message 内容
    // - conversationId 由 Dify 返回并缓存在 this.conversationId 中
    return {
      conversationId: 'dify-conv-id',
      aiText: 'AI 回复内容',
      raw: {},
    };
  }
}
```

### 10.4 对外工厂函数与 `LlmHandler` 适配（`index.ts`）

```ts
// src/lib/dify-llm/index.ts

import type { LlmHandler, LlmRequest, LlmResponse } from '@/lib/aliyun-asr/types'; // 或相应路径
import { DifyClient } from './client';
import type { DifyConfig, DifyLlmRequest } from './types';

export function createDifyLlmHandler(config: DifyConfig): LlmHandler {
  const client = new DifyClient(config);

  const handler: LlmHandler = async (req: LlmRequest): Promise<LlmResponse> => {
    const meta = req.meta || {};

    const difyReq: DifyLlmRequest = {
      userId: meta.userId || 'anonymous',
      userText: req.userText,
      title: meta.title,
      topic: meta.topic,
      hints: meta.hints,
    };

    const res = await client.chat(difyReq);

    return {
      conversationId: res.conversationId,
      aiText: res.aiText,
      raw: res.raw,
    };
  };

  return handler;
}
```

### 10.5 在页面 / Hook 中的典型使用

在 `useVoiceConversation` 或页面中，只需简单配置 Dify 参数并与 `aliyun-asr` 组合：

```ts
// 示例：在某个 Hook 中初始化

import { createDifyLlmHandler } from '@/lib/dify-llm';

const llmHandler = createDifyLlmHandler({
  baseUrl: process.env.NEXT_PUBLIC_DIFY_BASE_URL!,
  apiKey: process.env.DIFY_API_KEY!,
  appId: process.env.DIFY_APP_ID!,
});

const {
  status,
  transcriptLive,
  session,
  startConversation,
  stopConversation,
  sendCurrentUtterance,
  cancelCurrentUtterance,
} = useAliyunAsrConversation({
  asr: { language: 'zh', sampleRate: 16000, format: 'pcm' },
  fetchToken: fetchAsrTokenFromApi,
  llm: { handler: llmHandler },
  tts: { handler: aliyunTtsHandler, player: playAudio, config: { voice: 'lydia' } },
  autoStart: true,
});
```

> 总结：对于当前项目和未来其它项目，`dify-llm` 把 Dify 所有细节（包括 `conversation_id`）都收敛在一个小库里，对外只暴露一个 `createDifyLlmHandler`，而页面层只需配置 Dify 参数和 Aliyun ASR 参数即可快速接入。

---

## 十一、落地实施步骤（本项目）

> 本文档为设计与规格说明，**本步骤暂不执行代码改造**，待你确认无问题后再实施。

1. 新建目录 `src/lib/aliyun-asr/`，按本设计创建 `types.ts` / `core/*` / `react/*` 文件。
2. 新建目录 `src/lib/dify-llm/`，按第十章建议创建 `types.ts` / `client.ts` / `index.ts`，并先复用现有 `/api/conversations/message` 流程实现。
3. 从现有 `useAliyunASR.ts` 抽取：
   - WebSocket 协议相关逻辑 → `core/AsrClient.ts`；
   - 录音相关逻辑（如有）→ `core/AudioRecorder.ts`；
   - 状态更新与 transcript 拼接逻辑 → `AliyunAsrConversation`。
4. 在 `useVoiceConversation.ts` 中用 `useAliyunAsrConversation` 替换当前 aliyun ASR 分支的细节代码，只保留会议维度逻辑（`meet/user_meets`、Supabase 写入等）。
5. 更新：
   - `test/asr/page.tsx` → 使用新 Hook 进行回归测试；
   - `VoiceConversationView.tsx` → 不需要感知库内部变化，仅继续使用 `transcriptLive` / `onSendTranscript`。
6. 验证：
   - ASR 实时字幕是否正常；
   - 取消 / 发送行为是否符合预期；
   - 多轮对话与 TTS 播放是否连贯；
   - 对话记录（`session.utterances`）是否完整，便于写入 Supabase。

确认本设计后，可以按上述步骤逐步实施代码重构。
