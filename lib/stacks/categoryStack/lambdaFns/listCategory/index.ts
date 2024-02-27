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

  const listCategoriesParams = !event.queryStringParameters && {
    TableName: env.CATEGORY_TABLE_NAME,
  };

  const categoryId = event.queryStringParameters && event.queryStringParameters.id;

  const getCategoryByIdParams = event.queryStringParameters && {
    TableName: env.CATEGORY_TABLE_NAME,
    Key: {
      id: categoryId,
    },
  };
  console.log("categoryId: ", categoryId)

  try {
    let result;

    if (listCategoriesParams) {
      // @ts-expect-error
      result = await dynamoDb.scan(listCategoriesParams).promise();
    }

    if (getCategoryByIdParams) {
      // @ts-expect-error
      result = await dynamoDb.get(getCategoryByIdParams).promise();
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
