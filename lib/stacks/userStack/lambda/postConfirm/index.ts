import * as AWS from "aws-sdk";
import { env } from "process";
import { v4 as uuid } from "uuid";

export async function handler(event: any, context: any, callback: any) {
  // const userId = uuid(); //Currently using event.request.userAttributes.sub as ID

  const dynamoDb = new AWS.DynamoDB.DocumentClient();

  if (event.triggerSource === "PostConfirmation_ConfirmForgotPassword") {
    return callback(null, event);
  }

  const attributes = event.request.userAttributes;

  const date = new Date();

  const isoDateString = date.toISOString();

  const companyId = uuid();

  // const userParams = {
  //   TableName: env.USER_TABLE_NAME,
  //   Item: {
  //     id: attributes.sub,
  //     email: attributes.email,
  //     companyId: companyId,
  //     createdAt: isoDateString
  //   }
  // }

  const companyParams = {
    TableName: env.COMPANY_TABLE_NAME,
    Item: {
      id: companyId,
      ownerId: attributes.sub,
      createdAt: isoDateString,
    },
  };

  // async function createUserRecordPromise(userParams: any) {
  //   return dynamoDb.put(userParams).promise();
  // }

  async function createCompanyRecordPromise(companyParams: any) {
    return dynamoDb.put(companyParams).promise();
  }

  try {
    await Promise.all([
      // createUserRecordPromise(userParams),
      createCompanyRecordPromise(companyParams),
    ]);
  } catch (error) {
    console.log({ error });
    return callback("Error occured: ", error);
  }
}
