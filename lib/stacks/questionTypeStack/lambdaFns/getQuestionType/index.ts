import {
  APIGatewayProxyCallback,
  APIGatewayProxyEvent,
  Context,
} from "aws-lambda";
import { DynamoDB } from "aws-sdk";
import { env } from "process";
// import * as AWS from "aws-sdk";

export async function handler(
  event: APIGatewayProxyEvent,
  context: Context,
  callback: APIGatewayProxyCallback
) {
  const dynamoDb = new DynamoDB.DocumentClient();
  const params = event.queryStringParameters && {
    TableName: env.QUESTION_TYPE_TABLE_NAME,
    Key: {
      id: event.queryStringParameters.id,
    },
  };

  const listAllParams = {
    TableName: env.QUESTION_TYPE_TABLE_NAME,
    ProjectionExpression: "id, questionText",
  };

  try {
    var result;
    if (event.queryStringParameters) {
      //@ts-expect-error
      result = await dynamoDb.query(params).promise();
    } else {
      //@ts-expect-error
      result = await dynamoDb.scan(listAllParams).promise();
    }

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
}
