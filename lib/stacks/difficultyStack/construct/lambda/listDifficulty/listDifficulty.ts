import { Construct } from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";

type Props = {
  tableName: string;
};

export default class ListDifficulty extends Construct {
  public readonly lambda: lambda.IFunction;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    const listDifficulty = new lambda.Function(scope, `-listDifficultyLambda-`, {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset(
        "./lib/stacks/difficultyStack/lambdaFns/listDifficulty",
        {
          exclude: ["*.ts"],
        }
      ),
      environment: {
        DIFFICULTY_TABLE_NAME: props.tableName,
      },
    });

    this.lambda = listDifficulty;
  }
}
