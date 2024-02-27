import * as AWS from "aws-sdk";
import {
  APIGatewayProxyCallback,
  APIGatewayProxyEvent,
  Context,
} from "aws-lambda";
import { env } from "process";
import { v4 as uuid } from "uuid";

export async function handler(
  event: APIGatewayProxyEvent,
  context: Context,
  callback: APIGatewayProxyCallback
) {
  if (!event.body) {
    return callback(null, {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({ success: false, data: "Invalid Input" }),
    });
  }

  const dynamodb = new AWS.DynamoDB.DocumentClient();

  const data: {
    designation: String;
    createdBy: Object;
    companyId: String;
    userId: String;
    industry: Array<String>;
  } = JSON.parse(event.body);

  const params = {
    TableName: env.DESIGNATION_TABLE_NAME,
    Item: {
      id: uuid(),
      designation: data.designation,
      createdBy: data.createdBy,
      companyId: data.companyId,
      userId: data.userId,
      industry: data.industry,
      deleted: "false",
      createdAt: new Date().toISOString(),
    },
  };

  try {
    //   @ts-expect-error
    const result = await dynamodb.put(params).promise();

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
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({ success: false }),
    });
  }
}
