import { Todo } from '../../domain/entities/Todo';
import { CreateTodoModel } from '../../domain/use-cases/CreateTodo';
import { TodoRepository } from '../protocols/TodoRepository';

export class LocalStorageTodoRepository implements TodoRepository {
  private readonly storageKey = '@TodoApp:todos';

  async create(params: CreateTodoModel): Promise<Todo> {
    const todos = await this.findAll();
    const newTodo: Todo = {
      id: Math.random().toString(36).substring(2, 9),
      title: params.title,
      description: params.description,
      completed: false,
      createdAt: new Date()
    };
    todos.push(newTodo);
    this.save(todos);
    return newTodo;
  }

  async findAll(): Promise<Todo[]> {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return parsed.map((todo: any) => ({
        ...todo,
        createdAt: new Date(todo.createdAt),
        updatedAt: todo.updatedAt ? new Date(todo.updatedAt) : undefined
      }));
    } catch (error) {
      console.error('Failed to parse todos from localStorage', error);
      return [];
    }
  }

  async findById(id: string): Promise<Todo | null> {
    const todos = await this.findAll();
    const todo = todos.find(t => t.id === id);
    return todo || null;
  }

  async update(id: string, data: Partial<Todo>): Promise<Todo> {
    const todos = await this.findAll();
    const todoIndex = todos.findIndex(t => t.id === id);
    if (todoIndex === -1) {
      throw new Error(`Todo with id ${id} not found`);
    }
    const updatedTodo = {
      ...todos[todoIndex],
      ...data,
      updatedAt: new Date()
    };
    todos[todoIndex] = updatedTodo;
    this.save(todos);
    return updatedTodo;
  }

  async delete(id: string): Promise<void> {
    const todos = await this.findAll();
    const filteredTodos = todos.filter(t => t.id !== id);
    this.save(filteredTodos);
  }

  private save(todos: Todo[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(todos));
    } catch (error) {
      console.error('Failed to save todos to localStorage', error);
    }
  }
}
