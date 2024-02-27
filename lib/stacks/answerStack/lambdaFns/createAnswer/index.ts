import * as AWS from "aws-sdk";
import { env } from "process";
import {
  APIGatewayProxyEvent,
  Context,
  APIGatewayProxyCallback,
} from "aws-lambda";
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

  const dynamoDb = new AWS.DynamoDB.DocumentClient();

  const data: {
    answers: Array<String>;
    correctAnswer: Array<String>;
    githubLink: String;
    codeSnippetLink: String;
    createdAt: String;
    updatedAt: String;
    deletedAt: String;
    questionId: String;
  } = JSON.parse(event.body);

  const params = {
    TableName: env.ANSWER_TABLE_NAME,
    Item: {
      id: uuid(),
      answers: data.answers,
      correctAnswer: data.correctAnswer,
      githubLink: data.githubLink,
      codeSnippetLink: data.codeSnippetLink,
      deleted: "false",
      questionId: data.questionId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    },
  };

  try {
    // @ts-expect-error
    const result = await dynamoDb.put(params).promise();
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
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({ success: false, error: error }),
    });
  }
}
