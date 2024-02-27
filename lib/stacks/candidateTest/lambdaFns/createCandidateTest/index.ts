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
    candidateId: String;
    testId: String;
    createdBy: Object;
    expirationDate: String;
    testDuration: Number;
    captureWebcamMic: Boolean;
    captureScreen: Boolean;
    scheduledDate: String;
    liveTest: Boolean;
    supervisorId: String;
    supervisorName: String;
  } = JSON.parse(event.body);

  const params = {
    TableName: env.CANDIDATE_TEST_TABLE_NAME,
    Item: {
      id: uuid(),
      candidateId: data.candidateId,
      answers: [], // default value
      testId: data.testId,
      testResult: "pending", // default value
      averageScore: "unrated", // default value
      testStatus: "pending", // default value
      createdBy: data.createdBy,
      testDuration: data.testDuration,
      startTime: null,
      endTime: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      softDeletedAt: null,
      expirationDate: data.expirationDate,
      captureWebcamMic: data.captureWebcamMic,
      captureScreen: data.captureScreen,
      scheduledDate: data.scheduledDate,
      liveTest: data.liveTest,
      supervisorId: data.supervisorId,
      supervisorName: data.supervisorName,
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
        body: JSON.stringify({
          id: params.Item.id,
          candidateId: data.candidateId,
          testId: data.testId,
          createdBy: data.createdBy,
        }),
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
