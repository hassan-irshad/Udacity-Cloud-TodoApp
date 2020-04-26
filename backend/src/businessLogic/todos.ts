import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodoAccess } from '../dataLayer/todosAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { parseUserId } from '../auth/utils'

const todoAccess = new TodoAccess()
const bucketName = process.env.IMAGES_S3_BUCKET

export async function getAllTodos(jwtToken: string): Promise<TodoItem[]> {
    const userId = parseUserId(jwtToken)
  return todoAccess.getAllTodos(userId)
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  jwtToken: string
): Promise<TodoItem> {

  const itemId = uuid.v4()
  const userId = parseUserId(jwtToken)

  return await todoAccess.createTodo({
    todoId: itemId,
    createdAt: new Date().toISOString(),
    done: false,
    userId,
    ...createTodoRequest
  })
}

export async function updateTodo(updateTodoRequest: UpdateTodoRequest, todoId: string, jwtToken: string) {
    const userId = parseUserId(jwtToken)
    return await todoAccess.updateTodo(updateTodoRequest, todoId, userId)
}

export async function deleteTodo(todoId: string, jwtToken: string) {
    const userId = parseUserId(jwtToken)
    return await todoAccess.deleteTodo(todoId, userId)
}

export async function todoExist(todoId: string, jwtToken: string) {
    const userId = parseUserId(jwtToken)
    return await todoAccess.todoExists(todoId, userId)
} 

export async function saveImageUrl(todoId: string, imageId: string, jwtToken) {
    const userId = parseUserId(jwtToken)
    const imageUrl = `https://${bucketName}.s3.amazonaws.com/${imageId}`
    return await todoAccess.saveImageUrl(userId, todoId, imageUrl)
}