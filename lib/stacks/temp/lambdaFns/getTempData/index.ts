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
  if (
    event.queryStringParameters === null ||
    event.queryStringParameters.companyId === null ||
    event.queryStringParameters.jobId === null ||
    event.queryStringParameters.candidateId === undefined
  ) {
    return callback(null, {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        success: false,
        error: `Missing params`,
      }),
    });
  }
  const dynamoDb = new AWS.DynamoDB.DocumentClient();

  const paramsCandidate = {
    TableName: env.CANDIDATE_TABLE_NAME,
    Key: {
      id: event.queryStringParameters.candidateId,
    },
  };

  const paramsJob = {
    TableName: env.JOB_TABLE_NAME,
    Key: {
      id: event.queryStringParameters.jobId,
    },
  };

  const paramsCompany = {
    TableName: env.COMPANY_TABLE_NAME,
    Key: {
      id: event.queryStringParameters.companyId,
    },
  };

  try {
    // @ts-expect-error
    const resultCandidate = await dynamoDb.get(paramsCandidate).promise();
    // @ts-expect-error
    const resultJob = await dynamoDb.get(paramsJob).promise();
    // @ts-expect-error
    const resultCompany = await dynamoDb.get(paramsCompany).promise();

    if (resultCandidate.Item && resultJob.Item && resultCompany.Item) {
      const { logo, companyName } = resultCompany.Item;
      const { title, isRemoteJob, jobRegion, jobType } = resultJob.Item;

      const { firstName, lastName, managerInCharge } = resultCandidate.Item;

      const paramsUser = {
        TableName: env.USER_TABLE_NAME,
        Key: {
          id: managerInCharge,
        },
      };  

      // @ts-expect-error
      const resultUser = await dynamoDb.get(paramsUser).promise();

      const company = {
        logo,
        companyName,
      };

      const job = {
        title,
        isRemoteJob,
        jobRegion,
        jobType,
      };

      const candidate = {
        firstName,
        lastName,
        managerInCharge,
      };

      const user = resultUser.Item && {
        firstName : resultUser.Item.firstName,
        email : resultUser.Item.email,
      }

      return callback(null, {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
          success: true,
          data: {
            job,
            company,
            candidate,
            user
          },
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
