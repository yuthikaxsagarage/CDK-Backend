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
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({ success: false, data: "Invalid Input" }),
    });
  }

  if (!event.queryStringParameters?.id) {
    return callback(null, {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({ success: false, data: "Query param id required" }),
    });
  }

  const dynamoDb = new AWS.DynamoDB.DocumentClient();

  const data: {
    designation: String;
    createdBy: Object;
    companyId: String;
    userId: String;
    industry: Array<String>;
  } = JSON.parse(event.body);

  const updateExpression = () => {
    let exp = `Set `;
    if (data.designation) {
      exp += `designation = :designation,`;
    }
    if (data.createdBy) {
      exp += `createdBy = :createdBy,`;
    }
    if (data.companyId) {
      exp += `companyId = :companyId,`;
    }
    if (data.userId) {
      exp += `userId = :userId,`;
    }
    if (data.industry) {
      exp += `industry = :industry`;
    }
    exp += `updatedAt = :updatedAt`;
    return exp;
  };

  const params = event.queryStringParameters && {
    TableName: env.DESIGNATION_TABLE_NAME,
    Key: {
      id: event.queryStringParameters.id,
    },
    UpdateExpression: `${updateExpression()}`,
    ExpressionAttributeValues: {
      ":designation": data.designation,
      ":createdBy": data.createdBy,
      ":companyId": data.companyId,
      ":userId": data.userId,
      ":industry": data.industry,
      ":updatedAt": new Date().toISOString(),
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
      body: JSON.stringify({ success: true, error: error }),
    });
  }
}
