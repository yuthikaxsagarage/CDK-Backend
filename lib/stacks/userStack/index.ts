import * as cdk from "@aws-cdk/core";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import { UserPool } from "./constructs/UserPool";

type Props = {
  companyTable: dynamodb.ITable;
};

export default class UserStack extends cdk.NestedStack {
  public readonly userPoolArn: string;
  constructor(
    scope: cdk.Construct,
    id: string,
    props: cdk.NestedStackProps & Props
  ) {
    super(scope, id, props);

    const userpool = new UserPool(this, "skills-userpool", {
      companyTable: props.companyTable,
    });

    this.userPoolArn = userpool.userPool.userPoolArn;
  }
}
