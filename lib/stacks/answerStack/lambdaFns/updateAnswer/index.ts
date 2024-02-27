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
    answers: Array<String>;
    correctAnswer: Array<String>;
    githubLink: String;
    codeSnippetLink: String;
  } = JSON.parse(event.body);

  const updateExpression = () => {
    let exp = `Set `;
    if (data.answers) {
      exp += `answers = :answers,`;
    }
    if (data.correctAnswer) {
      exp += `correctAnswer = :correctAnswer,`;
    }
    if (data.githubLink) {
      exp += `githubLink = :githubLink,`;
    }
    if (data.codeSnippetLink) {
      exp += `codeSnippetLink = :codeSnippetLink,`;
    }
    exp += `updatedAt = :updatedAt`;
    return exp;
  };

  const params = event.queryStringParameters && {
    TableName: env.ANSWER_TABLE_NAME,
    Key: {
      id: event.queryStringParameters.id,
    },
    UpdateExpression: `${updateExpression()}`,
    ExpressionAttributeValues: {
      ":answers": data.answers,
      ":correctAnswer": data.correctAnswer,
      ":githubLink": data.githubLink,
      ":codeSnippetLink": data.codeSnippetLink,
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
