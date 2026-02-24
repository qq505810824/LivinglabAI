import type { Todo } from '@/types/meeting';
import { CheckCircle, Clock, Edit2, Save, X } from 'lucide-react';
import { useState } from 'react';

export interface TodoListEditableProps<T extends Todo = Todo> {
    todos: T[];
    onConfirmTodo: (id: string) => Promise<void> | void;
    onUpdateTodo: (id: string, updates: Partial<Todo>) => Promise<void> | void;
    /** 自定义在标题下方展示的额外信息（例如会议信息） */
    renderMeta?: (todo: T) => React.ReactNode;
    /** 自定义右侧操作区域的附加操作（例如“查看会议”按钮） */
    renderExtraActions?: (todo: T) => React.ReactNode;
}

type EditFormState = {
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    dueDate: string;
    reminderTime: string;
} | null;

export function TodoListEditable<T extends Todo = Todo>({
    todos,
    onConfirmTodo,
    onUpdateTodo,
    renderMeta,
    renderExtraActions,
}: TodoListEditableProps<T>) {
    const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<EditFormState>(null);

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

    const handleStartEdit = (todo: T) => {
        if (!canEdit(todo.status)) return;

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

        const updates: Partial<Todo> = {
            title: editForm.title,
            description: editForm.description || null,
            priority: editForm.priority,
            due_date: editForm.dueDate ? new Date(editForm.dueDate).toISOString() : null,
            reminder_time: editForm.reminderTime ? new Date(editForm.reminderTime).toISOString() : null,
        };

        await onUpdateTodo(id, updates);
        setEditingTodoId(null);
        setEditForm(null);
    };

    const handleConfirm = async (id: string) => {
        // 确认任务时强制退出编辑模式
        if (editingTodoId === id) {
            setEditingTodoId(null);
            setEditForm(null);
        }
        await onConfirmTodo(id);
    };

    return (
        <div className="space-y-4">
            {todos.map((todo) => {
                const editable = canEdit(todo.status);
                const isEditing = editable && editingTodoId === todo.id;

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
                                                setEditForm({
                                                    ...editForm,
                                                    reminderTime: e.target.value,
                                                })
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
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 mb-1">{todo.title}</h3>

                                    {renderMeta && (
                                        <div className="mb-1 text-xs text-gray-500">
                                            {renderMeta(todo)}
                                        </div>
                                    )}

                                    {todo.description && (
                                        <p className="text-sm text-gray-600 mb-2">{todo.description}</p>
                                    )}
                                    <div className="flex items-center gap-3 text-xs flex-wrap">
                                        <span
                                            className={`px-2 py-1 rounded ${getPriorityColor(todo.priority)}`}
                                        >
                                            {getPriorityText(todo.priority)}优先级
                                        </span>
                                        {todo.due_date && (
                                            <div className="flex items-center gap-1 text-gray-500">
                                                <Clock className="w-3 h-3" />
                                                <span>
                                                    截止:{' '}
                                                    {new Date(todo.due_date).toLocaleString('zh-CN', {
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
                                                    提醒:{' '}
                                                    {new Date(todo.reminder_time).toLocaleString('zh-CN', {
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
                                    {editable && todo.status !== 'confirmed' && (
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
                                            onClick={() => handleConfirm(todo.id)}
                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                            title="确认任务"
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                        </button>
                                    )}
                                    {todo.status === 'confirmed' && (
                                        <span className="text-xs text-green-600 font-semibold">
                                            已确认
                                        </span>
                                    )}
                                    {todo.status === 'completed' && (
                                        <span className="text-xs text-gray-500 font-semibold">
                                            已完成
                                        </span>
                                    )}
                                    {todo.status === 'in_progress' && (
                                        <span className="text-xs text-blue-600 font-semibold">
                                            进行中
                                        </span>
                                    )}
                                    {renderExtraActions && renderExtraActions(todo)}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}

            {todos.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500">暂无任务</p>
                </div>
            )}
        </div>
    );
}

