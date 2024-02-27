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
    questionId: String;
    rate: Number;
    questionsCount: Number;
  } = JSON.parse(event.body);

  const queryParams = event.queryStringParameters && {
    TableName: env.CANDIDATE_TEST_TABLE_NAME,
    Key: {
      id: event.queryStringParameters.id,
    },
  };

  try {
    // @ts-expect-error
    const record = await dynamoDb.get(queryParams).promise();

    // save answer rating along with the answer in db

    // Note:- "rating" can be update from frontend (ex: Give rate as 5 for answer and then change it to 2).
    // Because of that first save the "rate" valu in db
    // then fetch all ratings and calculate the average score. (line 91)

    // @ts-expect-error
    const answersWithRate = record.Item.answers.map((obj) => {
      if (obj.questionId === data.questionId) {
        obj["rate"] = data.rate;
        return obj;
      }
      return obj;
    });

    const rateParams = event.queryStringParameters && {
      TableName: env.CANDIDATE_TEST_TABLE_NAME,
      Key: {
        id: event.queryStringParameters.id,
      },
      UpdateExpression: `Set answers = :answers,
      updatedAt = :updatedAt`,
      ExpressionAttributeValues: {
        ":answers": answersWithRate,
        ":updatedAt": new Date().toISOString(),
      },
      ReturnValues: "ALL_NEW",
    };

    // @ts-expect-error
    const result = await dynamoDb.update(rateParams).promise();

    // calculate average score -> addition of rate/(max rate * total-question)
    let averageScore = 0;
    // @ts-expect-error
    result.Attributes.answers.forEach((answerObj) => {
      if ("rate" in answerObj) {
        averageScore =
          averageScore +
          // @ts-expect-error
          answerObj.rate / (5 * result.Attributes.answers.length);
      }
    });

    const averageScoreParams = event.queryStringParameters && {
      TableName: env.CANDIDATE_TEST_TABLE_NAME,
      Key: {
        id: event.queryStringParameters.id,
      },
      UpdateExpression: `Set averageScore = :averageScore,
      updatedAt = :updatedAt`,
      ExpressionAttributeValues: {
        ":averageScore": parseFloat(averageScore.toFixed(2)),
        ":updatedAt": new Date().toISOString(),
      },
      ReturnValues: "ALL_NEW",
    };

    // @ts-expect-error
    const avgResult = await dynamoDb.update(averageScoreParams).promise();

    if (result) {
      return callback(null, {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({ success: true, data: avgResult }),
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
