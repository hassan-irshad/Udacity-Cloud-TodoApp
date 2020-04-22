import 'source-map-support/register'
import * as AWS from 'aws-sdk'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

const doClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId

    const todoExist = todoExists(todoId);

    if (!todoId) {
        return {
            statusCode: 400,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                error: 'Provide todoId.'
            })
        }
    }

    if (!todoExist) {
        return {
            statusCode: 404,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                error: 'Todo of the provided Id not found.'
            })
        }
    }

    await doClient.delete({
        TableName: todosTable,
        Key: {
            todoId
        },
    }).promise()


    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            message: 'Todo deleted'
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
