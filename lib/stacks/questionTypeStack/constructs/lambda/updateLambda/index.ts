import { Construct } from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";

type Props = {
  tableName: string;
};

export default class UpdateLambdaType extends Construct {
  public readonly lambda: lambda.IFunction;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    const updateLambdaType = new lambda.Function(scope, `updateQuestionType`, {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset(
        "./lib/stacks/questionTypeStack/lambdaFns/updateQuestionType",
        {
          exclude: ["*.ts"],
        }
      ),
      environment: {
        QUESTION_TYPE_TABLE_NAME: props.tableName,
      },
    });

    this.lambda = updateLambdaType;
  }
}
