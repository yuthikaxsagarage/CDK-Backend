import { Construct } from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";

type Props = {
  tableName: string;
};

export default class DeleteQuestionType extends Construct {
  public readonly lambda: lambda.IFunction;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    const deleteQuestionType = new lambda.Function(scope, `-deleteQuestionType-`, {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset(
        "./lib/stacks/questionTypeStack/lambdaFns/deleteQuestionType",
        {
          exclude: ["*.ts"],
        }
      ),
      environment: {
        QUESTION_TYPE_TABLE_NAME: props.tableName,
      },
    });

    this.lambda = deleteQuestionType;
  }
}
