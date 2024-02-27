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
  const dynamoDb = new AWS.DynamoDB.DocumentClient();

  const params = event.queryStringParameters && {
    TableName: env.INDUSTRY_TABLE_NAME,
    Key: {
      id: event.queryStringParameters.id,
    },
  };

  const paramsAll = !event.queryStringParameters && {
    TableName: env.INDUSTRY_TABLE_NAME,
    ProjectionExpression: "id, title",
  };

  try {
    let result;
    if (!event.queryStringParameters) {
      // @ts-expect-error
      result = await dynamoDb.scan(paramsAll).promise();
    } else {
      // @ts-expect-error
      result = await dynamoDb.query(params).promise();
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
        body: JSON.stringify({ success: false }),
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
      body: JSON.stringify({ success: false, error: error }),
    });
  }
}
