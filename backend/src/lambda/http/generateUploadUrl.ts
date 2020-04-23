import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import * as uuid from 'uuid'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

const doClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE
const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

const s3 = new AWS.S3({
    signatureVersion: 'v4'
})

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId

    const validTodoId = await todoExists(todoId)

    if (!validTodoId) {
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

    const imageId = uuid.v4()
    const imageUrl = `https://${bucketName}.s3.amazonaws.com/${imageId}`
    const url = getUploadUrl(imageId)

    await doClient.update({
        TableName: todosTable,
        Key: { "todoId": todoId },
        UpdateExpression: "set attachmentUrl = :a",
        ExpressionAttributeValues: {
            ":a": imageUrl
        },
        ReturnValues: "UPDATED_NEW"
    }).promise()

    return {
        statusCode: 201,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            uploadUrl: url
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

function getUploadUrl(imageId: string) {
    return s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: imageId,
        Expires: urlExpiration
    })
}
