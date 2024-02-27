import * as cdk from "@aws-cdk/core";
import * as cognito from "@aws-cdk/aws-cognito";
import * as lambda from "@aws-cdk/aws-lambda";
import { ITable } from "@aws-cdk/aws-dynamodb";

type Props = {
  companyTable: ITable;
};

/**
 * @description This construct defines Cognito user pool and cognito user pool client.
 */
export class UserPool extends cdk.Construct {
  public readonly userPool: cognito.IUserPool;
  public readonly userPoolClient: cognito.IUserPoolClient;

  constructor(scope: cdk.Construct, id: string, props: Props) {
    super(scope, id);

    const postConfirm = new lambda.Function(this, "postConfirmTrigger", {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset("./lib/stacks/userStack/lambda/postConfirm", {
        exclude: ["*.ts"],
      }),
      environment: {
        COMPANY_TABLE_NAME: props.companyTable.tableName,
      },
    });

    this.userPool = new cognito.UserPool(this, `Userpool`, {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      passwordPolicy: {
        minLength: 8,
      },
      selfSignUpEnabled: true,
      signInAliases: {
        username: false,
        email: true,
        preferredUsername: false,
      },
      autoVerify: { email: true, phone: false },
      lambdaTriggers: {
        postConfirmation: postConfirm,
      },
    });

    this.userPoolClient = new cognito.UserPoolClient(this, `UserPoolClient`, {
      userPool: this.userPool,
    });

    props.companyTable.grantWriteData(postConfirm);
  }
}
