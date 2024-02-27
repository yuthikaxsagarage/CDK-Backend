import * as cdk from "@aws-cdk/core";
import * as dynamo from "@aws-cdk/aws-dynamodb";
import { AttributeType } from "@aws-cdk/aws-dynamodb";

interface Props {
  isProd: boolean;
  devEnv: string;
}

export default class Table extends cdk.Construct {
  public readonly table: dynamo.Table;

  constructor(scope: cdk.Construct, id: string, props: Props) {
    super(scope, id);

    this.table = new dynamo.Table(this, `${props.devEnv}-skills-table-`, {
      billingMode: dynamo.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      partitionKey: {
        name: "id",
        type: dynamo.AttributeType.STRING,
      },
    });

    this.table.addGlobalSecondaryIndex({
      partitionKey: {
        name: "companyId",
        type: AttributeType.STRING,
      },
      indexName: "ListQuestionByCompanyId",
    });

    this.table.addGlobalSecondaryIndex({
      partitionKey: {
        name: "template",
        type: AttributeType.STRING,
      },
      indexName: "ListTestTemplates",
    });

  }
}
