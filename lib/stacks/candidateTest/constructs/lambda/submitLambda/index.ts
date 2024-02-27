import { Construct } from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";

type Props = {
  tableName: string;
};

export default class SubmitCandidateTest extends Construct {
  public readonly lambda: lambda.IFunction;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    this.lambda = new lambda.Function(scope, `submitCandidateTest`, {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset(
        "./lib/stacks/candidateTest/lambdaFns/submitCandidateTest",
        {
          exclude: ["*.ts"],
        }
      ),
      environment: {
        CANDIDATE_TEST_TABLE_NAME: props.tableName,
      },
    });
  }
}
