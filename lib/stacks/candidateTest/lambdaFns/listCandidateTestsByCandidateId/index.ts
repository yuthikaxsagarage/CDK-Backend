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
  const dynamodb = new AWS.DynamoDB.DocumentClient();

  const listCandidateTestsByCandidateIdParams = event.queryStringParameters &&
    event.queryStringParameters?.id && {
      TableName: env.CANDIDATE_TEST_TABLE_NAME,
      IndexName: "ListCandidateTestsByCandidateId",
      KeyConditionExpression: "candidateId = :candidateId",
      ExpressionAttributeValues: {
        ":candidateId": event.queryStringParameters.id,
      },
    };

  try {
    var result;
    if (listCandidateTestsByCandidateIdParams) {
      //@ts-expect-error
      result = await dynamodb.query(listCandidateTestsByCandidateIdParams).promise();
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
