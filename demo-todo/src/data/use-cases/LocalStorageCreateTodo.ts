import { Todo } from '../../domain/entities/Todo';
import { CreateTodo, CreateTodoModel } from '../../domain/use-cases/CreateTodo';
import { TodoRepository } from '../protocols/TodoRepository';

export class LocalStorageCreateTodo implements CreateTodo {
  constructor(private readonly todoRepository: TodoRepository) {}

  async execute(params: CreateTodoModel): Promise<Todo> {
    if (!params.title.trim()) {
      throw new Error('Title cannot be empty');
    }
    return this.todoRepository.create(params);
  }
}
