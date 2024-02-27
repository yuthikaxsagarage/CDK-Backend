import * as AWS from "aws-sdk";
import { APIGatewayProxyCallback, APIGatewayProxyEvent, Context } from "aws-lambda";
import { env } from "process";
import {v4 as uuid} from "uuid";

export async function handler(event: APIGatewayProxyEvent, context: Context,  callback: APIGatewayProxyCallback){
  
    if (!event.body) {
        return callback(
          null,
          {
            statusCode: 400,
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Credentials": true,
            },
            body: JSON.stringify({ success: false, data: "Invalid Input" }),
          }
        );
      }

      const dynamodb = new AWS.DynamoDB.DocumentClient();

      const data = JSON.parse(event.body);

      const id = uuid(); 

      const date = new Date();

      const isoDateString = date.toISOString();

      const params = {
          TableName: env.DIFFICULTY_TABLE_NAME,
          Item: {
            id: id,
            companyId: data.companyId,
            difficulty: data.difficulty,
            createdAt: isoDateString, 
          }
      }
      
      try {
        //   @ts-expect-error
          const result = await dynamodb.put(params).promise();

          if(result) {
              return callback(null, {
                  statusCode: 200,
                  headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Credentials": true,
                  },
                  body: JSON.stringify({ success: true, data: result})
              })
          } else {
            return callback(null, {
                statusCode: 500,
                headers: {
                  "Access-Control-Allow-Origin": "*",
                  "Access-Control-Allow-Credentials": true,
                },
                body: JSON.stringify({ success: false})
            })
          }
      } catch (error) {
          console.log(error);
          return callback(null, {
              statusCode: 200,
              headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
              },
              body: JSON.stringify({ success: false })
          })
      }
}