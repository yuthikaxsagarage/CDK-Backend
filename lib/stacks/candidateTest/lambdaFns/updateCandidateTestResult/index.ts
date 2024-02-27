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

  const dynamoDb = new AWS.DynamoDB.DocumentClient();

  const data: {
    candidateId: String;
    testId: String;
    testResult: String;
    reviewedManager: String;
  } = JSON.parse(event.body);

  const updateExpression = () => {
    let exp = `Set `;

    if (data.candidateId) {
      exp += `candidateId = :candidateId,`;
    }
    if (data.testResult) {
      exp += `testResult = :testResult,`;
    }
    if (data.reviewedManager) {
      exp += `reviewedManager = :reviewedManager,`;
    }

    exp += `updatedAt = :updatedAt`;

    return exp;
  };

  const params = event.queryStringParameters && {
    TableName: env.CANDIDATE_TEST_TABLE_NAME,
    Key: {
      id: event.queryStringParameters.id,
    },
    UpdateExpression: `${updateExpression()}`,
    ExpressionAttributeValues: {
      ":candidateId": data.candidateId,
      ":testResult": data.testResult,
      ":reviewedManager": data.reviewedManager,
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
