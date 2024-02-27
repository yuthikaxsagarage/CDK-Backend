import * as dynamo from "@aws-cdk/aws-dynamodb";
import { Construct, RemovalPolicy } from "@aws-cdk/core";

import * as lambda from "@aws-cdk/aws-lambda";

export class Table extends Construct {
  public readonly table: dynamo.Table;
  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.table = new dynamo.Table(this, "companyTable", {
      billingMode: dynamo.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
      partitionKey: {
        name: "id",
        type: dynamo.AttributeType.STRING,
      },
    });

    const postConfirm = new lambda.Function(this, "testPolicy", {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset("./lib/stacks/userStack/lambda/postConfirm", {
        exclude: ["*.ts"],
      }),
      environment: {
        COMPANY_TABLE_NAME: this.table.tableName,
      },
    });

    this.table.grantReadData(postConfirm);
  }
}
