import { Todo } from '../../domain/entities/Todo';
import { CreateTodoModel } from '../../domain/use-cases/CreateTodo';

export interface TodoRepository {
  create(todo: CreateTodoModel): Promise<Todo>;
  findAll(): Promise<Todo[]>;
  findById(id: string): Promise<Todo | null>;
  update(id: string, data: Partial<Todo>): Promise<Todo>;
  delete(id: string): Promise<void>;
}
