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
    companyId: String;
    answers: Array<String>;
    testId: String;
    testResult: String;
    averageScore: String;
    testStatus: String;
    expirationDate: String;
  } = JSON.parse(event.body);

  const updateExpression = () => {
    let exp = `Set `;

    if (data.candidateId) {
      exp += `candidateId = :candidateId,`;
    }
    if (data.companyId) {
      exp += `companyId = :companyId,`;
    }
    if (data.answers) {
      exp += `answers = :answers,`;
    }
    if (data.testId) {
      exp += `testId = :testId,`;
    }
    if (data.testResult) {
      exp += `testResult = :testResult,`;
    }
    if (data.averageScore) {
      exp += `averageScore = :averageScore,`;
    }
    if (data.testStatus) {
      exp += `testStatus = :testStatus,`;
    }
    if (data.expirationDate) {
      exp += `expirationDate = :expirationDate,`;
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
      ":companyId": data.companyId,
      ":answers": data.answers,
      ":testId": data.testId,
      ":testResult": data.testResult,
      ":averageScore": data.averageScore,
      ":testStatus": data.testStatus,
      ":expirationDate": data.expirationDate,
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
