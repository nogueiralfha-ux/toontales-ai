import { Todo } from '../entities/Todo';

export interface ToggleTodo {
  execute(id: string): Promise<Todo>;
}
