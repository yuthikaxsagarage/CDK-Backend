import { Construct } from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";

type Props = {
  tableName: string;
};

export default class UpdateDesignation extends Construct {
  public readonly lambda: lambda.IFunction;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    const updateDesignation = new lambda.Function(scope, `updateDesignation`, {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset(
        "./lib/stacks/designationStack/lambdaFns/updateDesignation",
        {
          exclude: ["*.ts"],
        }
      ),
      environment: {
        DESIGNATION_TABLE_NAME: props.tableName,
      },
    });

    this.lambda = updateDesignation;
  }
}
