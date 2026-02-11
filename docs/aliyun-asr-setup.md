# 阿里云 ASR 集成 - 快速开始

## 一、安装依赖

在项目根目录执行：

```bash
npm install crypto-js @types/crypto-js
```

## 二、配置环境变量

在项目根目录创建 `.env.local` 文件（如果不存在），添加以下配置：

```bash
# 阿里云 ASR 配置
ALIYUN_ACCESS_KEY_ID=your_access_key_id
ALIYUN_ACCESS_KEY_SECRET=your_access_key_secret
ALIYUN_ASR_APP_KEY=your_app_key
ALIYUN_REGION=cn-shanghai
```

### 获取配置信息：

1. **AccessKey ID 和 Secret**：
   - 登录阿里云控制台
   - 进入「AccessKey 管理」
   - 创建或查看 AccessKey

2. **AppKey**：
   - 进入「智能语音交互」控制台
   - 创建应用后获取 AppKey

3. **Region**：
   - 选择离用户最近的区域
   - 常用区域：`cn-shanghai`、`cn-beijing`、`cn-hangzhou`

## 三、测试页面

启动开发服务器后，访问测试页面：

```
http://localhost:3000/test/asr
```

## 四、使用说明

### 在代码中使用：

```typescript
import { useAliyunASR } from '@/hooks/useAliyunASR';

const {
    isConnected,
    isRecording,
    transcript,
    error,
    connect,
    startRecording,
    stopRecording,
    disconnect,
} = useAliyunASR({
    language: 'zh',
    sampleRate: 16000,
    format: 'pcm',
    onPartialResult: (text) => {
        console.log('Partial:', text);
    },
    onFinalResult: (text) => {
        console.log('Final:', text);
    },
    onError: (error) => {
        console.error('Error:', error);
    },
});
```

## 五、故障排查

### 1. Token 获取失败

**错误信息**：`Failed to generate token`

**排查步骤**：

1. **检查环境变量配置**
   ```bash
   # 确保 .env.local 文件存在且包含以下变量
   ALIYUN_ACCESS_KEY_ID=your_access_key_id
   ALIYUN_ACCESS_KEY_SECRET=your_access_key_secret
   ALIYUN_ASR_APP_KEY=your_app_key
   ALIYUN_REGION=cn-shanghai
   ```

2. **验证 AccessKey 权限**
   - 确保 AccessKey 有「智能语音交互」服务的权限
   - 在阿里云控制台检查 AccessKey 状态是否正常

3. **检查 API 响应**
   - 查看服务器控制台日志，查看详细的错误信息
   - 开发环境下，API 会返回 `debug` 字段，显示配置状态

4. **常见错误码**：
   - `InvalidAccessKeyId.NotFound`：AccessKey ID 不存在或错误
   - `SignatureDoesNotMatch`：签名不匹配，检查 AccessKey Secret
   - `Forbidden`：AccessKey 没有权限访问该服务

5. **网络连接**
   - 确保服务器可以访问 `https://nls-meta.{region}.aliyuncs.com`
   - 检查防火墙设置

### 2. WebSocket 连接失败

- 检查 Token 是否有效（Token 有时效性，通常 24 小时）
- 验证区域配置是否正确
- 检查防火墙设置
- 查看浏览器控制台的 WebSocket 错误信息

### 3. 音频识别失败

- 确保浏览器已授予麦克风权限
- 检查音频格式和采样率设置
- 查看浏览器控制台错误信息
- 检查 WebSocket 连接状态

## 六、注意事项

1. **Token 有效期**：Token 通常有效期为 24 小时，需要定期刷新
2. **成本控制**：实时识别按音频时长计费，注意监控用量
3. **网络要求**：需要稳定的网络连接，建议使用 HTTPS
