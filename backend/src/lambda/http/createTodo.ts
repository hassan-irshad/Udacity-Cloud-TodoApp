import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import * as uuid from 'uuid'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'

const doClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  const itemId = uuid.v4();

  const newItem = {
    todoId: itemId,
    createdAt: new Date().toLocaleDateString(),
    done: false,
    ...newTodo
  }

  await doClient.put({
    TableName: todosTable,
    Item: newItem
  }).promise()
  

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
