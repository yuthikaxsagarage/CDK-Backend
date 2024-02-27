import * as dynamo from "@aws-cdk/aws-dynamodb";
import { AttributeType } from "@aws-cdk/aws-dynamodb";
import { Construct, RemovalPolicy } from "@aws-cdk/core";

interface Props {
  devEnv: string;
}

export default class Table extends Construct {
  public readonly table: dynamo.Table;
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    this.table = new dynamo.Table(this, `${props.devEnv}-candidateTest`, {
      billingMode: dynamo.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
      partitionKey: {
        name: "id",
        type: dynamo.AttributeType.STRING,
      },
    });

    this.table.addGlobalSecondaryIndex({
      partitionKey: {
        name: "candidateId",
        type: AttributeType.STRING,
      },
      indexName: "ListCandidateTestsByCandidateId",
    });
  }
}
