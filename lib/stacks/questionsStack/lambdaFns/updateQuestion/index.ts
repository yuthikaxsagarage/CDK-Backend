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
      body: JSON.stringify({ success: false, data: "body required" }),
    });
  }

  if (!event.queryStringParameters?.id) {
    return callback(null, {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({ success: false, data: "Query-param id required" }),
    });
  }

  const dynamoDb = new AWS.DynamoDB.DocumentClient();

  const data = JSON.parse(event.body);

  const date = new Date();

  const isoDateString = date.toISOString();

  const updateExpression = () => {
    let exp = `Set `;

    if (data.typeId) {
      exp += `typeId = :typeId,`;
    }
    if (data.question) {
      exp += `question = :question,`;
    }
    if (data.answerId) {
      exp += `answerId = :answerId,`;
    }
    if (data.answers) {
      exp += `answers = :answers,`;
    }
    if (data.correctAnswers) {
      exp += `correctAnswers = :correctAnswers,`;
    }
    if (data.tags) {
      exp += `tags = :tags,`;
    }
    if (data.categoryId) {
      exp += `categoryId = :categoryId,`;
    }
    if (data.difficultyId) {
      exp += `difficultyId = :difficultyId,`;
    }
    if (data.industryId) {
      exp += `industryId = :industryId,`;
    }

    exp += `updatedAt = :updatedAt`;

    return exp;
  };

  const params = event.queryStringParameters && {
    TableName: env.QUESTION_TABLE_NAME,
    Key: {
      id: event.queryStringParameters.id,
    },
    UpdateExpression: `${updateExpression()}`,
    ExpressionAttributeValues: {
      ":typeId": data.typeId,
      ":question": data.question,
      ":tags": data.tags,
      ":answers": data.answers,
      ":correctAnswers": data.correctAnswers,
      ":categoryId": data.categoryId,
      ":difficultyId": data.difficultyId,
      ":industryId": data.industryId,
      ":updatedAt": isoDateString,
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
