'use client';

import { synthesizeTTS } from '@/lib/aliyun-tts';
import { CheckCircle, Loader2, Pause, Play, Square, Volume2, XCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function TTSTestPage() {
    const [text, setText] = useState('你好，这是一段测试文字。阿里云语音合成功能测试。');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [voice, setVoice] = useState('aiqi');
    const [testHistory, setTestHistory] = useState<Array<{ text: string; timestamp: Date; success: boolean }>>([]);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const voices = [
        { id: 'aiqi', name: '艾琪（女声，温柔）' },
        { id: 'aiqi_emo', name: '艾琪（情感化）' },
        { id: 'aitong', name: '艾童（童声）' },
        { id: 'aijia', name: '艾佳（女声，知性）' },
        { id: 'aijia_emo', name: '艾佳（情感化）' },
        { id: 'aicheng', name: '艾诚（男声）' },
        { id: 'aicheng_emo', name: '艾诚（情感化）' },
        { id: 'lydia', name: '琳达（女声，中性）' }
    ];

    // 监听播放状态
    useEffect(() => {
        if (!audioRef.current) return;

        const audio = audioRef.current;

        const updatePlayingState = () => {
            setIsPlaying(!audio.paused && !audio.ended);
        };

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        const handleEnded = () => setIsPlaying(false);

        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('ended', handleEnded);

        const interval = setInterval(updatePlayingState, 100);

        return () => {
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('ended', handleEnded);
            clearInterval(interval);
        };
    }, [audioUrl]);

    // 合成并播放
    const handleSynthesize = async () => {
        if (!text.trim()) {
            setError('请输入要合成的文字');
            return;
        }

        setLoading(true);
        setError(null);
        setIsPlaying(false);

        try {
            const startTime = Date.now();
            const url = await synthesizeTTS(text, { voice });
            const duration = Date.now() - startTime;

            setAudioUrl(url);

            // 自动播放
            if (audioRef.current) {
                audioRef.current.src = url;
                await audioRef.current.play();
            }

            setTestHistory((prev) => [
                { text, timestamp: new Date(), success: true },
                ...prev.slice(0, 9), // 保留最近 10 条
            ]);

            console.log(`TTS synthesis completed in ${duration}ms`);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            setTestHistory((prev) => [
                { text, timestamp: new Date(), success: false },
                ...prev.slice(0, 9),
            ]);
        } finally {
            setLoading(false);
        }
    };

    // 仅合成，不播放
    const handleSynthesizeOnly = async () => {
        if (!text.trim()) {
            setError('请输入要合成的文字');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const startTime = Date.now();
            const url = await synthesizeTTS(text, { voice });
            const duration = Date.now() - startTime;

            setAudioUrl(url);
            if (audioRef.current) {
                audioRef.current.src = url;
            }

            setTestHistory((prev) => [
                { text, timestamp: new Date(), success: true },
                ...prev.slice(0, 9),
            ]);

            console.log(`TTS synthesis completed in ${duration}ms, audio URL: ${url.substring(0, 50)}...`);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            setTestHistory((prev) => [
                { text, timestamp: new Date(), success: false },
                ...prev.slice(0, 9),
            ]);
        } finally {
            setLoading(false);
        }
    };

    // 播放已合成的音频
    const handlePlay = async () => {
        if (!audioUrl || !audioRef.current) {
            setError('请先合成音频');
            return;
        }

        try {
            await audioRef.current.play();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to play audio');
        }
    };

    // 停止播放
    const handleStop = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsPlaying(false);
        }
    };

    // 暂停/恢复
    const handlePauseResume = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch((err) => {
                setError(err instanceof Error ? err.message : 'Failed to resume audio');
            });
        }
    };

    // 清除历史
    const handleClearHistory = () => {
        setTestHistory([]);
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">阿里云 TTS 测试页面</h1>
                    <p className="text-gray-600 mb-8">测试阿里云语音合成功能</p>

                    {/* 配置区域 */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700 mb-2">选择音色</label>
                        <select
                            value={voice}
                            onChange={(e) => setVoice(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            {voices.map((v) => (
                                <option key={v.id} value={v.id}>
                                    {v.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* 输入区域 */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">输入文字</label>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="请输入要合成的文字..."
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                        />
                        <p className="mt-2 text-sm text-gray-500">字符数: {text.length}</p>
                    </div>

                    {/* 错误提示 */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                            <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                            <p className="text-red-700">{error}</p>
                        </div>
                    )}

                    {/* 操作按钮 */}
                    <div className="flex flex-wrap gap-4 mb-6">
                        <button
                            onClick={handleSynthesize}
                            disabled={loading || !text.trim()}
                            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>合成中...</span>
                                </>
                            ) : (
                                <>
                                    <Volume2 className="w-5 h-5" />
                                    <span>合成并播放</span>
                                </>
                            )}
                        </button>

                        <button
                            onClick={handleSynthesizeOnly}
                            disabled={loading || !text.trim()}
                            className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>合成中...</span>
                                </>
                            ) : (
                                <>
                                    <Volume2 className="w-5 h-5" />
                                    <span>仅合成</span>
                                </>
                            )}
                        </button>

                        {audioUrl && (
                            <>
                                <button
                                    onClick={handlePlay}
                                    disabled={isPlaying}
                                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Play className="w-5 h-5" />
                                    <span>播放</span>
                                </button>

                                <button
                                    onClick={handlePauseResume}
                                    disabled={!isPlaying && !audioUrl}
                                    className="flex items-center gap-2 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Pause className="w-5 h-5" />
                                    <span>{isPlaying ? '暂停' : '恢复'}</span>
                                </button>

                                <button
                                    onClick={handleStop}
                                    disabled={!isPlaying}
                                    className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Square className="w-5 h-5" />
                                    <span>停止</span>
                                </button>
                            </>
                        )}
                    </div>

                    {/* 播放状态 */}
                    {isPlaying && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                            <Loader2 className="w-5 h-5 text-green-500 animate-spin" />
                            <p className="text-green-700">正在播放...</p>
                        </div>
                    )}

                    {/* 音频 URL 显示 */}
                    {audioUrl && (
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm font-medium text-blue-900 mb-2">音频已合成</p>
                            <p className="text-xs text-blue-700">格式: Data URL (Base64)</p>
                            {/* 隐藏的 audio 元素用于播放 */}
                            <audio ref={audioRef} src={audioUrl} className="hidden" />
                        </div>
                    )}

                    {/* 测试历史 */}
                    {testHistory.length > 0 && (
                        <div className="mt-8">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-900">测试历史</h2>
                                <button
                                    onClick={handleClearHistory}
                                    className="text-sm text-gray-600 hover:text-gray-900"
                                >
                                    清除
                                </button>
                            </div>
                            <div className="space-y-2">
                                {testHistory.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                                    >
                                        {item.success ? (
                                            <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                        ) : (
                                            <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-900">{item.text}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {item.timestamp.toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 使用说明 */}
                    <div className="mt-8 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                        <h3 className="text-sm font-semibold text-indigo-900 mb-2">使用说明</h3>
                        <ul className="text-sm text-indigo-700 space-y-1">
                            <li>• 输入要合成的文字，选择音色</li>
                            <li>• 点击"合成并播放"会自动合成并播放音频</li>
                            <li>• 点击"仅合成"只生成音频 URL，不自动播放</li>
                            <li>• 合成后的音频可以手动播放、暂停、停止</li>
                            <li>• 测试历史会记录最近 10 次测试结果</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
