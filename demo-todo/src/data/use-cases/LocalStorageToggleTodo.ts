import { Todo } from '../../domain/entities/Todo';
import { ToggleTodo } from '../../domain/use-cases/ToggleTodo';
import { TodoRepository } from '../protocols/TodoRepository';

export class LocalStorageToggleTodo implements ToggleTodo {
  constructor(private readonly todoRepository: TodoRepository) {}

  async execute(id: string): Promise<Todo> {
    const todo = await this.todoRepository.findById(id);
    if (!todo) {
      throw new Error(`Todo with id ${id} not found`);
    }
    return this.todoRepository.update(id, { completed: !todo.completed });
  }
}
