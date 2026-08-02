import React from 'react';
import { Todo } from '../../domain/entities/Todo';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onDelete }) => {
  // Acessibilidade: responder a cliques e teclado para o toggle
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle(todo.id);
    }
  };

  return (
    <li className={`todo-item ${todo.completed ? 'completed' : ''}`} data-testid="todo-item">
      <div className="todo-item-left">
        <button
          className={`checkbox ${todo.completed ? 'checked' : ''}`}
          onClick={() => onToggle(todo.id)}
          onKeyDown={handleKeyDown}
          aria-label={todo.completed ? `Marcar "${todo.title}" como pendente` : `Marcar "${todo.title}" como concluída`}
          aria-checked={todo.completed}
          role="checkbox"
          type="button"
        >
          {todo.completed && (
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="2.5 6 4.5 8 9.5 3" />
            </svg>
          )}
        </button>
        <span className="todo-title">{todo.title}</span>
      </div>
      <button
        className="delete-btn"
        onClick={() => onDelete(todo.id)}
        aria-label={`Deletar tarefa "${todo.title}"`}
        type="button"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      </button>
    </li>
  );
};
