import 'source-map-support/register'
import * as AWS from 'aws-sdk'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { createLogger } from '../../utils/logger'

const doClient = new AWS.DynamoDB.DocumentClient()

const todosTable = process.env.TODOS_TABLE

const logger = createLogger('updateTodo')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

  logger.info('Finding todo of the given id')
  
  const validTodoId = await todoExists(todoId)

  if (!validTodoId) {
    logger.info('Todo does not exist')
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Todo does not exist'
      })
    }
  }

  await doClient.update({
      TableName: todosTable,
      Key: {
          todoId: todoId
      },
      UpdateExpression: "set #name = :n, #dueDate = :d, #done = :s",
      ExpressionAttributeNames: {
        "#name": "name",
        "#dueDate": "dueDate",
        "#done": "done"
      },
      ExpressionAttributeValues:{
        ":n": updatedTodo.name,
        ":d": updatedTodo.dueDate,
        ":s": updatedTodo.done
    },
    ReturnValues:"UPDATED_NEW"
  }).promise()

  logger.info('Todo updated')

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: 'Todo Updated'
    })
  }
}

async function todoExists(todoId: string) {
    const result = await doClient
      .get({
        TableName: todosTable,
        Key: {
          todoId
        }
      })
      .promise()
  
    console.log('Get todo: ', result)
    return !!result.Item
  }