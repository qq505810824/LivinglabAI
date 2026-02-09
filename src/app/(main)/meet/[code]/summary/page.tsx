'use client';

import { useConversations } from '@/hooks/useConversations';
import { useMeets } from '@/hooks/useMeets';
import { useTodos } from '@/hooks/useTodos';
import type { Conversation, Todo } from '@/types/meeting';
import { ArrowLeft, CheckCircle, Clock, Edit2, MessageSquare, Save, User, X } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function MeetSummaryPage() {
    const params = useParams();
    const router = useRouter();
    const meetingCode = params.code as string;

    const { getMeetByCode, getMeetById, loading: meetLoading } = useMeets();
    const { getTodos, generateTodos, updateTodo, confirmTodo, loading: todosLoading } = useTodos();
    const { getConversations, loading: conversationsLoading } = useConversations();
    const [todos, setTodos] = useState<Todo[]>([]);
    const [summary, setSummary] = useState<string>('');
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<{
        title: string;
        description: string;
        priority: 'low' | 'medium' | 'high';
        dueDate: string;
        reminderTime: string;
    } | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const meetData = await getMeetByCode(meetingCode);
            if (meetData) {
                // 获取完整会议信息（包含summary、conversations、todos）
                const fullMeet = await getMeetById(meetData.id);

                // 从会议详情中获取对话记录、todos和summary
                if (fullMeet) {
                    // 设置对话记录（从Supabase获取）
                    if (fullMeet.conversations && Array.isArray(fullMeet.conversations)) {
                        const sortedConversations = [...fullMeet.conversations].sort(
                            (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                        );
                        setConversations(sortedConversations);
                    }

                    // 设置todos（从Supabase获取）
                    if (fullMeet.todos && Array.isArray(fullMeet.todos)) {
                        setTodos(fullMeet.todos);
                    }

                    // 设置summary（从Supabase获取）
                    if (fullMeet.summary && typeof fullMeet.summary === 'object' && 'summary' in fullMeet.summary) {
                        setSummary((fullMeet.summary as any).summary || '');
                    }
                }

                // 检查是否已有summary和todos
                const todosData = await getTodos({ meetId: meetData.id });
                const hasSummary = (fullMeet as any)?.summary && typeof (fullMeet as any).summary === 'object';
                const hasTodos = todosData && todosData.todos.length > 0;

                // 如果还没有summary和todos，则生成（会议刚结束时）
                if (!hasSummary && !hasTodos) {
                    setIsGenerating(true);
                    try {
                        const generated = await generateTodos(meetData.id);
                        if (generated) {
                            setTodos(generated.todos);
                            // generated.summary 是 MeetSummary 对象
                            if (generated.summary && typeof generated.summary === 'object' && 'summary' in generated.summary) {
                                setSummary((generated.summary as any).summary);
                            }
                        }
                    } catch (err) {
                        console.error('Failed to generate todos:', err);
                    } finally {
                        setIsGenerating(false);
                    }
                } else if (hasTodos && !hasSummary) {
                    // 如果已有todos但没有summary，只生成summary
                    setIsGenerating(true);
                    try {
                        const generated = await generateTodos(meetData.id);
                        if (generated && generated.summary) {
                            if (typeof generated.summary === 'object' && 'summary' in generated.summary) {
                                setSummary((generated.summary as any).summary);
                            }
                        }
                    } catch (err) {
                        console.error('Failed to generate summary:', err);
                    } finally {
                        setIsGenerating(false);
                    }
                }
            }
        } catch (err) {
            console.error('Failed to load data:', err);
            setIsGenerating(false);
        }
    };

    const handleConfirmTodo = async (id: string) => {
        try {
            await confirmTodo(id);
            setTodos(todos.map(t => t.id === id ? { ...t, status: 'confirmed' as const } : t));
        } catch (err) {
            console.error('Failed to confirm todo:', err);
        }
    };

    const handleStartEdit = (todo: Todo) => {
        // 检查是否可以编辑（已完成或进行中的不可编辑）
        if (todo.status === 'completed' || todo.status === 'in_progress') {
            return;
        }

        setEditingTodoId(todo.id);
        setEditForm({
            title: todo.title,
            description: todo.description || '',
            priority: todo.priority,
            dueDate: todo.due_date ? new Date(todo.due_date).toISOString().slice(0, 16) : '',
            reminderTime: todo.reminder_time ? new Date(todo.reminder_time).toISOString().slice(0, 16) : '',
        });
    };

    const handleCancelEdit = () => {
        setEditingTodoId(null);
        setEditForm(null);
    };

    const handleSaveEdit = async (id: string) => {
        if (!editForm) return;

        try {
            const updates: Partial<Todo> = {
                title: editForm.title,
                description: editForm.description || null,
                priority: editForm.priority,
                due_date: editForm.dueDate ? new Date(editForm.dueDate).toISOString() : null,
                reminder_time: editForm.reminderTime ? new Date(editForm.reminderTime).toISOString() : null,
            };

            await updateTodo(id, updates);
            setTodos(todos.map(t => t.id === id ? { ...t, ...updates } : t));
            setEditingTodoId(null);
            setEditForm(null);
        } catch (err) {
            console.error('Failed to update todo:', err);
        }
    };

    const handleUpdateTodo = async (id: string, updates: Partial<Todo>) => {
        try {
            await updateTodo(id, updates);
            setTodos(todos.map(t => t.id === id ? { ...t, ...updates } : t));
        } catch (err) {
            console.error('Failed to update todo:', err);
        }
    };

    const canEdit = (status: string) => {
        return status === 'draft' || status === 'confirmed';
    };

    const getPriorityColor = (priority: string) => {
        const colorMap: Record<string, string> = {
            low: 'bg-green-100 text-green-700',
            medium: 'bg-yellow-100 text-yellow-700',
            high: 'bg-red-100 text-red-700',
        };
        return colorMap[priority] || 'bg-gray-100 text-gray-700';
    };

    const getPriorityText = (priority: string) => {
        const textMap: Record<string, string> = {
            low: '低',
            medium: '中',
            high: '高',
        };
        return textMap[priority] || priority;
    };

    if (meetLoading || isGenerating || conversationsLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">正在加载会议数据...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => router.push('/')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-3xl font-bold text-gray-900">会议总结</h1>
            </div>

            {summary && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">会议总结</h2>
                    <p className="text-gray-700 leading-relaxed">{summary}</p>
                </div>
            )}

            {/* 对话记录区域 */}
            {conversations.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="flex items-center gap-2 mb-6">
                        <MessageSquare className="w-5 h-5 text-indigo-600" />
                        <h2 className="text-xl font-bold text-gray-900">对话记录</h2>
                        <span className="text-sm text-gray-500 ml-2">({conversations.length} 条)</span>
                    </div>
                    <div className="space-y-4 max-h-[600px] overflow-y-auto">
                        {conversations.map((conv, index) => (
                            <div
                                key={conv.id}
                                className="border-l-4 border-indigo-500 pl-4 py-3 bg-gray-50 rounded-r-lg"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span className="text-xs text-gray-500 font-mono">
                                        {new Date(conv.user_sent_at).toLocaleString('zh-CN', {
                                            year: 'numeric',
                                            month: '2-digit',
                                            day: '2-digit',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit',
                                        })}
                                    </span>
                                    <span className="text-xs text-gray-400">#{index + 1}</span>
                                </div>

                                {/* 用户消息 */}
                                <div className="mb-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <User className="w-4 h-4 text-indigo-600" />
                                        <span className="text-sm font-semibold text-indigo-600">您</span>
                                    </div>
                                    <p className="text-sm text-gray-700 bg-white p-3 rounded-lg border border-gray-200 ml-6">
                                        {conv.user_message_text}
                                    </p>
                                    {conv.user_audio_duration && (
                                        <span className="text-xs text-gray-400 ml-6">
                                            录音时长: {conv.user_audio_duration}秒
                                        </span>
                                    )}
                                </div>

                                {/* AI回复 */}
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <MessageSquare className="w-4 h-4 text-teal-600" />
                                        <span className="text-sm font-semibold text-teal-600">AI助手</span>
                                    </div>
                                    <p className="text-sm text-gray-700 bg-teal-50 p-3 rounded-lg border border-teal-200 ml-6">
                                        {conv.ai_response_text}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">任务列表</h2>
                <div className="space-y-4">
                    {todos.map((todo) => {
                        const isEditing = editingTodoId === todo.id;
                        const editable = canEdit(todo.status);

                        return (
                            <div
                                key={todo.id}
                                className={`p-4 rounded-lg border ${todo.status === 'confirmed'
                                    ? 'bg-green-50 border-green-200'
                                    : todo.status === 'completed'
                                        ? 'bg-gray-50 border-gray-200 opacity-60'
                                        : todo.status === 'in_progress'
                                            ? 'bg-blue-50 border-blue-200'
                                            : 'bg-white border-gray-200'
                                    }`}
                            >
                                {isEditing && editForm ? (
                                    // 编辑模式
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                任务标题 *
                                            </label>
                                            <input
                                                type="text"
                                                value={editForm.title}
                                                onChange={(e) =>
                                                    setEditForm({ ...editForm, title: e.target.value })
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                placeholder="输入任务标题"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                任务描述
                                            </label>
                                            <textarea
                                                value={editForm.description}
                                                onChange={(e) =>
                                                    setEditForm({ ...editForm, description: e.target.value })
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                rows={3}
                                                placeholder="输入任务描述（可选）"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    优先级
                                                </label>
                                                <select
                                                    value={editForm.priority}
                                                    onChange={(e) =>
                                                        setEditForm({
                                                            ...editForm,
                                                            priority: e.target.value as 'low' | 'medium' | 'high',
                                                        })
                                                    }
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                >
                                                    <option value="low">低</option>
                                                    <option value="medium">中</option>
                                                    <option value="high">高</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    截止时间
                                                </label>
                                                <input
                                                    type="datetime-local"
                                                    value={editForm.dueDate}
                                                    onChange={(e) =>
                                                        setEditForm({ ...editForm, dueDate: e.target.value })
                                                    }
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    提醒时间
                                                </label>
                                                <input
                                                    type="datetime-local"
                                                    value={editForm.reminderTime}
                                                    onChange={(e) =>
                                                        setEditForm({ ...editForm, reminderTime: e.target.value })
                                                    }
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 pt-2">
                                            <button
                                                onClick={() => handleSaveEdit(todo.id)}
                                                disabled={!editForm.title.trim()}
                                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <Save className="w-4 h-4" />
                                                确认更新
                                            </button>
                                            <button
                                                onClick={handleCancelEdit}
                                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                                取消
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    // 查看模式
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 mb-1">{todo.title}</h3>
                                            {todo.description && (
                                                <p className="text-sm text-gray-600 mb-2">{todo.description}</p>
                                            )}
                                            <div className="flex items-center gap-3 text-xs flex-wrap">
                                                <span className={`px-2 py-1 rounded ${getPriorityColor(todo.priority)}`}>
                                                    {getPriorityText(todo.priority)}优先级
                                                </span>
                                                {todo.due_date && (
                                                    <div className="flex items-center gap-1 text-gray-500">
                                                        <Clock className="w-3 h-3" />
                                                        <span>
                                                            截止: {new Date(todo.due_date).toLocaleString('zh-CN', {
                                                                year: 'numeric',
                                                                month: '2-digit',
                                                                day: '2-digit',
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            })}
                                                        </span>
                                                    </div>
                                                )}
                                                {todo.reminder_time && (
                                                    <div className="flex items-center gap-1 text-gray-500">
                                                        <Clock className="w-3 h-3" />
                                                        <span>
                                                            提醒: {new Date(todo.reminder_time).toLocaleString('zh-CN', {
                                                                year: 'numeric',
                                                                month: '2-digit',
                                                                day: '2-digit',
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            })}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {editable && (
                                                <button
                                                    onClick={() => handleStartEdit(todo)}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="编辑任务"
                                                >
                                                    <Edit2 className="w-5 h-5" />
                                                </button>
                                            )}
                                            {todo.status === 'draft' && (
                                                <button
                                                    onClick={() => handleConfirmTodo(todo.id)}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="确认任务"
                                                >
                                                    <CheckCircle className="w-5 h-5" />
                                                </button>
                                            )}
                                            {todo.status === 'confirmed' && (
                                                <span className="text-xs text-green-600 font-semibold">已确认</span>
                                            )}
                                            {todo.status === 'completed' && (
                                                <span className="text-xs text-gray-500 font-semibold">已完成</span>
                                            )}
                                            {todo.status === 'in_progress' && (
                                                <span className="text-xs text-blue-600 font-semibold">进行中</span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {todos.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">暂无任务</p>
                    </div>
                )}
            </div>
        </div>
    );
}
