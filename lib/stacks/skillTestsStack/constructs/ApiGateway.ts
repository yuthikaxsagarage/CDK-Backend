import * as cdk from "@aws-cdk/core";
import * as agw from "@aws-cdk/aws-apigateway";
import * as lambda from "@aws-cdk/aws-lambda";
import GetTest from "../constructs/lambda/getTest";

interface Props {
  isProd: boolean;
  devEnv: string;
}

export default class ApiGway extends cdk.Construct {
  public readonly getLambda: lambda.IFunction;
  public readonly rootApi: agw.IResource;

  constructor(scope: cdk.Construct, id: string, props: Props) {
    super(scope, id);

    const apiGWTest = new agw.RestApi(this, `skill-tests`, {
      restApiName: `${props.devEnv}-skills-skill-tests`,
      defaultCorsPreflightOptions: {
        allowOrigins: agw.Cors.ALL_ORIGINS,
        allowMethods: agw.Cors.ALL_METHODS,
      },
    });

    this.rootApi = apiGWTest.root;
  }
}
