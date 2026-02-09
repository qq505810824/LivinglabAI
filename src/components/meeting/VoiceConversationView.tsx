'use client';

import type { Conversation, Meet } from '@/types/meeting';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, Lock, Mic, MicOff, MoreVertical, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AIAvatar } from './AIAvatar';
import { StatusIndicator } from './StatusIndicator';

interface VoiceConversationViewProps {
    meet: Meet;
    conversations: Conversation[];
    status: 'idle' | 'recording' | 'transcribing' | 'processing' | 'speaking';
    isRecording: boolean;
    onStartRecording: () => void;
    onStopRecording: () => void;
    onEndMeeting?: () => void;
}

export const VoiceConversationView = ({
    meet,
    conversations,
    status,
    isRecording,
    onStartRecording,
    onStopRecording,
    onEndMeeting,
}: VoiceConversationViewProps) => {
    const [time, setTime] = useState(0);
    const router = useRouter();
    useEffect(() => {
        const timer = setInterval(() => setTime(t => t + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getStatusText = (status: string) => {
        const statusMap: Record<string, string> = {
            pending: '待开始',
            ongoing: '进行中',
            ended: '已结束',
            cancelled: '已取消',
        };
        return statusMap[status] || status;
    };

    return (
        <div className="flex flex-col items-center justify-center  bg-gray-100 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative w-full max-w-[400px] h-[750px] bg-gray-900 rounded-[3rem] overflow-hidden shadow-2xl border-[10px] border-gray-800 flex flex-col ring-1 ring-white/10"
            >
                {/* WhatsApp Top Bar */}
                <div className="absolute top-0 left-0 right-0 p-6 pt-8 z-20 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent">
                    <ArrowLeftIcon className="text-white cursor-pointer hover:opacity-80" size={32} onClick={() => router.back()} />
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-1.5 text-gray-300 text-[11px] mb-1.5 bg-black/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
                            <Lock size={10} /> 端到端加密
                        </div>
                        <h2 className="text-white text-2xl font-semibold tracking-wide drop-shadow-md">
                            {meet.title || 'AI会议'}
                        </h2>
                        <span className="text-gray-200 text-base font-medium drop-shadow-md">
                            {formatTime(time)}
                        </span>
                        {meet.status && (
                            <span className="text-gray-300 text-xs mt-1">
                                {getStatusText(meet.status)}
                            </span>
                        )}
                    </div>
                    <div className="w-8" /> {/* 占位符保持居中 */}
                </div>

                {/* Main Content: AI Avatar and Conversations */}
                <div className="flex-1 bg-[#111b21] relative flex flex-col items-center justify-center overflow-hidden">
                    {/* Background Pattern */}
                    <div
                        className="absolute inset-0 opacity-5"
                        style={{
                            backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
                            backgroundSize: '24px 24px',
                        }}
                    />

                    {/* AI Avatar */}
                    <div className="relative z-10 scale-110">
                        <AIAvatar isSpeaking={status === 'speaking'} />
                    </div>

                    {/* Status Indicator */}
                    <div className="relative z-10 mt-4">
                        <StatusIndicator status={status} />
                    </div>

                    {/* Conversation History - 只显示最后一次对话，显示在状态指示下方 */}
                    {conversations.length > 0 && (() => {
                        const lastConversation = conversations[conversations.length - 1];
                        return (
                            <motion.div
                                key={lastConversation.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="relative z-10 mt-6 w-full max-w-sm px-4"
                            >
                                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 shadow-sm border border-white/5">
                                    <div className="text-xs text-gray-400 mb-2">
                                        {new Date(lastConversation.user_sent_at).toLocaleTimeString()}
                                    </div>
                                    <div className="text-sm text-white/90 mb-2">
                                        <span className="font-semibold">您：</span>
                                        {lastConversation.user_message_text}
                                    </div>
                                    <div className="text-sm text-teal-300">
                                        <span className="font-semibold">AI：</span>
                                        {lastConversation.ai_response_text}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })()}
                </div>

                {/* WhatsApp Bottom Controls */}
                <div className="bg-[#111b21] px-6 pb-10 pt-6">
                    {/* Swipe Up Indicator */}
                    <div className="w-full flex justify-center mb-6">
                        <div className="w-10 h-1.5 bg-gray-600 rounded-full opacity-50"></div>
                    </div>
                    <div className="flex items-center justify-between px-6 bg-[#1f2c34] rounded-full py-4 shadow-lg border border-white/5">
                        <button className="text-gray-400 hover:text-white transition-colors p-1">
                            <MoreVertical size={26} />
                        </button>

                        {/* 录音按钮 - 居中，更大 */}
                        <button
                            onClick={isRecording ? onStopRecording : onStartRecording}
                            disabled={status !== 'idle' && !isRecording}
                            className={`
                                w-16 h-16 rounded-full flex items-center justify-center
                                transition-all duration-300 shadow-lg
                                ${isRecording
                                    ? 'bg-red-500 hover:bg-red-600 scale-110 animate-pulse'
                                    : 'bg-indigo-600 hover:bg-indigo-700 scale-100'
                                }
                                ${status !== 'idle' && !isRecording ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                active:scale-95
                            `}
                        >
                            {isRecording ? (
                                <MicOff className="w-8 h-8 text-white" />
                            ) : (
                                <Mic className="w-8 h-8 text-white" />
                            )}
                        </button>

                        {/* 挂断按钮 */}
                        {onEndMeeting && (
                            <button
                                onClick={onEndMeeting}
                                className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg active:scale-95 transition-transform hover:bg-red-600"
                            >
                                <Phone size={28} className="fill-current rotate-[135deg]" />
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
