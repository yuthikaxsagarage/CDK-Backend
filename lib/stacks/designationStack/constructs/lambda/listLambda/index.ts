import { Construct } from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";

type Props = {
  tableName: string;
};

export default class ListDesignation extends Construct {
  public readonly lambda: lambda.IFunction;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    const listDesignation = new lambda.Function(scope, `-listDesignationLambda-`, {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset(
        "./lib/stacks/designationStack/lambdaFns/listDesignation",
        {
          exclude: ["*.ts"],
        }
      ),
      environment: {
        DESIGNATION_TABLE_NAME: props.tableName,
      },
    });

    this.lambda = listDesignation;
  }
}
