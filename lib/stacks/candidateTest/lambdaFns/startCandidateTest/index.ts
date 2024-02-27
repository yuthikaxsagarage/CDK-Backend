import * as AWS from "aws-sdk";
import * as moment from "moment";
import { env } from "process";
import {
  APIGatewayProxyEvent,
  Context,
  APIGatewayProxyCallback,
} from "aws-lambda";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export async function handler(
  event: APIGatewayProxyEvent,
  context: Context,
  callback: APIGatewayProxyCallback
) {
  if (!env.CANDIDATE_TEST_TABLE_NAME) {
    return callback(null, {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({ success: false, data: "Server logic error!" }),
    });
  }

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
  const data: {
    testStatus: String;
    id: String;
    expirationDate: moment.MomentInput;
  } = JSON.parse(event.body);

  const getParamas = {
    TableName: env.CANDIDATE_TEST_TABLE_NAME,
    Key: {
      id: data.id,
    },
  };

  if (
    moment() > moment(data.expirationDate).endOf("day") ||
    data.testStatus === "completed"
  ) {
    return callback(null, {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        success: false,
        data:
          moment() > moment(data.expirationDate).endOf("day")
            ? "Test Expired"
            : "Test alread completed",
      }),
    });
  }

  const params = {
    TableName: env.CANDIDATE_TEST_TABLE_NAME,
    Key: {
      id: data.id,
    },
    UpdateExpression: `Set testStatus = :testStatus,
    startTime = :startTime,
    updatedAt = :updatedAt`,
    ExpressionAttributeValues: {
      ":testStatus": "started",
      ":startTime": new Date().toISOString(),
      ":updatedAt": new Date().toISOString(),
    },
    ReturnValues: "ALL_NEW",
  };

  try {
    const existingData = await dynamoDb.get(getParamas).promise();

    if (
      existingData.Item &&
      existingData.Item.startTime &&
      existingData.Item.testStatus === "started"
    ) {
      return callback(null, {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
          success: true,
          data: existingData.Item.startTime,
        }),
      });
    }

    const result = await dynamoDb.update(params).promise();

    if (result && result.Attributes) {
      return callback(null, {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
          success: true,
          data: result.Attributes.startTime,
        }),
      });
    }
    return callback(null, {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        success: false,
        data: "Server logic error: Could not update the test state",
      }),
    });
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
