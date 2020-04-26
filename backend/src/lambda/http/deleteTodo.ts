import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { deleteTodo, todoExist } from '../../businessLogic/todos'

const logger = createLogger('deleteTodo')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const jwtToken = event.headers.Authorization.split(' ')[1]

    logger.info('Finding todo with the given id')

    const todoCheck = await todoExist(todoId, jwtToken);

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

    if (!todoCheck) {
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

    await deleteTodo(todoId, jwtToken)

    logger.info('Todo deleted')

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