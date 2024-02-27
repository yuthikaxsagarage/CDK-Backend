import * as cdk from "@aws-cdk/core";
import * as dynamo from "@aws-cdk/aws-dynamodb";
import * as agw from "@aws-cdk/aws-apigateway";
import Table from "./constructs/dynamo/IndustryTable";
import ApiGw from "./constructs/apigw";
import GetIndustry from "./constructs/lambda/getLambda";
import CreateIndustry from "./constructs/lambda/createLambda";
import DeleteIndustry from "./constructs/lambda/deleteLambda";
import SoftDeleteIndustry from "./constructs/lambda/softDeleteLambda";
import UpdateIndustry from "./constructs/lambda/updateLambda";

interface Props {
  devEnv: string;
}

export default class IndustryStack extends cdk.Construct {
  public readonly table: dynamo.ITable;

  constructor(scope: cdk.Construct, id: string, props: Props) {
    super(scope, id);
    const devEnv = props.devEnv ? props.devEnv : "prod";

    this.table = new Table(this, "table", {
      devEnv,
    }).table;

    const apigw = new ApiGw(this, "apigw", {
      devEnv,
    });

    // --------- Get Industry ---------------
    const getLambda = new GetIndustry(this, "get", {
      tableName: this.table.tableName,
    }).lambda;

    const getResourceInt = new agw.LambdaIntegration(getLambda);

    apigw.apiRoot.addMethod("GET", getResourceInt);

    this.table.grantReadData(getLambda);

    // --------- Post Industry ---------------
    const createLambda = new CreateIndustry(this, "create", {
      tableName: this.table.tableName,
    }).lambda;

    const createResourceInt = new agw.LambdaIntegration(createLambda);

    apigw.apiRoot.addMethod("POST", createResourceInt);

    this.table.grantWriteData(createLambda);

    // --------- Delete Industry ---------------
    const deleteLambda = new DeleteIndustry(this, "delete", {
      tableName: this.table.tableName,
    }).lambda;

    const deleteResourceInt = new agw.LambdaIntegration(deleteLambda);

    apigw.apiRoot.addMethod("DELETE", deleteResourceInt);

    this.table.grantWriteData(deleteLambda);

    // --------- List Industry ---------------
    // const listLambda = new ListQuestions(this, "list", {
    //   tableName: this.table.tableName,
    // }).lambda;

    // const listResourceInt = new agw.LambdaIntegration(listLambda);
    // const list = apigw.apiQuestion.addResource("list");

    // list.addMethod("GET", listResourceInt);

    // this.table.grantWriteData(listLambda);

    // --------- Update Industry ---------------
    const updateLambda = new UpdateIndustry(this, "update", {
      tableName: this.table.tableName,
    }).lambda;

    const updateResourceInt = new agw.LambdaIntegration(updateLambda);

    apigw.apiRoot.addMethod("PUT", updateResourceInt);

    this.table.grantWriteData(updateLambda);

    // --------- Soft Delete Industry ---------------
    const softDeleteLambda = new SoftDeleteIndustry(this, "soft-delete", {
      tableName: this.table.tableName,
    }).lambda;

    const softDeleteResourceInt = new agw.LambdaIntegration(softDeleteLambda);

    const softDeleteEndPoint = apigw.apiRoot.addResource("soft-delete")
    softDeleteEndPoint.addMethod("DELETE", softDeleteResourceInt);

    this.table.grantWriteData(softDeleteLambda);
  }
}
