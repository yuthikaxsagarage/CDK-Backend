import { Construct } from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";

type Props = {
  tableName: string;
};

export default class ListCategory extends Construct {
  public readonly lambda: lambda.IFunction;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    const listCategory = new lambda.Function(scope, `-listCategoryLambda-`, {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset(
        "./lib/stacks/categoryStack/lambdaFns/listCategory",
        {
          exclude: ["*.ts"],
        }
      ),
      environment: {
        CATEGORY_TABLE_NAME: props.tableName,
      },
    });

    this.lambda = listCategory;
  }
}
