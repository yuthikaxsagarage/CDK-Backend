import * as AWS from "aws-sdk";
import { env } from "process";
import {
  APIGatewayProxyEvent,
  Context,
  APIGatewayProxyCallback,
} from "aws-lambda";
import * as moment from "moment";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true,
};

export async function handler(
  event: APIGatewayProxyEvent,
  context: Context,
  callback: APIGatewayProxyCallback
) {
  if (
    event.queryStringParameters === null ||
    event.queryStringParameters.id === undefined
  ) {
    return callback(null, {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        success: false,
        error: "Query param id required",
      }),
    });
  }
  if (!event.body) {
    return callback(null, {
      statusCode: 400,
      headers,
      body: JSON.stringify({ success: false, data: "Invalid Input" }),
    });
  }

  const data: {
    answers: Array<Object>;
    expirationDate: moment.MomentInput;
  } = JSON.parse(event.body);

  const params = event.queryStringParameters && {
    TableName: env.CANDIDATE_TEST_TABLE_NAME,
    Key: {
      id: event.queryStringParameters.id,
    },
    UpdateExpression: `Set averageScore = :averageScore,
    answers = :answers,
    endTime = :endTime,
    updatedAt = :updatedAt,
    testStatus= :testStatus`,

    ExpressionAttributeValues: {
      ":averageScore": "unrated",
      ":answers": data.answers,
      ":updatedAt": new Date().toISOString(),
      ":endTime": new Date().toISOString(),
      ":testStatus": "completed",
    },
    ReturnValues: "ALL_NEW",
  };

  try {
    if (moment() > moment(data.expirationDate).endOf("day")) {
      return callback(null, {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          data: "Cannot submit. Test has expired",
        }),
      });
    }
    //FIX: TS Error
    // @ts-expect-error
    const result = await dynamoDb.update(params).promise();
    if (result) {
      return callback(null, {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data: result }),
      });
    } else {
      return callback(null, {
        statusCode: 500,
        headers,
        body: JSON.stringify({ success: false }),
      });
    }
  } catch (error) {
    console.log(error);
    return callback(null, {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: true, error: error }),
    });
  }
}
