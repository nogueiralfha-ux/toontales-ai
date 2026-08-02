import React, { useState, useEffect } from 'react';
import { useTodos } from '../hooks/useTodos';
import { TodoInput } from './TodoInput';
import { TodoList } from './TodoList';
import '../styles/index.css';

export const TodoApp: React.FC = () => {
  const { todos, loading, error, addTodo, toggleTodo, deleteTodo, clearError } = useTodos();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Carrega e aplica o tema salvo
  useEffect(() => {
    const savedTheme = localStorage.getItem('@TodoApp:theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('@TodoApp:theme', nextTheme);
  };

  return (
    <main className="container" aria-label="Aplicativo Todo List">
      <header className="header">
        <h1 className="title">Fábrica Todo List</h1>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={theme === 'light' ? 'Mudar para tema escuro' : 'Mudar para tema claro'}
          type="button"
        >
          {theme === 'light' ? (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          )}
        </button>
      </header>

      {error && (
        <div style={{ backgroundColor: 'hsla(346, 84%, 61%, 0.1)', color: 'hsl(346, 84%, 61%)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{error}</span>
          <button onClick={clearError} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
        </div>
      )}

      <TodoInput onAdd={addTodo} />

      {loading ? (
        <p className="empty-state">Carregando tarefas...</p>
      ) : (
        <TodoList todos={todos} onToggle={toggleTodo} onDelete={deleteTodo} />
      )}
    </main>
  );
};
