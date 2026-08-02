import { Todo } from '../entities/Todo';

export interface GetTodos {
  execute(): Promise<Todo[]>;
}
