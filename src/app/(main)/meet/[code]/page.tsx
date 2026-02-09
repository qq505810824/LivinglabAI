'use client';

import { ProcessingView } from '@/components/meeting/ProcessingView';
import { VoiceConversationView } from '@/components/meeting/VoiceConversationView';
import { useMeets } from '@/hooks/useMeets';
import { useUser } from '@/hooks/useUser';
import { useVoiceConversation } from '@/hooks/useVoiceConversation';
import type { Meet } from '@/types/meeting';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function MeetPage() {
    const params = useParams();
    const router = useRouter();
    const meetingCode = params.code as string;

    const { getMeetByCode, getMeetById, updateMeetStatus, loading: meetLoading } = useMeets();
    const { identifyUser } = useUser();
    const [meet, setMeet] = useState<Meet | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // 从URL参数获取平台信息
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const platform = urlParams.get('platform') as 'telegram' | 'whatsapp' | 'web' | null;
        const platformUserId = urlParams.get('userId');

        // 识别或创建用户
        if (platform && platformUserId) {
            identifyUser({
                platform,
                platformUserId,
                platformUsername: urlParams.get('username') || undefined,
                platformDisplayName: urlParams.get('displayName') || undefined,
            })
                .then((user) => {
                    if (user) {
                        setUserId(user.id);
                    }
                })
                .catch((err) => {
                    console.error('Failed to identify user:', err);
                });
        } else {
            // 默认使用web平台
            identifyUser({
                platform: 'web',
                platformUserId: `web-${Date.now()}`,
            })
                .then((user) => {
                    if (user) {
                        setUserId(user.id);
                    }
                })
                .catch((err) => {
                    console.error('Failed to identify user:', err);
                });
        }
    }, []);

    // 加载会议信息
    useEffect(() => {
        if (meetingCode) {
            loadMeet();
        }
    }, [meetingCode]);

    const loadMeet = async () => {
        try {
            const meetData = await getMeetByCode(meetingCode);
            if (meetData) {
                // 获取完整会议信息
                const fullMeet = await getMeetById(meetData.id);
                if (fullMeet) {
                    setMeet(fullMeet);
                } else {
                    // 如果获取不到完整信息，使用基本信息
                    setMeet({
                        id: meetData.id,
                        meeting_code: meetData.meetingCode,
                        title: meetData.title || '会议',
                        description: null,
                        host_id: '',
                        start_time: null,
                        duration: null,
                        status: meetData.status as any,
                        join_url: meetData.joinUrl,
                        created_at: '',
                        updated_at: '',
                        ended_at: null,
                    });
                }
            }
        } catch (err) {
            setError('会议不存在或已结束');
            console.error('Failed to load meet:', err);
        }
    };

    const handleEndMeeting = async () => {
        if (meet && window.confirm('确定要结束会议吗？')) {
            setIsProcessing(true);
            try {
                // 更新会议状态
                await updateMeetStatus(meet.id, 'ended');
                // ProcessingView 会在完成后调用 handleProcessingComplete
            } catch (err) {
                console.error('Failed to end meeting:', err);
                setIsProcessing(false);
            }
        }
    };

    const handleProcessingComplete = () => {
        // 处理完成后跳转到总结页面
        router.push(`/meet/${meetingCode}/summary`);
    };

    if (meetLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">加载中...</p>
                </div>
            </div>
        );
    }

    if (error || !meet) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error || '会议不存在'}</p>
                    <button
                        onClick={() => router.push('/')}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        返回首页
                    </button>
                </div>
            </div>
        );
    }

    if (!userId) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">正在初始化用户...</p>
                </div>
            </div>
        );
    }

    // 显示处理界面
    if (isProcessing) {
        return <ProcessingView onComplete={handleProcessingComplete} />;
    }

    return (
        <VoiceConversationContainer meet={meet} userId={userId} onEndMeeting={handleEndMeeting} />
    );
}

function VoiceConversationContainer({
    meet,
    userId,
    onEndMeeting,
}: {
    meet: Meet;
    userId: string;
    onEndMeeting: () => void;
}) {
    const {
        conversations,
        status,
        isRecording,
        handleStartRecording,
        handleStopRecording,
    } = useVoiceConversation(meet.id, userId);

    return (
        <VoiceConversationView
            meet={meet}
            conversations={conversations}
            status={status}
            isRecording={isRecording}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
            onEndMeeting={onEndMeeting}
        />
    );
}
