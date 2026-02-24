'use client';

import { useAuth } from '@/contexts/AuthContext';
import { MyTodosFilter } from '@/components/todo/MyTodosFilter';
import { TodoListEditable } from '@/components/todo/TodoListEditable';
import { useTodos } from '@/hooks/useTodos';
import type { Todo } from '@/types/meeting';
import { LogIn, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface MyTodo extends Todo {
    meet?: {
        id: string;
        meeting_code: string;
        title: string;
        status: string;
    } | null;
}

const formatMeetingCode = (code: string) => {
    const digits = code.replace(/\D/g, '');
    return digits.replace(/(\d{3})(?=\d)/g, '$1 ');
};

export default function MyTodosPage() {
    const { user, isLoading } = useAuth();
    const { updateTodo, confirmTodo } = useTodos();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [todos, setTodos] = useState<MyTodo[]>([]);
    const [titleFilter, setTitleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [meetingCodeFilter, setMeetingCodeFilter] = useState('');
    const [showMoreFilters, setShowMoreFilters] = useState(false);

    const fetchTodos = async () => {
        if (!user) return;
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams();
            params.set('userId', user.id);
            if (titleFilter.trim()) params.set('title', titleFilter.trim());
            if (statusFilter) params.set('status', statusFilter);
            if (priorityFilter) params.set('priority', priorityFilter);
            if (meetingCodeFilter.trim()) params.set('meetingCode', meetingCodeFilter.trim());

            const res = await fetch(`/api/my/todos?${params.toString()}`);
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.error || data.message || 'Failed to fetch my todos');
            }
            setTodos(data.data.todos || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user || isLoading) return;
        void fetchTodos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, isLoading]);

    const handleConfirmTodo = async (id: string) => {
        try {
            await confirmTodo(id);
            setTodos(prev => prev.map(t => t.id === id ? { ...t, status: 'confirmed' as const } : t));
        } catch (err) {
            console.error('Failed to confirm todo:', err);
        }
    };

    const handleUpdateTodo = async (id: string, updates: Partial<Todo>) => {
        try {
            await updateTodo(id, updates);
            setTodos(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
        } catch (err) {
            console.error('Failed to update todo:', err);
        }
    };

    const handleResetFilters = () => {
        setTitleFilter('');
        setStatusFilter('');
        setPriorityFilter('');
        setMeetingCodeFilter('');
        void fetchTodos();
    };

    if (!user && !isLoading) {
        return (
            <div className="flex items-center justify-center h-[70vh]">
                <div className="text-center space-y-4">
                    <LogIn className="w-10 h-10 text-gray-400 mx-auto" />
                    <p className="text-gray-600">请先登录后查看我的任务。</p>
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
                <h1 className="text-2xl font-bold text-gray-900">我的任务</h1>
                <p className="text-sm text-gray-500">查看你在所有会议中生成的 Todo</p>
            </div>

            <MyTodosFilter
                titleFilter={titleFilter}
                statusFilter={statusFilter}
                priorityFilter={priorityFilter}
                meetingCodeFilter={meetingCodeFilter}
                showMoreFilters={showMoreFilters}
                setTitleFilter={setTitleFilter}
                setStatusFilter={setStatusFilter}
                setPriorityFilter={setPriorityFilter}
                setMeetingCodeFilter={setMeetingCodeFilter}
                setShowMoreFilters={setShowMoreFilters}
                onSearch={() => void fetchTodos()}
                onReset={handleResetFilters}
            />

            {loading && (
                <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-3" />
                        <p className="text-gray-600 text-sm">正在加载你的任务列表...</p>
                    </div>
                </div>
            )}

            {error && !loading && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                    {error}
                </div>
            )}

            {!loading && !error && todos.length === 0 && (
                <div className="py-16 text-center text-gray-500 text-sm">
                    暂无任务。完成一次会议后将自动为你生成 Todo。
                </div>
            )}

            {!loading && !error && todos.length > 0 && (
                <TodoListEditable<MyTodo>
                    todos={todos}
                    onConfirmTodo={handleConfirmTodo}
                    onUpdateTodo={handleUpdateTodo}
                    renderMeta={(todo) => {
                        const meet = todo.meet;
                        const meetingCode = meet?.meeting_code ? formatMeetingCode(meet.meeting_code) : '';
                        if (!meet) return null;
                        return (
                            <span>
                                会议：{meet.title || '未命名会议'}
                                {meetingCode && (
                                    <>
                                        {' '}
                                        · <span className="font-mono tracking-wider">{meetingCode}</span>
                                    </>
                                )}
                            </span>
                        );
                    }}
                    renderExtraActions={(todo) => {
                        const meet = todo.meet;
                        if (!meet) return null;
                        return (
                            <button
                                onClick={() =>
                                    router.push(
                                        todo.user_meet_id
                                            ? `/meet/${meet.meeting_code}/summary?userMeetId=${todo.user_meet_id}`
                                            : `/meet/${meet.meeting_code}/summary`
                                    )
                                }
                                className="inline-flex items-center px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700"
                            >
                                <MessageSquare className="w-3.5 h-3.5 mr-1" />
                                查看会议
                            </button>
                        );
                    }}
                />
            )}
        </div>
    );
}

