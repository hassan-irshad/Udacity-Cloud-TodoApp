import 'source-map-support/register'
import * as AWS from 'aws-sdk'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createLogger } from '../../utils/logger'

const doClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

const logger = createLogger('deleteTodo')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId

    logger.info('Finding todo with the given id')

    const todoExist = todoExists(todoId);

    if (!todoId) {
        logger.info('Provide todo id')
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
        logger.info('Todo not exist')
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

    logger.info('Todo deleted')

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
