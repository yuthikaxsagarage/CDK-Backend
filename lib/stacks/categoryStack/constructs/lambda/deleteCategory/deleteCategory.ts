import { Construct } from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";

type Props = {
  tableName: string;
};

export default class DeleteCategory extends Construct {
  public readonly lambda: lambda.IFunction;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    const deleteCategory = new lambda.Function(scope, `-deleteCategory-`, {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset(
        "./lib/stacks/categoryStack/lambdaFns/deleteCategory",
        {
          exclude: ["*.ts"],
        }
      ),
      environment: {
        CATEGORY_TABLE_NAME: props.tableName,
      },
    });

    this.lambda = deleteCategory;
  }
}
