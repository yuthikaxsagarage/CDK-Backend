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
    typeId: String;
    question: String;
    answers: [any];
    correctAnswers: [any];
    tags: Array<String>;
    categoryId: String;
    difficultyId: String;
    industryId: String;
    createdBy: Object;
  } = JSON.parse(event.body);

  const params = {
    TableName: env.QUESTION_TABLE_NAME,
    Item: {
      id: uuid(),
      typeId: data.typeId,
      question: data.question,
      answers: data.answers,
      correctAnswers: data.correctAnswers,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: data.createdBy,
      tags: data.tags,
      categoryId: data.categoryId,
      difficultyId: data.difficultyId,
      industryId: data.industryId,
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
        body: JSON.stringify({ success: true, data: params.Item }),
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
