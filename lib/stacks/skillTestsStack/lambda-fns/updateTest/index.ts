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
    questionIds: Array<String>;
    industryId: String;
    designationId: Array<String>;
    customDesignation: Array<Object>;
    companyId: String;
    subscriptionId: String;
    createdBy: Object;
    durationTime: String;
    template: Boolean;
    title: String;
    description: String;
    difficultyId: String;
    tags: Array<String>;
  } = JSON.parse(event.body);

  const updateExpression = () => {
    let exp = `Set `;

    if (data.questionIds) {
      exp += `questionIds = :questionIds,`;
    }
    if (data.industryId) {
      exp += `industryId = :industryId,`;
    }
    if (data.designationId) {
      exp += `designationId = :designationId,`;
    }
    if (data.customDesignation) {
      exp += `customDesignation = :customDesignation,`;
    }
    if (data.companyId) {
      exp += `companyId = :companyId,`;
    }
    if (data.subscriptionId) {
      exp += `subscriptionId = :subscriptionId,`;
    }
    if (data.createdBy) {
      exp += `createdBy = :createdBy,`;
    }
    if (data.durationTime) {
      exp += `durationTime = :durationTime,`;
    }
    if ("template" in data) {
      exp += `template = :template,`;
    }
    if (data.title) {
      exp += `title = :title,`;
    }
    if (data.description) {
      exp += `description = :description,`;
    }
    if (data.difficultyId) {
      exp += `difficultyId = :difficultyId,`;
    }
    if (data.tags) {
      exp += `tags = :tags,`;
    }

    exp += `updatedAt = :updatedAt`;

    return exp;
  };

  const params = event.queryStringParameters && {
    TableName: env.TEST_TABLE_NAME,
    Key: {
      id: event.queryStringParameters.id,
    },
    UpdateExpression: updateExpression(),
    ExpressionAttributeValues: {
      ":questionIds": data.questionIds,
      ":industryId": data.industryId,
      ":designationId": data.designationId,
      ":customDesignation": data.customDesignation,
      ":companyId": data.companyId,
      ":updatedAt": new Date().toISOString(),
      ":subscriptionId": data.subscriptionId,
      ":createdBy": data.createdBy,
      ":durationTime": data.durationTime,
      ":template": data.template,
      ":title": data.title,
      ":description": data.description,
      ":difficultyId": data.difficultyId,
      ":tags": data.tags,
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
      body: JSON.stringify({ success: false, error: error }),
    });
  }
}
