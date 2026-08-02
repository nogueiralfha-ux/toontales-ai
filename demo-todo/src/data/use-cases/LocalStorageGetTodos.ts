import { Todo } from '../../domain/entities/Todo';
import { GetTodos } from '../../domain/use-cases/GetTodos';
import { TodoRepository } from '../protocols/TodoRepository';

export class LocalStorageGetTodos implements GetTodos {
  constructor(private readonly todoRepository: TodoRepository) {}

  async execute(): Promise<Todo[]> {
    return this.todoRepository.findAll();
  }
}
