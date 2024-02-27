import { Construct } from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";

type Props = {
  tableName: string;
};

export default class CreateTest extends Construct {
  public readonly lambda: lambda.IFunction;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    const createTest = new lambda.Function(scope, `createTest`, {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset(
        "./lib/stacks/skillTestsStack/lambda-fns/createTest",
        {
          exclude: ["*.ts"],
        }
      ),
      environment: {
        TEST_TABLE_NAME: props.tableName,
      },
    });

    this.lambda = createTest;
  }
}
