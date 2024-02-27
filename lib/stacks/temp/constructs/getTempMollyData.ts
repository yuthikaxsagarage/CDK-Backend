import { Construct } from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";

type Props = {
  companyTableName: string;
  jobTableName: string;
  candidateTableName: string;
  userTableName: string;
};

export default class GetTempMollyData extends Construct {
  public readonly lambda: lambda.IFunction;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    const getTest = new lambda.Function(scope, `getTempMollyData`, {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset("./lib/stacks/temp/lambdaFns/getTempData", {
        exclude: ["*.ts"],
      }),
      environment: {
        COMPANY_TABLE_NAME: props.companyTableName,
        JOB_TABLE_NAME: props.jobTableName,
        CANDIDATE_TABLE_NAME: props.candidateTableName,
        USER_TABLE_NAME: props.userTableName,
      },
    });

    this.lambda = getTest;
  }
}
