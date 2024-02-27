import * as cdk from "@aws-cdk/core";
import * as agw from "@aws-cdk/aws-apigateway";

interface Props {
  devEnv: string;
}

export default class ApiGway extends cdk.Construct {
  public readonly apiRoot: agw.IResource;

  constructor(scope: cdk.Construct, id: string, props: Props) {
    super(scope, id);

    const apiGWTest = new agw.RestApi(this, `ms-candidate-test`, {
      restApiName: `${props.devEnv}-skills-candidate-test`,
      defaultCorsPreflightOptions: {
        allowOrigins: agw.Cors.ALL_ORIGINS,
        allowMethods: agw.Cors.ALL_METHODS,
      },
    });

    this.apiRoot = apiGWTest.root;
  }
}
