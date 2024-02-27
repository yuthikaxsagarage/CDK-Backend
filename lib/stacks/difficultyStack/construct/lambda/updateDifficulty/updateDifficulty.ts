import { Construct } from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";

type Props = {
  tableName: string;
};

export default class UpdateDifficulty extends Construct {
  public readonly lambda: lambda.IFunction;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    const updateLambda = new lambda.Function(scope, `updateDifficulty`, {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset(
        "./lib/stacks/difficultyStack/lambdaFns/updateDifficulty",
        {
          exclude: ["*.ts"],
        }
      ),
      environment: {
        DIFFICULTY_TABLE_NAME: props.tableName,
      },
    });

    this.lambda = updateLambda;
  }
}
