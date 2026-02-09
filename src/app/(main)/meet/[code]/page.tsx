'use client';

import { EndMeetingModal } from '@/components/meeting/EndMeetingModal';
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
    const [showEndMeetingModal, setShowEndMeetingModal] = useState(false);

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

    const handleEndMeeting = () => {
        // 显示结束会议 modal
        setShowEndMeetingModal(true);
    };

    const handleConfirmEndMeeting = async () => {
        setShowEndMeetingModal(false);
        if (meet) {
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

    const handleCancelEndMeeting = () => {
        setShowEndMeetingModal(false);
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
        <VoiceConversationContainer
            meet={meet}
            userId={userId}
            onEndMeeting={handleEndMeeting}
            showEndMeetingModal={showEndMeetingModal}
            onConfirmEndMeeting={handleConfirmEndMeeting}
            onCancelEndMeeting={handleCancelEndMeeting}
        />
    );
}

function VoiceConversationContainer({
    meet,
    userId,
    onEndMeeting,
    showEndMeetingModal,
    onConfirmEndMeeting,
    onCancelEndMeeting,
}: {
    meet: Meet;
    userId: string;
    onEndMeeting: () => void;
    showEndMeetingModal: boolean;
    onConfirmEndMeeting: () => void;
    onCancelEndMeeting: () => void;
}) {
    const {
        conversations,
        status,
        isRecording,
        handleStartRecording,
        handleStopRecording,
        resetConversation,
    } = useVoiceConversation(meet.id, userId);

    // 确认结束会议时的处理
    const handleConfirmEndMeetingWithReset = () => {
        // 打印所有对话记录
        console.log('=== 会议对话记录（本地） ===');
        console.log(`会议ID: ${meet.id}`);
        console.log(`会议标题: ${meet.title}`);
        console.log(`总对话数: ${conversations.length}`);
        console.log('对话详情:');
        conversations.forEach((conv, index) => {
            console.log(`\n[对话 ${index + 1}]`);
            console.log(`ID: ${conv.id}`);
            console.log(`用户发送时间: ${new Date(conv.user_sent_at).toLocaleString()}`);
            console.log(`用户消息: ${conv.user_message_text}`);
            console.log(`AI回复时间: ${new Date(conv.ai_responded_at).toLocaleString()}`);
            console.log(`AI回复: ${conv.ai_response_text}`);
            console.log(`用户音频时长: ${conv.user_audio_duration}秒`);
            console.log(`AI音频时长: ${conv.ai_audio_duration}秒`);
        });
        console.log('=== 对话记录结束 ===');

        // 重置 conversation_id
        resetConversation();
        // 调用父组件的确认处理
        onConfirmEndMeeting();
    };

    return (
        <>
            <VoiceConversationView
                meet={meet}
                conversations={conversations}
                status={status}
                isRecording={isRecording}
                onStartRecording={handleStartRecording}
                onStopRecording={handleStopRecording}
                onEndMeeting={onEndMeeting}
            />
            <EndMeetingModal
                isOpen={showEndMeetingModal}
                conversations={conversations}
                onConfirm={handleConfirmEndMeetingWithReset}
                onCancel={onCancelEndMeeting}
            />
        </>
    );
}
