import * as cdk from "@aws-cdk/core";
import * as dynamo from "@aws-cdk/aws-dynamodb";
import * as apg from "@aws-cdk/aws-apigateway";
import AnswerTable from "./constructs/dynamo/AnswerTable";
import ApiGw from "./constructs/apigw";
import GetAnswer from "./constructs/lambda/getLambda";
import CreateAnswer from "./constructs/lambda/createLambda";
import UpdateAnswer from "./constructs/lambda/updateLambda";

interface Props {
  devEnv: string;
}

export default class AnswerStack extends cdk.NestedStack {
  public readonly answerTable: dynamo.Table;

  constructor(
    scope: cdk.Construct,
    id: string,
    props?: cdk.NestedStackProps & Props
  ) {
    super(scope, id, props);

    this.answerTable = new AnswerTable(
      this,
      "answerTable",
      {
        devEnv: props?.devEnv ? props.devEnv : "prod",
      }
    ).table;

    const apiGw = new ApiGw(this, "apigw", {
      devEnv: props?.devEnv ? props.devEnv : "prod",
    });

    // Get
    const getLambda = new GetAnswer(this, "get", {
      tableName: this.answerTable.tableName,
    }).lambda;

    const getResourceInt = new apg.LambdaIntegration(getLambda);

    apiGw.rootApi.addMethod("GET", getResourceInt);
    this.answerTable.grantReadData(getLambda);

    // Create
    const createLambda = new CreateAnswer(this, "create", {
      tableName: this.answerTable.tableName,
    }).lambda;

    const createResourceInt = new apg.LambdaIntegration(createLambda);

    apiGw.rootApi.addMethod("POST", createResourceInt);
    this.answerTable.grantWriteData(createLambda);

    // Update
    const updateLambda = new UpdateAnswer(this, "update", {
      tableName: this.answerTable.tableName,
    }).lambda;

    const updateResourceInt = new apg.LambdaIntegration(updateLambda);

    apiGw.rootApi.addMethod("PUT", updateResourceInt);
    this.answerTable.grantWriteData(updateLambda);
  }
}
