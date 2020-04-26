import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS)

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'


export class TodoAccess {

    constructor(
        private readonly doClient: DocumentClient = createDynamoDBClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly indexName = process.env.INDEX_NAME) {
    }

    async getAllTodos(userId: string): Promise<TodoItem[]> {
        const result = await this.doClient.query({
            TableName: this.todosTable,
            IndexName: this.indexName,
            KeyConditionExpression: 'userId = :h',
            ExpressionAttributeValues: {
                ':h': userId
            }
        }).promise()

        const items = result.Items
        return items as TodoItem[]
    }

    async createTodo(todo: TodoItem): Promise<TodoItem> {
        await this.doClient.put({
            TableName: this.todosTable,
            Item: todo
        }).promise()

        return todo;
    }

    async updateTodo(todo: TodoUpdate, todoId: string, userId) {
        await this.doClient.update({
            TableName: this.todosTable,
            Key: {
                userId,
                todoId
            },
            UpdateExpression: "set #name = :n, #dueDate = :d, #done = :s",
            ExpressionAttributeNames: {
                "#name": "name",
                "#dueDate": "dueDate",
                "#done": "done"
            },
            ExpressionAttributeValues: {
                ":n": todo.name,
                ":d": todo.dueDate,
                ":s": todo.done
            },
            ReturnValues: "UPDATED_NEW"
        }).promise()
    }

    async deleteTodo(todoId: string, userId: string) {
        await this.doClient.delete({
            TableName: this.todosTable,
            Key: {
                userId,
                todoId
            },
        }).promise()
    }

    async todoExists(todoId: string, userId: string) {
        const result = await this.doClient
            .get({
                TableName: this.todosTable,
                Key: {
                    userId,
                    todoId
                }
            })
            .promise()

        console.log('Get todo: ', result)
        return !!result.Item
    }

    async saveImageUrl(userId: string, todoId: string, imageUrl: string) {

        await this.doClient.update({
            TableName: this.todosTable,
            Key: {
                userId,
                todoId
            },
            UpdateExpression: "set attachmentUrl = :a",
            ExpressionAttributeValues: {
                ":a": imageUrl
            },
            ReturnValues: "UPDATED_NEW"
        }).promise()
    }
}

function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
        console.log('Creating a local DynamoDB instance')
        return new XAWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000'
        })
    }

    return new XAWS.DynamoDB.DocumentClient()
}