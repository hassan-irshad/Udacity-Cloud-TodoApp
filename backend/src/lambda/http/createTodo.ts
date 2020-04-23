import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import * as uuid from 'uuid'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { parseUserId } from '../../auth/utils'
import { createLogger } from '../../utils/logger'

const doClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

const logger = createLogger('createTodo')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  const userId = parseUserId(event.headers.Authorization.split(' ')[1])
  const itemId = uuid.v4();

  logger.info('Creating new todo')

  const newItem = {
    todoId: itemId,
    createdAt: new Date().toISOString(),
    done: false,
    userId,
    ...newTodo
  }

  await doClient.put({
    TableName: todosTable,
    Item: newItem
  }).promise()
  
  logger.info('Todo created')

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      newItem
    })
  }
}
