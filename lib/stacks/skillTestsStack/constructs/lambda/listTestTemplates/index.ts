import { Construct } from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";

type Props = {
  tableName: string;
};

export default class ListTestTemplates extends Construct {
  public readonly lambda: lambda.IFunction;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    const listTestTemplates = new lambda.Function(scope, `listTestTemplates`, {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset(
        "./lib/stacks/skillTestsStack/lambda-fns/listTestTemplates",
        {
          exclude: ["*.ts"],
        }
      ),
      environment: {
        TEST_TABLE_NAME: props.tableName,
      },
    });
    this.lambda = listTestTemplates;
  }
}
