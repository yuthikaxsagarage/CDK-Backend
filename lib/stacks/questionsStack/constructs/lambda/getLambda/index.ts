import { Construct } from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";

type Props = {
  tableName: string;
};

export default class GetQuestion extends Construct {
  public readonly lambda: lambda.IFunction;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    const getQuestion = new lambda.Function(scope, `-getQuestion-`, {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset(
        "./lib/stacks/questionsStack/lambdaFns/getQuestion",
        {
          exclude: ["*.ts"],
        }
      ),
      environment: {
        QUESTION_TABLE_NAME: props.tableName,
      },
    });

    this.lambda = getQuestion;
  }
}
