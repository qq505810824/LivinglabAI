# TTS 实施方案：支持 Azure TTS 和阿里云语音合成切换

## 📋 概述

本文档描述如何在 TalentSyncAI 项目中实现支持 **Azure TTS** 和 **阿里云语音合成** 两种方案的动态切换，保留原有 Azure TTS 功能，同时新增阿里云 TTS 支持。

## 🎯 设计目标

1. **完美封装**：将阿里云 TTS 功能封装为独立、可复用的模块，其他项目可直接复制使用
2. **简单调用**：使用时仅需传入文字即可自动播放，无需关心内部实现细节
3. **保留现有功能**：不破坏现有的 Azure TTS 实现
4. **支持动态切换**：通过环境变量或配置轻松切换 TTS 提供商
5. **统一接口**：两种方案使用相同的调用接口，上层代码无需修改
6. **预留扩展**：为方案 B（WebSocket 流式 API）预留清晰的架构位置，便于后续实现
7. **易于扩展**：未来可以轻松添加其他 TTS 提供商（如百度、腾讯等）

---

## 🏗️ 架构设计

### 1. 整体架构

```
┌─────────────────────────────────────────┐
│         useVoiceConversation.ts         │
│  (调用 text_to_audio 函数)              │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│            useTTS.ts (Hook)             │
│  (统一接口层，根据配置选择提供商)        │
└─────────────────┬───────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
┌──────────────┐   ┌──────────────────┐
│ Azure TTS   │   │ 阿里云语音合成    │
│ Provider    │   │ Provider          │
└──────────────┘   └──────────────────┘
        │                   │
        ▼                   ▼
┌──────────────┐   ┌──────────────────┐
│ Azure API    │   │ 阿里云 TTS API    │
│ (现有实现)   │   │ (新增实现)        │
└──────────────┘   └──────────────────┘
```

### 2. 核心组件

#### 2.1 阿里云 TTS 核心模块（独立封装）

**目录结构**：`src/lib/aliyun-tts/`

```
src/lib/aliyun-tts/
├── core/
│   ├── rest-api.ts          # 方案A：RESTful API 实现（当前使用）
│   ├── websocket-api.ts     # 方案B：WebSocket 流式 API（预留位置）
│   ├── types.ts             # 类型定义
│   └── config.ts            # 配置管理
├── player/
│   └── audio-player.ts      # 音频播放器（独立封装）
├── utils/
│   ├── token-manager.ts     # Token 管理（复用、缓存）
│   └── error-handler.ts     # 错误处理
└── index.ts                 # 统一导出接口（主要入口）
```

**核心设计原则**：
- **独立性**：整个 `aliyun-tts` 目录可以独立复制到其他项目
- **零依赖**：不依赖项目特定的代码（除了环境变量）
- **简单接口**：提供 `synthesize(text)` 方法，自动完成合成和播放

#### 2.2 TTS Provider 抽象层

**位置**：`src/lib/tts/providers/base.ts`

**职责**：
- 定义统一的 TTS Provider 接口
- 所有 TTS 提供商必须实现此接口

**接口定义**：
```typescript
interface TTSProvider {
  // 将文本转换为音频 URL
  textToAudio(text: string, options?: TTSOptions): Promise<string>;
  
  // 获取支持的语音列表
  getAvailableVoices(): Promise<Voice[]>;
  
  // 检查配置是否有效
  validateConfig(): boolean;
}
```

#### 2.2 Azure TTS Provider

**位置**：`src/lib/tts/providers/azure.ts`

**职责**：
- 实现 Azure TTS API 调用
- 将现有 `useTTS.ts` 中的 Azure 逻辑迁移至此

**主要功能**：
- 使用 SSML 格式生成语音
- 支持多种音频格式输出
- 错误处理和重试机制

#### 2.3 阿里云 TTS Provider（封装层）

**位置**：`src/lib/tts/providers/aliyun.ts`

**职责**：
- 封装 `aliyun-tts` 核心模块
- 实现 `TTSProvider` 接口
- 适配到项目的 Provider 体系

**实现方式**：
- 内部调用 `aliyun-tts` 模块的 `synthesize` 方法
- 将返回的音频 URL 传递给上层

**主要功能**：
- 使用阿里云 NLS（智能语音交互）服务
- 支持 RESTful API（方案A，当前实现）
- 预留 WebSocket 流式 API（方案B，待实现）
- 支持多种音色选择

#### 2.4 TTS Factory

**位置**：`src/lib/tts/factory.ts`

**职责**：
- 根据配置创建对应的 TTS Provider 实例
- 管理 Provider 的生命周期

**实现逻辑**：
```typescript
function createTTSProvider(): TTSProvider {
  const provider = process.env.NEXT_PUBLIC_TTS_PROVIDER || 'azure';
  
  switch (provider) {
    case 'aliyun':
      return new AliyunTTSProvider();
    case 'azure':
    default:
      return new AzureTTSProvider();
  }
}
```

#### 2.5 更新 useTTS Hook

**位置**：`src/hooks/useTTS.ts`

**修改内容**：
- 移除直接的 Azure API 调用代码
- 使用 TTS Factory 获取 Provider
- 调用 Provider 的统一接口

**保持兼容**：
- 保持现有的 `text_to_audio` 函数签名
- 保持现有的返回值格式
- 上层代码无需修改

---

## 🔧 实现步骤

### 步骤 1：创建 TTS Provider 抽象层

**文件**：`src/lib/tts/providers/base.ts`

**内容**：
- 定义 `TTSProvider` 接口
- 定义 `TTSOptions` 类型（语音、语言、语速等）
- 定义 `Voice` 类型（音色信息）

### 步骤 2：迁移 Azure TTS 到 Provider

**文件**：`src/lib/tts/providers/azure.ts`

**操作**：
1. 从 `useTTS.ts` 中提取 Azure TTS 相关代码
2. 封装为 `AzureTTSProvider` 类
3. 实现 `TTSProvider` 接口
4. 保持现有功能不变

**配置**：
- 使用环境变量：`NEXT_PUBLIC_AZURE_SPEECH_KEY`
- 使用环境变量：`NEXT_PUBLIC_AZURE_SPEECH_REGION`

### 步骤 3：实现阿里云 TTS 核心模块（独立封装）

#### 3.1 创建目录结构

**创建目录**：`src/lib/aliyun-tts/`

```
src/lib/aliyun-tts/
├── core/
│   ├── rest-api.ts          # 方案A：RESTful API 实现
│   ├── websocket-api.ts     # 方案B：WebSocket 流式 API（预留）
│   ├── types.ts             # 类型定义
│   └── config.ts            # 配置管理
├── player/
│   └── audio-player.ts      # 音频播放器
├── utils/
│   ├── token-manager.ts     # Token 管理
│   └── error-handler.ts     # 错误处理
└── index.ts                 # 统一导出接口
```

#### 3.2 实现方案 A：RESTful API（当前使用）

**文件**：`src/lib/aliyun-tts/core/rest-api.ts`

**核心类**：`AliyunTTSRestAPI`

**主要方法**：
```typescript
class AliyunTTSRestAPI {
  // 合成语音（返回音频 Blob URL）
  async synthesize(text: string, options?: TTSOptions): Promise<string>
  
  // 获取 Token（内部调用，自动管理）
  private async getToken(): Promise<string>
  
  // 调用阿里云 TTS API
  private async callTTSAPI(text: string, token: string): Promise<Blob>
}
```

**实现要点**：
1. **Token 管理**：使用 `token-manager.ts` 复用 Token，避免重复获取
2. **错误处理**：网络错误自动重试（最多 3 次）
3. **音频格式**：默认 MP3，16kHz，单声道
4. **返回格式**：返回 Blob URL，可直接用于播放

**API 调用流程**：
1. 检查 Token 是否有效（复用 `token-manager`）
2. 如果无效，获取新 Token
3. 调用阿里云 TTS RESTful API
4. 返回音频 Blob，转换为 URL

**API 端点**：
```
POST https://nls-gateway.cn-shanghai.aliyuncs.com/stream/v1/tts
```

**请求格式**：
```json
{
  "appkey": "your-app-key",
  "token": "your-token",
  "text": "要合成的文本",
  "voice": "aiqi",
  "format": "mp3",
  "sample_rate": 16000
}
```

#### 3.3 预留方案 B：WebSocket 流式 API

**文件**：`src/lib/aliyun-tts/core/websocket-api.ts`

**核心类**：`AliyunTTSWebSocketAPI`（预留，暂不实现）

**架构设计**：
```typescript
class AliyunTTSWebSocketAPI {
  private ws: WebSocket | null = null;
  private audioBuffer: ArrayBuffer[] = [];
  
  // 连接 WebSocket
  async connect(): Promise<void>
  
  // 合成语音（流式）
  async synthesizeStream(text: string, options?: TTSOptions): Promise<string>
  
  // 处理流式音频数据
  private handleStreamData(data: ArrayBuffer): void
  
  // 断开连接
  disconnect(): void
}
```

**预留功能点**：
1. **WebSocket 连接管理**：建立、维护、重连机制
2. **流式数据缓冲**：接收音频片段，边接收边播放
3. **音频队列**：支持多个文本排队合成
4. **错误恢复**：连接断开自动重连

**实现时机**：当需要更低延迟或流式播放体验时实现

#### 3.4 实现音频播放器

**文件**：`src/lib/aliyun-tts/player/audio-player.ts`

**核心类**：`AudioPlayer`

**主要方法**：
```typescript
class AudioPlayer {
  // 播放音频（自动处理 Blob URL）
  async play(audioUrl: string): Promise<void>
  
  // 停止播放
  stop(): void
  
  // 暂停播放
  pause(): void
  
  // 恢复播放
  resume(): void
}
```

**设计要点**：
- 独立封装，不依赖具体 TTS 实现
- 支持自动播放和手动控制
- 处理音频加载错误

#### 3.5 实现 Token 管理器

**文件**：`src/lib/aliyun-tts/utils/token-manager.ts`

**核心类**：`TokenManager`

**主要方法**：
```typescript
class TokenManager {
  // 获取有效 Token（自动复用或刷新）
  async getValidToken(): Promise<string>
  
  // 检查 Token 是否有效
  private isTokenValid(token: string, expireTime: number): boolean
  
  // 获取新 Token
  private async fetchNewToken(): Promise<{ token: string; expireTime: number }>
}
```

**设计要点**：
- 缓存 Token，避免重复获取
- 自动检查过期时间（提前 5 分钟刷新）
- 可复用 ASR 的 Token 获取逻辑

#### 3.6 统一导出接口

**文件**：`src/lib/aliyun-tts/index.ts`

**核心类**：`AliyunTTS`（主要入口）

**使用方式**：
```typescript
import { AliyunTTS } from '@/lib/aliyun-tts';

// 初始化（只需一次）
const tts = new AliyunTTS({
  accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,
  accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET,
  appKey: process.env.ALIYUN_TTS_APP_KEY,
  region: process.env.ALIYUN_REGION || 'cn-shanghai',
  voice: 'aiqi', // 默认音色
});

// 使用：仅需传入文字，自动合成并播放
await tts.synthesize('你好，这是一段测试文字');
```

**核心方法**：
```typescript
class AliyunTTS {
  // 合成并播放（最简单的方式）
  async synthesize(text: string, options?: TTSOptions): Promise<void>
  
  // 仅合成，不播放（返回音频 URL）
  async synthesizeOnly(text: string, options?: TTSOptions): Promise<string>
  
  // 切换实现方案（A 或 B）
  setMode(mode: 'rest' | 'websocket'): void
  
  // 配置音色
  setVoice(voice: string): void
}
```

**设计要点**：
- **极简接口**：`synthesize(text)` 即可完成所有操作
- **自动播放**：默认自动播放，无需额外调用
- **方案切换**：通过 `setMode` 在方案 A 和 B 之间切换
- **配置灵活**：支持全局配置和单次调用配置

### 步骤 4：创建阿里云 TTS Provider（适配层）

**文件**：`src/lib/tts/providers/aliyun.ts`

**职责**：
- 将 `AliyunTTS` 封装为 `TTSProvider` 接口
- 适配到项目的 Provider 体系

**实现**：
```typescript
import { AliyunTTS } from '@/lib/aliyun-tts';
import type { TTSProvider } from './base';

export class AliyunTTSProvider implements TTSProvider {
  private tts: AliyunTTS;
  
  constructor() {
    this.tts = new AliyunTTS({
      // 从环境变量读取配置
    });
  }
  
  async textToAudio(text: string, options?: TTSOptions): Promise<string> {
    // 调用 AliyunTTS 的 synthesizeOnly 方法
    return await this.tts.synthesizeOnly(text, options);
  }
  
  // ... 其他接口方法
}
```

### 步骤 5：创建 TTS Factory

**文件**：`src/lib/tts/factory.ts`

**功能**：
- 读取环境变量 `NEXT_PUBLIC_TTS_PROVIDER`
- 根据配置创建对应的 Provider 实例
- 实现单例模式，避免重复创建

### 步骤 6：更新 useTTS Hook

**文件**：`src/hooks/useTTS.ts`

**修改**：
1. 导入 TTS Factory
2. 在 Hook 初始化时创建 Provider 实例
3. `text_to_audio` 函数调用 Provider 的统一接口
4. 保持函数签名和返回值不变

**代码结构**：
```typescript
export const useTTS = () => {
  const [provider] = useState(() => createTTSProvider());
  
  const text_to_audio = useCallback(async (text: string): Promise<string> => {
    return await provider.textToAudio(text);
  }, [provider]);
  
  // ... 其他函数保持不变
};
```

### 步骤 7：环境变量配置

**新增环境变量**：

```bash
# TTS 提供商选择：'azure' 或 'aliyun'
NEXT_PUBLIC_TTS_PROVIDER=aliyun

# 阿里云 TTS 配置（如果使用阿里云）
ALIYUN_ACCESS_KEY_ID=your-access-key-id
ALIYUN_ACCESS_KEY_SECRET=your-access-key-secret
ALIYUN_TTS_APP_KEY=your-tts-app-key  # 可选，如果与 ASR 不同
ALIYUN_REGION=cn-shanghai

# Azure TTS 配置（如果使用 Azure，保持不变）
NEXT_PUBLIC_AZURE_SPEECH_KEY=your-azure-speech-key
NEXT_PUBLIC_AZURE_SPEECH_REGION=your-azure-region
```

### 步骤 8：更新 API 路由（可选）

**文件**：`src/app/api/tts/generate/route.ts`

**说明**：
- 当前此文件是 Mock 实现
- 如果未来需要服务端 TTS，可以在此实现
- 当前建议保持客户端直接调用 TTS API

---

## 📦 跨项目复用指南

### 如何将阿里云 TTS 模块复制到其他项目

#### 1. 复制文件

**需要复制的目录**：
```
src/lib/aliyun-tts/  （整个目录）
```

**可选文件**（如果项目需要 Provider 体系）：
```
src/lib/tts/providers/aliyun.ts  （适配层）
```

#### 2. 安装依赖

**必需依赖**：
```bash
# 无特殊依赖，使用浏览器原生 API
# 如果使用 Node.js 环境，可能需要：
npm install node-fetch  # 用于服务端调用
```

#### 3. 配置环境变量

```bash
ALIYUN_ACCESS_KEY_ID=your-access-key-id
ALIYUN_ACCESS_KEY_SECRET=your-access-key-secret
ALIYUN_TTS_APP_KEY=your-tts-app-key
ALIYUN_REGION=cn-shanghai
```

#### 4. 使用示例

**最简单的方式**：
```typescript
import { AliyunTTS } from '@/lib/aliyun-tts';

// 初始化
const tts = new AliyunTTS();

// 使用：仅需传入文字，自动合成并播放
await tts.synthesize('你好，世界！');
```

**高级用法**：
```typescript
// 自定义配置
const tts = new AliyunTTS({
  voice: 'aijia',        // 使用艾佳音色
  format: 'mp3',         // 音频格式
  sampleRate: 16000,     // 采样率
});

// 仅合成，不播放
const audioUrl = await tts.synthesizeOnly('测试文字');

// 切换方案（未来支持）
tts.setMode('websocket');  // 切换到流式 API
```

#### 5. 独立使用（不依赖项目结构）

如果项目结构不同，可以：

1. **直接使用核心模块**：
```typescript
import { AliyunTTSRestAPI } from '@/lib/aliyun-tts/core/rest-api';
import { AudioPlayer } from '@/lib/aliyun-tts/player/audio-player';

const api = new AliyunTTSRestAPI();
const player = new AudioPlayer();

const audioUrl = await api.synthesize('文字');
await player.play(audioUrl);
```

2. **自定义集成**：
```typescript
// 只使用合成功能，自己处理播放
import { AliyunTTSRestAPI } from '@/lib/aliyun-tts/core/rest-api';

const api = new AliyunTTSRestAPI();
const audioUrl = await api.synthesize('文字');

// 使用自己的播放逻辑
const audio = new Audio(audioUrl);
audio.play();
```

---

## 📝 阿里云 TTS API 集成细节

### 1. 获取 Token

**复用现有逻辑**：
- 可以复用 `src/app/api/asr/token/route.ts` 中的 Token 获取逻辑
- 阿里云 NLS Token 可以同时用于 ASR 和 TTS

**或创建独立 Token API**：
- 如果 TTS 需要不同的 AppKey，创建 `src/app/api/tts/token/route.ts`

### 2. 语音合成 API 调用

#### 方案 A：RESTful API（当前实现）

**端点**：
```
POST https://nls-gateway.cn-shanghai.aliyuncs.com/stream/v1/tts
```

**请求头**：
```
Authorization: Bearer {token}
Content-Type: application/json
```

**请求体**：
```json
{
  "appkey": "your-app-key",
  "token": "your-token",
  "text": "要合成的文本",
  "voice": "aiqi",  // 音色选择
  "format": "mp3",
  "sample_rate": 16000,
  "volume": 50,
  "speech_rate": 0,
  "pitch_rate": 0
}
```

**响应**：
- 成功：返回音频二进制数据（MP3 格式）
- 失败：返回错误信息 JSON

**实现位置**：`src/lib/aliyun-tts/core/rest-api.ts`

#### 方案 B：WebSocket 流式 API（预留位置）

**WebSocket 地址**：
```
wss://nls-gateway.cn-shanghai.aliyuncs.com/ws/v1?token={token}
```

**消息格式**：
```json
// 发送合成请求
{
  "header": {
    "appkey": "your-app-key",
    "message_id": "unique-message-id",
    "task_id": "unique-task-id",
    "namespace": "SpeechSynthesizer",
    "name": "StartSynthesis",
    "status": 3
  },
  "payload": {
    "text": "要合成的文本",
    "voice": "aiqi",
    "format": "mp3",
    "sample_rate": 16000
  }
}

// 接收音频数据（流式）
{
  "header": {
    "name": "SynthesisData",
    "task_id": "unique-task-id"
  },
  "payload": {
    "data": "base64-encoded-audio-data"
  }
}
```

**实现位置**：`src/lib/aliyun-tts/core/websocket-api.ts`（预留）

**实现要点**（待实现时参考）：
1. WebSocket 连接管理
2. 消息序列化和反序列化
3. 流式音频数据接收和缓冲
4. 音频片段拼接和播放
5. 错误处理和重连机制

### 3. 音色选择

**常用中文音色**：
- `aiqi`：艾琪（女声，温柔）
- `aiqi_emo`：艾琪（情感化）
- `aitong`：艾童（童声）
- `aijia`：艾佳（女声，知性）
- `aijia_emo`：艾佳（情感化）
- `aicheng`：艾诚（男声）
- `aicheng_emo`：艾诚（情感化）

**配置方式**：
- 通过环境变量配置默认音色
- 或在 `TTSOptions` 中动态指定

### 4. 错误处理

**常见错误**：
- Token 过期：自动刷新 Token 并重试
- 网络错误：重试机制（最多 3 次）
- API 限流：返回友好错误提示

---

## 🔄 切换机制

### 方式 1：环境变量切换（推荐）

**优点**：
- 无需修改代码
- 适合不同环境使用不同提供商
- 部署时配置即可

**使用**：
```bash
# 开发环境使用 Azure
NEXT_PUBLIC_TTS_PROVIDER=azure

# 生产环境使用阿里云
NEXT_PUBLIC_TTS_PROVIDER=aliyun
```

### 方式 2：运行时切换（可选）

**实现**：
- 在 `useTTS` Hook 中添加 `switchProvider` 函数
- 允许用户在运行时切换（需要重新初始化）

**使用场景**：
- A/B 测试
- 降级方案（当某个提供商失败时自动切换）

---

## 🧪 测试策略

### 1. 单元测试

**测试内容**：
- 每个 Provider 的 `textToAudio` 方法
- Factory 正确创建 Provider
- 错误处理逻辑

### 2. 集成测试

**测试内容**：
- 完整的 TTS 流程（文本 → 音频 → 播放）
- 切换 Provider 的功能
- 错误场景处理

### 3. 性能测试

**测试指标**：
- 响应时间（从调用到返回音频 URL）
- 音频生成时间
- 首字延迟（流式输出场景）

### 4. 对比测试

**测试内容**：
- 同时测试两种方案
- 对比响应时间、音质、成本
- 收集用户反馈

---

## 📊 监控和优化

### 1. 性能监控

**指标**：
- TTS API 调用延迟
- 成功率
- 错误率
- 音频生成时间

**实现**：
- 在 Provider 中添加性能日志
- 使用监控工具（如 Sentry）追踪错误

### 2. 成本监控

**指标**：
- 每日/每月字符数
- 各 Provider 的成本对比
- 成本趋势分析

**实现**：
- 记录每次 TTS 调用的字符数
- 定期生成成本报告

### 3. 用户体验监控

**指标**：
- 用户等待时间
- 播放成功率
- 用户满意度

---

## 🚀 实施计划

### 阶段 1：准备阶段（1-2 天）

1. ✅ 创建文档（本文档）
2. ✅ 确认阿里云 TTS API 配置
3. ✅ 申请阿里云 TTS 服务权限

### 阶段 2：基础架构（2-3 天）

1. 创建 TTS Provider 抽象层
2. 迁移 Azure TTS 到 Provider
3. 创建 TTS Factory
4. 更新 useTTS Hook

### 阶段 3：阿里云 TTS 核心模块实现（3-4 天）

1. **创建目录结构**（0.5 天）
   - 创建 `src/lib/aliyun-tts/` 目录结构
   - 创建基础类型定义文件

2. **实现 Token 管理器**（0.5 天）
   - 实现 Token 获取和缓存逻辑
   - 实现 Token 有效性检查

3. **实现方案 A（RESTful API）**（1.5 天）
   - 实现 `AliyunTTSRestAPI` 类
   - 实现 API 调用逻辑
   - 实现错误处理和重试机制

4. **实现音频播放器**（0.5 天）
   - 实现 `AudioPlayer` 类
   - 实现播放控制方法

5. **实现统一接口**（0.5 天）
   - 实现 `AliyunTTS` 主类
   - 实现 `synthesize` 和 `synthesizeOnly` 方法
   - 实现配置管理

6. **预留方案 B 架构**（0.5 天）
   - 创建 `websocket-api.ts` 文件
   - 定义接口和类型
   - 添加 TODO 注释说明实现要点

### 阶段 4：集成到项目（1-2 天）

1. 创建 `AliyunTTSProvider` 适配层
2. 更新 TTS Factory
3. 更新 useTTS Hook
4. 测试集成功能

### 阶段 5：测试和优化（2-3 天）

1. 单元测试和集成测试
2. 性能对比测试
3. 用户体验测试
4. 优化和 bug 修复

### 阶段 6：部署和监控（1 天）

1. 更新环境变量配置
2. 部署到生产环境
3. 设置监控和告警
4. 收集用户反馈

**总预计时间**：10-14 天

**关键里程碑**：
- ✅ 阶段 3 完成后，`AliyunTTS` 模块即可独立使用
- ✅ 阶段 4 完成后，项目内可切换使用阿里云 TTS
- ✅ 阶段 5 完成后，功能稳定可用

---

## ⚠️ 注意事项

### 1. 向后兼容

- 保持现有 `useTTS` Hook 的 API 不变
- 确保上层代码无需修改
- 默认使用 Azure TTS（如果未配置）

### 2. 错误处理

- 当某个 Provider 失败时，可以考虑自动切换到备用 Provider
- 记录详细的错误日志，便于排查

### 3. 配置管理

- 环境变量需要正确配置
- 提供清晰的配置文档
- 在代码中添加配置验证

### 4. 成本控制

- 监控 API 调用量
- 设置成本告警
- 定期审查成本报告

---

## 📚 参考资料

### 阿里云文档

- [阿里云语音合成产品页](https://www.aliyun.com/product/nls)
- [语音合成 API 文档](https://help.aliyun.com/document_detail/84430.html)
- [RESTful API 参考](https://help.aliyun.com/document_detail/84430.html)
- [WebSocket API 参考](https://help.aliyun.com/document_detail/84430.html)

### Azure 文档

- [Azure Text-to-Speech 文档](https://azure.microsoft.com/zh-cn/services/cognitive-services/text-to-speech/)
- [REST API 参考](https://learn.microsoft.com/zh-cn/azure/ai-services/speech-service/rest-text-to-speech)

### 项目相关

- [ASR 集成文档](./aliyun-asr-integration.md)
- [项目规范文档](./project-specification.md)

---

## ✅ 检查清单

### 实施前确认

- [ ] 已阅读并理解本文档
- [ ] 已确认阿里云 TTS API 权限
- [ ] 已获取阿里云 AccessKey 和 AppKey
- [ ] 已确认成本预算
- [ ] 已准备测试环境
- [ ] 已理解模块化封装设计

### 核心模块实现验证

- [ ] `AliyunTTS` 类可以独立使用
- [ ] `synthesize(text)` 方法正常工作
- [ ] Token 管理正确（复用、刷新）
- [ ] 音频播放功能正常
- [ ] 错误处理完善（重试、降级）

### 项目集成验证

- [ ] 两种 Provider 都能正常工作
- [ ] 可以通过环境变量切换
- [ ] `useTTS` Hook 无需修改即可使用
- [ ] 上层代码无需修改

### 跨项目复用验证

- [ ] `aliyun-tts` 目录可以独立复制
- [ ] 复制后仅需配置环境变量即可使用
- [ ] 调用接口简单（仅需传入文字）
- [ ] 文档清晰，易于理解

### 方案 B 预留验证

- [ ] `websocket-api.ts` 文件已创建
- [ ] 接口和类型已定义
- [ ] 预留位置清晰，便于后续实现
- [ ] 架构设计支持方案切换

### 性能和体验验证

- [ ] 响应时间满足要求（< 500ms）
- [ ] 音频质量良好
- [ ] 成本在预期范围内
- [ ] 用户体验良好

---

---

## 🎯 核心设计亮点

### 1. 完美封装，跨项目复用

- **独立模块**：`aliyun-tts` 目录完全独立，可复制到任何项目
- **零依赖**：不依赖项目特定代码，仅需环境变量
- **简单接口**：`synthesize(text)` 即可完成所有操作

### 2. 极简调用方式

```typescript
// 初始化（只需一次）
const tts = new AliyunTTS();

// 使用（仅需传入文字）
await tts.synthesize('你好，世界！');
```

### 3. 方案 B 预留清晰

- **独立文件**：`websocket-api.ts` 单独实现
- **统一接口**：通过 `setMode()` 切换方案
- **架构支持**：现有架构完全支持方案 B 扩展

### 4. 渐进式实现

- **阶段 1**：实现方案 A，满足当前需求
- **阶段 2**：预留方案 B 架构，便于后续扩展
- **阶段 3**：需要时实现方案 B，无缝切换

---

**文档版本**：v2.0  
**最后更新**：2024-01-XX  
**维护者**：TalentSyncAI Team
