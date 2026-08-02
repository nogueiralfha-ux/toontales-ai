import React, { useState } from 'react';

interface TodoInputProps {
  onAdd: (title: string) => Promise<void>;
}

export const TodoInput: React.FC<TodoInputProps> = ({ onAdd }) => {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || loading) return;

    try {
      setLoading(true);
      await onAdd(title);
      setTitle('');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <input
        className="input"
        type="text"
        placeholder="Adicione uma nova tarefa..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={loading}
        aria-label="Nova tarefa"
        required
      />
      <button className="btn" type="submit" disabled={loading || !title.trim()}>
        {loading ? 'Adicionando...' : 'Adicionar'}
      </button>
    </form>
  );
};
