'use client';

import { useMeets } from '@/hooks/useMeets';
import type { Meet } from '@/types/meeting';
import { Calendar, Clock, Copy, ExternalLink, Plus, Users } from 'lucide-react';
import moment from 'moment';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function MeetsPage() {
    const { getMeets, createMeet, loading, error } = useMeets();
    const [meets, setMeets] = useState<Meet[]>([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startTime: '',
        duration: 60,
    });

    useEffect(() => {
        loadMeets();
    }, []);

    const loadMeets = async () => {
        try {
            const data = await getMeets({ limit: 50 });
            if (data) {
                setMeets(data.meets);
            }
        } catch (err) {
            console.error('Failed to load meets:', err);
        }
    };

    const handleCreateMeet = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const newMeet = await createMeet({
                title: formData.title,
                description: formData.description || undefined,
                startTime: formData.startTime || new Date().toISOString(),
                duration: formData.duration,
                hostId: 'user-001', // Mock admin user
            });

            if (newMeet) {
                setMeets([newMeet, ...meets]);
                setShowCreateForm(false);
                setFormData({ title: '', description: '', startTime: '', duration: 60 });
            }
        } catch (err) {
            console.error('Failed to create meet:', err);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const getStatusColor = (status: string) => {
        const colorMap: Record<string, string> = {
            pending: 'bg-gray-100 text-gray-700',
            ongoing: 'bg-green-100 text-green-700',
            ended: 'bg-blue-100 text-blue-700',
            cancelled: 'bg-red-100 text-red-700',
        };
        return colorMap[status] || 'bg-gray-100 text-gray-700';
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">会议管理</h1>
                    <p className="mt-2 text-gray-600">创建和管理会议</p>
                </div>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    创建会议
                </button>
            </div>

            {showCreateForm && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">创建新会议</h2>
                    <form onSubmit={handleCreateMeet} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                会议标题 *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="输入会议标题"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                会议描述
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                rows={3}
                                placeholder="输入会议描述（可选）"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    开始时间
                                </label>
                                <input
                                    type="datetime-local"
                                    value={formData.startTime}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    预计时长（分钟）
                                </label>
                                <input
                                    type="number"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 60 })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    min="1"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                            >
                                {loading ? '创建中...' : '创建会议'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowCreateForm(false)}
                                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                取消
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            <div className="grid gap-6">
                {meets.map((meet) => (
                    <div
                        key={meet.id}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-xl font-bold text-gray-900">{meet.title}</h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(meet.status)}`}>
                                        {getStatusText(meet.status)}
                                    </span>
                                </div>
                                {meet.description && (
                                    <p className="text-gray-600 mb-3">{meet.description}</p>
                                )}
                                <div className="flex items-center gap-6 text-sm text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>会议号: {meet.meeting_code}</span>
                                    </div>
                                    {meet.start_time && (
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            <span>{moment(meet.start_time).format('YYYY-MM-DD HH:mm:ss')}</span>
                                        </div>
                                    )}
                                    {meet.duration && (
                                        <div className="flex items-center gap-1">
                                            <Users className="w-4 h-4" />
                                            <span>预计 {meet.duration} 分钟</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                            <div className="flex-1 bg-gray-50 rounded-lg px-4 py-2 flex items-center justify-between">
                                <span className="text-sm text-gray-600 font-mono">{meet.join_url}</span>
                                <button
                                    onClick={() => copyToClipboard(meet.join_url)}
                                    className="text-indigo-600 hover:text-indigo-700"
                                    title="复制链接"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                            <Link
                                href={`/meet/${meet.meeting_code}`}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                            >
                                <ExternalLink className="w-4 h-4" />
                                进入会议
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {meets.length === 0 && !loading && (
                <div className="text-center py-12">
                    <p className="text-gray-500">还没有会议，创建第一个会议吧！</p>
                </div>
            )}
        </div>
    );
}
