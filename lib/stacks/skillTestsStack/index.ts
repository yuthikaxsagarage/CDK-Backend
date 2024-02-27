import Table from "./constructs/Table";
import * as dynamo from "@aws-cdk/aws-dynamodb";
import ApiGw from "./constructs/ApiGateway";
import * as agw from "@aws-cdk/aws-apigateway";

import { Construct, NestedStack, NestedStackProps } from "@aws-cdk/core";
import GetTest from "./constructs/lambda/getTest";
import CreateTest from "./constructs/lambda/createTest";
import UpdateTest from "./constructs/lambda/updateTest";
import ListTests from "./constructs/lambda/listTests";
import ListTestTemplates from "./constructs/lambda/listTestTemplates";

interface Props {
  isProd: boolean;
  devEnv: string;
}

export default class SkillTestsStack extends NestedStack {
  public readonly table: dynamo.ITable;

  constructor(scope: Construct, id: string, props?: NestedStackProps & Props) {
    super(scope, id, props);

    const devEnv = props?.devEnv ? props?.devEnv : "prod";
    const isProd = props?.isProd ? props?.isProd : false;

    this.table = new Table(this, "table", {
      devEnv,
      isProd,
    }).table;

    const apigw = new ApiGw(this, "apigw", {
      devEnv,
      isProd,
    });

    // Get

    const getLambda = new GetTest(this, "get", {
      tableName: this.table.tableName,
    }).lambda;

    const getResourceInt = new agw.LambdaIntegration(getLambda);

    apigw.rootApi.addMethod("GET", getResourceInt);
    this.table.grantReadData(getLambda);

    //CreateTest
    const createLambda = new CreateTest(this, "create", {
      tableName: this.table.tableName,
    }).lambda;

    const createResourceInt = new agw.LambdaIntegration(createLambda);

    apigw.rootApi.addMethod("POST", createResourceInt);
    this.table.grantWriteData(createLambda);

    //UpdateTest
    const updateLambda = new UpdateTest(this, "update", {
      tableName: this.table.tableName,
    }).lambda;

    const updateResourceInt = new agw.LambdaIntegration(updateLambda);

    apigw.rootApi.addMethod("PUT", updateResourceInt);
    this.table.grantWriteData(updateLambda);

    //ListTests
    const listTestsLambda = new ListTests(this, "list", {
      tableName: this.table.tableName,
    }).lambda;

    const listResourceInt = new agw.LambdaIntegration(listTestsLambda);

    const subRoot = apigw.rootApi.addResource("tests");
    subRoot.addMethod("GET", listResourceInt);

    this.table.grantReadData(listTestsLambda);

    //ListTestTemplates
    const listTestTemplatesLambda = new ListTestTemplates(
      this,
      "listTemplates",
      {
        tableName: this.table.tableName,
      }
    ).lambda;

    const listTestTemplatesResourceInt = new agw.LambdaIntegration(
      listTestTemplatesLambda
    );

    const subRootTemplates = apigw.rootApi.addResource("templates");
    subRootTemplates.addMethod("GET", listTestTemplatesResourceInt);

    this.table.grantReadData(listTestTemplatesLambda);
  }
}
