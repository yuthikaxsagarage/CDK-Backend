import { Construct } from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";

type Props = {
  tableName: string;
};

export default class UpdateAnswer extends Construct {
  public readonly lambda: lambda.IFunction;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    this.lambda = new lambda.Function(scope, `updateAnswer`, {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset(
        "./lib/stacks/answerStack/lambdaFns/updateAnswer",
        {
          exclude: ["*.ts"],
        }
      ),
      environment: {
        ANSWER_TABLE_NAME: props.tableName,
      },
    });
  }
}
