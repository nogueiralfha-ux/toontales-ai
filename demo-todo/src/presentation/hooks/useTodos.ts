import { useState, useEffect } from 'react';
import { Todo } from '../../domain/entities/Todo';
import { LocalStorageTodoRepository } from '../../data/repositories/LocalStorageTodoRepository';
import { LocalStorageCreateTodo } from '../../data/use-cases/LocalStorageCreateTodo';
import { LocalStorageGetTodos } from '../../data/use-cases/LocalStorageGetTodos';
import { LocalStorageToggleTodo } from '../../data/use-cases/LocalStorageToggleTodo';
import { LocalStorageDeleteTodo } from '../../data/use-cases/LocalStorageDeleteTodo';

const repository = new LocalStorageTodoRepository();
const createTodoUC = new LocalStorageCreateTodo(repository);
const getTodosUC = new LocalStorageGetTodos(repository);
const toggleTodoUC = new LocalStorageToggleTodo(repository);
const deleteTodoUC = new LocalStorageDeleteTodo(repository);

export const useTodos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const data = await getTodosUC.execute();
      setTodos(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch todos');
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (title: string, description?: string) => {
    try {
      const newTodo = await createTodoUC.execute({ title, description });
      setTodos(prev => [...prev, newTodo]);
    } catch (err: any) {
      setError(err.message || 'Failed to add todo');
      throw err;
    }
  };

  const toggleTodo = async (id: string) => {
    try {
      const updated = await toggleTodoUC.execute(id);
      setTodos(prev => prev.map(t => t.id === id ? updated : t));
    } catch (err: any) {
      setError(err.message || 'Failed to toggle todo');
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      await deleteTodoUC.execute(id);
      setTodos(prev => prev.filter(t => t.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete todo');
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  return {
    todos,
    loading,
    error,
    addTodo,
    toggleTodo,
    deleteTodo,
    clearError: () => setError(null),
  };
};
