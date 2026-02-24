'use client';

import { useAuth } from '@/contexts/AuthContext';
import { LogIn, MessageSquare, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface MyUserMeet {
    id: string;
    meet_id: string;
    user_id: string;
    status: string;
    joined_at: string;
    completed_at: string | null;
    meet?: {
        id: string;
        meeting_code: string;
        title: string;
        status: string;
        join_url: string;
    } | null;
}

const formatMeetingCode = (code: string) => {
    const digits = code.replace(/\D/g, '');
    return digits.replace(/(\d{3})(?=\d)/g, '$1 ');
};

const formatDateTime = (iso: string | null) => {
    if (!iso) return '-';
    const d = new Date(iso);
    return d.toLocaleString();
};

const getStatusLabel = (status: string) => {
    switch (status) {
        case 'in_progress':
            return '进行中';
        case 'completed':
            return '已完成';
        case 'cancelled':
            return '已取消';
        case 'archived':
            return '已归档';
        default:
            return status;
    }
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'in_progress':
            return 'bg-blue-100 text-blue-700';
        case 'completed':
            return 'bg-green-100 text-green-700';
        case 'cancelled':
            return 'bg-red-100 text-red-700';
        case 'archived':
            return 'bg-gray-100 text-gray-600';
        default:
            return 'bg-gray-100 text-gray-700';
    }
};

export default function MyMeetsPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userMeets, setUserMeets] = useState<MyUserMeet[]>([]);

    useEffect(() => {
        if (!user || isLoading) return;

        const load = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await fetch(`/api/my/meets?userId=${encodeURIComponent(user.id)}`);
                const data = await res.json();
                if (!data.success) {
                    throw new Error(data.error || data.message || 'Failed to fetch my meets');
                }
                setUserMeets(data.data.userMeets || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        };

        void load();
    }, [user, isLoading]);

    if (!user && !isLoading) {
        return (
            <div className="flex items-center justify-center h-[70vh]">
                <div className="text-center space-y-4">
                    <LogIn className="w-10 h-10 text-gray-400 mx-auto" />
                    <p className="text-gray-600">请先登录后查看我的会议。</p>
                    <button
                        onClick={() => router.push('/login')}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
                    >
                        去登录
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">我的会议</h1>
                <p className="text-sm text-gray-500">查看你使用过的所有会议及其状态</p>
            </div>

            {loading && (
                <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-3" />
                        <p className="text-gray-600 text-sm">正在加载你的会议列表...</p>
                    </div>
                </div>
            )}

            {error && !loading && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                    {error}
                </div>
            )}

            {!loading && !error && userMeets.length === 0 && (
                <div className="py-16 text-center text-gray-500 text-sm">
                    你还没有参加过任何会议，可以先通过会议号加入一场会议。
                </div>
            )}

            <div className="space-y-3">
                {userMeets.map((um) => {
                    const code = um.meet?.meeting_code || '';
                    const formattedCode = formatMeetingCode(code);
                    const isCompleted = um.status === 'completed';
                    const isInProgress = um.status === 'in_progress';
                    const isCancelled = um.status === 'cancelled';

                    return (
                        <div
                            key={um.id}
                            className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h2 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                                        {um.meet?.title || '未命名会议'}
                                    </h2>
                                    <span
                                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                            um.status
                                        )}`}
                                    >
                                        {um.status === 'completed' && (
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                        )}
                                        {um.status === 'cancelled' && (
                                            <XCircle className="w-3 h-3 mr-1" />
                                        )}
                                        {getStatusLabel(um.status)}
                                    </span>
                                </div>
                                {formattedCode && (
                                    <p className="text-xs text-gray-500 mb-1">
                                        会议号：<span className="font-mono tracking-wider">{formattedCode}</span>
                                    </p>
                                )}
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-gray-500">
                                    <span className="inline-flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        加入时间：{formatDateTime(um.joined_at)}
                                    </span>
                                    {um.completed_at && (
                                        <span className="inline-flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            完成时间：{formatDateTime(um.completed_at)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="ml-4 flex flex-col gap-2">
                                {isInProgress && um.meet && (
                                    <button
                                        onClick={() => router.push(`/meet/${um.meet.meeting_code}`)}
                                        className="inline-flex items-center px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700"
                                    >
                                        <MessageSquare className="w-3.5 h-3.5 mr-1" />
                                        继续对话
                                    </button>
                                )}
                                {isCompleted && um.meet && (
                                    <button
                                        onClick={() =>
                                            router.push(
                                                `/meet/${um.meet.meeting_code}/summary?userMeetId=${um.id}`
                                            )
                                        }
                                        className="inline-flex items-center px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700"
                                    >
                                        <CheckCircle className="w-3.5 h-3.5 mr-1" />
                                        查看结果
                                    </button>
                                )}
                                {isCancelled && um.meet && (
                                    <button
                                        onClick={() => router.push(`/meet/${um.meet.meeting_code}`)}
                                        className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gray-200 text-gray-700 text-xs font-medium hover:bg-gray-300"
                                    >
                                        重新进入
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

