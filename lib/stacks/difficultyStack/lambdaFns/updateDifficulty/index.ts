import * as AWS from "aws-sdk";
import { env } from "process";
import {
  APIGatewayProxyEvent,
  Context,
  APIGatewayProxyCallback,
} from "aws-lambda";

export async function handler(
  event: APIGatewayProxyEvent,
  context: Context,
  callback: APIGatewayProxyCallback
) {
  if (!event.body) {
    return callback(null, {
      statusCode: 400,
      body: "Invalid input",
    });
  }

  const dynamoDb = new AWS.DynamoDB.DocumentClient();

  const data = JSON.parse(event.body);

  const date = new Date();

  const isoDateString = date.toISOString();

  const params = event.queryStringParameters && {
    TableName: env.DIFFICULTY_TABLE_NAME,
    Key: {
      id: event.queryStringParameters.id,
    },
    UpdateExpression: `Set difficulty = :difficulty,
    updatedAt = :updatedAt`,
    ExpressionAttributeValues: {
      ":updatedAt": isoDateString,
      ":difficulty": data.difficulty,
    },
    ReturnValues: "ALL_NEW",
  };

  try {
    // @ts-expect-error
    const result = await dynamoDb.update(params).promise();
    if (result) {
      return callback(null, {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({ success: true, data: result }),
      });
    } else {
      return callback(null, {
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
      }),
    });
  }
}
