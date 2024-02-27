import { Construct } from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";

type Props = {
  tableName: string;
};

export default class StartCandidateTest extends Construct {
  public readonly lambda: lambda.IFunction;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    this.lambda = new lambda.Function(scope, `startCandidateTest`, {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset(
        "./lib/stacks/candidateTest/lambdaFns/startCandidateTest",
        {
          exclude: ["*.ts"],
        }
      ),
      environment: {
        // FIX: Candidate test table
        CANDIDATE_TEST_TABLE_NAME: props.tableName,
      },
    });
  }
}
