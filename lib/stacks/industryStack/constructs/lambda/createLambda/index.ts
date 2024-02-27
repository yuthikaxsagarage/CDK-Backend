import { Construct } from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";

type Props = {
  tableName: string;
};

export default class CreateIndustry extends Construct {
  public readonly lambda: lambda.IFunction;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    const createIndustry = new lambda.Function(scope, `createIndustry`, {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset(
        "./lib/stacks/industryStack/lambdaFns/createIndustry",
        {
          exclude: ["*.ts"],
        }
      ),
      environment: {
        INDUSTRY_TABLE_NAME: props.tableName,
      },
    });

    this.lambda = createIndustry;
  }
}
