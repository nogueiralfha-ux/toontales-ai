import { DeleteTodo } from '../../domain/use-cases/DeleteTodo';
import { TodoRepository } from '../protocols/TodoRepository';

export class LocalStorageDeleteTodo implements DeleteTodo {
  constructor(private readonly todoRepository: TodoRepository) {}

  async execute(id: string): Promise<void> {
    const todo = await this.todoRepository.findById(id);
    if (!todo) {
      throw new Error(`Todo with id ${id} not found`);
    }
    return this.todoRepository.delete(id);
  }
}
