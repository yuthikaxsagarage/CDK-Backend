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

  const listByCategoryParams = event.queryStringParameters &&
    event.queryStringParameters?.categoryId && {
      TableName: env.QUESTION_TABLE_NAME,
      IndexName: "ListQuestionByCategoryId",
      KeyConditionExpression: "categoryId = :categoryId",
      ExpressionAttributeValues: {
        ":categoryId": event.queryStringParameters.categoryId,
      },
    };

  const listByDifficultyIdParams = event.queryStringParameters &&
    event.queryStringParameters?.difficultyId && {
      TableName: env.QUESTION_TABLE_NAME,
      IndexName: "ListQuestionByDifficultyId",
      KeyConditionExpression: "difficultyId = :difficultyId",
      ExpressionAttributeValues: {
        ":difficultyId": event.queryStringParameters.difficultyId,
      },
    };

  const listByIndustryIdParams = event.queryStringParameters &&
    event.queryStringParameters?.industryId && {
      TableName: env.QUESTION_TABLE_NAME,
      IndexName: "ListQuestionByIndustryId",
      KeyConditionExpression: "industryId = :industryId",
      ExpressionAttributeValues: {
        ":industryId": event.queryStringParameters.industryId,
      },
    };

  const listAllParams = !event.queryStringParameters && {
    TableName: env.QUESTION_TABLE_NAME,
    ProjectionExpression: "id, question",
  };

  try {
    var result;
    if (listByCategoryParams) {
      //@ts-expect-error
      result = await dynamodb.query(listByCategoryParams).promise();
    }
    if (listByDifficultyIdParams) {
      //@ts-expect-error
      result = await dynamodb.query(listByDifficultyIdParams).promise();
    }
    if (listByIndustryIdParams) {
      //@ts-expect-error
      result = await dynamodb.query(listByIndustryIdParams).promise();
    }
    if (!event.queryStringParameters) {
      //@ts-expect-error
      result = await dynamodb.scan(listAllParams).promise();
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
