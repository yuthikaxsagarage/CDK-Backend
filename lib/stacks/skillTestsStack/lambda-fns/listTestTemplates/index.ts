import * as AWS from "aws-sdk";
import {
  APIGatewayProxyCallback,
  APIGatewayProxyEvent,
  Context,
} from "aws-lambda";
import { env } from "process";

export async function handler(
  event: APIGatewayProxyEvent,
  context: Context,
  callback: APIGatewayProxyCallback
) {
  if (!event.queryStringParameters) {
    return callback(null, {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        success: false,
        data: "Invalid input",
      }),
    });
  }

  if (
    event.queryStringParameters &&
    event.queryStringParameters.template === "false"
  ) {
    return callback(null, {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        success: false,
        data: "Custom templates are not available for public",
      }),
    });
  }

  const dynamodb = new AWS.DynamoDB.DocumentClient();

  const listTestTemplates = event.queryStringParameters &&
    event.queryStringParameters.template === "true" && {
      TableName: env.TEST_TABLE_NAME,
      IndexName: "ListTestTemplates",
      KeyConditionExpression: "template = :template",
      ExpressionAttributeValues: {
        ":template": event.queryStringParameters.template,
      },
    };

  console.log("params: ", event.queryStringParameters);

  try {
    //@ts-expect-error
    const result = await dynamodb.query(listTestTemplates).promise();
    console.log("result: ", result);

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
