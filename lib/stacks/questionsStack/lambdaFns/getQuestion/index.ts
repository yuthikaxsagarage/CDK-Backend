import {
  APIGatewayProxyCallback,
  APIGatewayProxyEvent,
  Context,
} from "aws-lambda";
import { DynamoDB } from "aws-sdk";
import { env } from "process";
// import * as AWS from "aws-sdk";

export async function handler(
  event: APIGatewayProxyEvent,
  context: Context,
  callback: APIGatewayProxyCallback
) {
  const dynamoDb = new DynamoDB.DocumentClient();

  type listParam = {
    TableName: String;
    ProjectionExpression: Object;
  };

  type listParamPagination = {
    TableName: String;
    ProjectionExpression: String;
    ExclusiveStartKey: Object;
  };

  const getByIdParams = event.queryStringParameters &&
    event.queryStringParameters.id && {
      TableName: env.QUESTION_TABLE_NAME,
      Key: {
        id: event.queryStringParameters.id,
      },
    };

  let listAllParams: listParam | listParamPagination = {
    TableName: env.QUESTION_TABLE_NAME!,
    ProjectionExpression:
      "id, question, answers, correctAnswers, createdAt, updatedAt, typeId, industryId, categoryId, createdBy, difficultyId, tags",
  };

  if (
    event.queryStringParameters &&
    event.queryStringParameters.LastEvaluatedKey
  ) {
    listAllParams = {
      TableName: env.QUESTION_TABLE_NAME!,
      ProjectionExpression:
        "id, question, answers, correctAnswers, createdAt, updatedAt, typeId, industryId, categoryId, createdBy, difficultyId, tags",
      ExclusiveStartKey: { id: event.queryStringParameters.LastEvaluatedKey },
    };
  }

  //@ts-expect-error
  function filterQuestions(result) {
    //@ts-expect-error
    let filteredItems = result.Items.filter(function (entry) {
      //@ts-expect-error
      return Object.keys(event.queryStringParameters).every(function (key) {
        if (key === "LastEvaluatedKey") {
          return true;
        }
        if (key === "companyId" || key === "userId") {
          //@ts-expect-error
          return entry.createdBy[key] === event.queryStringParameters[key];
        }
        if (key === "tags") {
          let obj = {
            question: entry.question,
            answers: entry.answers,
            correctAnswers: entry.correctAnswers,
            tags: entry.tags,
          }
          //@ts-expect-error
          return Object.values(obj).toString().toLowerCase().includes(event.queryStringParameters[key].toLowerCase());
        }
        //@ts-expect-error
        return entry[key] === event.queryStringParameters[key];
      });
    });
    return { ...result, Items: [...filteredItems] };
  }

  try {
    let result;
    if (!event.queryStringParameters) {
      //@ts-expect-error
      result = await dynamoDb.scan(listAllParams).promise();
    }
    if (event.queryStringParameters && event.queryStringParameters.id) {
      //@ts-expect-error
      result = await dynamoDb.get(getByIdParams).promise();
    }
    if (event.queryStringParameters && !event.queryStringParameters.id) {
      //@ts-expect-error
      result = await dynamoDb.scan(listAllParams).promise();
      result = result && filterQuestions(result);
    }

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
        body: JSON.stringify({
          success: false,
        }),
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
      body: JSON.stringify({
        success: false,
      }),
    });
  }
}
