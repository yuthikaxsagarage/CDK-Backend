import { APIGatewayProxyCallback, APIGatewayProxyEvent, Context } from "aws-lambda";
import * as AWS from "aws-sdk";
import { env } from "process";

export async function handler(
    event: APIGatewayProxyEvent,
    context: Context,
    callback: APIGatewayProxyCallback
) {
    const dynamodb = new AWS.DynamoDB.DocumentClient();

    const params = event.queryStringParameters && {
        TableName: env.DIFFICULTY_TABLE_NAME,
        Key: {
            id: event.queryStringParameters.id
        },
    };
    try {
        // @ts-expect-error
        const result = await dynamodb.delete(params).promise();
        if (result) {
          return callback(null, {
            statusCode: 200,
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Credentials": true,
            },
            body: JSON.stringify({ success: true }),
          });
        } else {
          return callback(null,{
            statusCode: 500,
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Credentials": true,
            },
            body: JSON.stringify({
              success: false,
            }),
          });
        }
      } catch (error) {
        console.log(error);
        return callback(null, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
          },
          statusCode: 500,
          body: JSON.stringify({
            success: false,
          })
        });
      }
    
    
}