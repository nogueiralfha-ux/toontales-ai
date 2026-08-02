import { Todo } from '../entities/Todo';

export interface CreateTodoModel {
  title: string;
  description?: string;
}

export interface CreateTodo {
  execute(params: CreateTodoModel): Promise<Todo>;
}
