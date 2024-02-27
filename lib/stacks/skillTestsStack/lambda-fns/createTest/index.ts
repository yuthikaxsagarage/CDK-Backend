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
    questionIds: Array<String>;
    industryId: String;
    designationId: Array<String>;
    customDesignation: Array<Object>;
    companyId: String;
    subscriptionId: String;
    createdBy: Object;
    durationTime: String;
    template: String;
    title: String;
    description: String;
    difficultyId: String;
    tags: Array<String>;
  } = JSON.parse(event.body);

  if (!(typeof data.template === "string")) {
    return callback(null, {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({ success: false, data: "template should be a string" }),
    });
  }

  const params = {
    TableName: env.TEST_TABLE_NAME,
    Item: {
      id: uuid(),
      questionIds: data.questionIds,
      industryId: data.industryId,
      designationId: data.designationId,
      customDesignation: data.customDesignation,
      companyId: data.companyId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      softDeletedAt: null,
      subscriptionId: data.subscriptionId,
      createdBy: data.createdBy,
      durationTime: data.durationTime,
      template: data.template,
      title: data.title,
      description: data.description,
      difficultyId: data.difficultyId,
      tags: data.tags
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
      body: JSON.stringify({ success: false, error: error }),
    });
  }
}
