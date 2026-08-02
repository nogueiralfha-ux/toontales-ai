export interface DeleteTodo {
  execute(id: string): Promise<void>;
}
