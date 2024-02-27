import * as cdk from "@aws-cdk/core";
import * as dynamo from "@aws-cdk/aws-dynamodb";

interface Props {
  devEnv: string;
}

export default class QuestionTypeTable extends cdk.Construct {
  public readonly table: dynamo.Table;

  constructor(scope: cdk.Construct, id: string, props: Props) {
    super(scope, id);

    this.table = new dynamo.Table(this, `${props.devEnv}-question-type-table-`, {
      billingMode: dynamo.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      partitionKey: {
        name: "id",
        type: dynamo.AttributeType.STRING,
      },
    });
  }
}
