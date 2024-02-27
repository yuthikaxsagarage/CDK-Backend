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

  if (!event.queryStringParameters || !env.QUESTION_TABLE_NAME) {
    return callback(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: "query params required",
      }),
    });
  }

  const dataArray = JSON.parse(event.queryStringParameters.data!);

  if (!Array.isArray(dataArray)) {
    return callback(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: "query params 'data' needs to be Array of String",
      }),
    });
  }
  const data: Array<string> = dataArray;

  let params = {
    RequestItems: {
      [env.QUESTION_TABLE_NAME]: {
        Keys: data.map((id: string) => ({ id })),
        ProjectionExpression:
          "question, typeId, difficultyId, createdAt, answers, correctAnswers, createdBy, industryId, categoryId, updatedAt, id, tags",
      },
    },
  };

  //get batch-question without "correctAnswer", when request with query param "isCandidate=true"
  if (
    event.queryStringParameters.isCandidate !== undefined &&
    JSON.parse(event.queryStringParameters.isCandidate) === true
  ) {
    params.RequestItems[env.QUESTION_TABLE_NAME].ProjectionExpression =
      "question, typeId, difficultyId, createdAt, answers, createdBy, industryId, categoryId, updatedAt, id, tags";
  }

  try {
    const result = await dynamodb.batchGet(params).promise();
    return callback(null, {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({ success: true, result }),
    });
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
