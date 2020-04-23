import 'source-map-support/register'
import * as AWS from 'aws-sdk'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { parseUserId } from '../../auth/utils'

const doClient = new AWS.DynamoDB.DocumentClient()

const todosTable = process.env.TODOS_TABLE
const indexName = process.env.INDEX_NAME

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing Event: ', event)
  const userId = parseUserId(event.headers.Authorization.split(' ')[1])
  
  // const result = await doClient.scan({
  //   TableName: todosTable
  // }).promise()

  const result = await doClient.query({
    TableName: todosTable,
    IndexName: indexName,
    KeyConditionExpression: 'userId = :h',
    ExpressionAttributeValues: {
      ':h': userId
    }
  }).promise()

  const items = result.Items

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      items
    })
  }
}
