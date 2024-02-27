import * as cdk from "@aws-cdk/core";
import * as dynamo from "@aws-cdk/aws-dynamodb";
import * as agw from "@aws-cdk/aws-apigateway";
import Table from "./constructs/dynamo/QuestionTable";
import ApiGw from "./constructs/apigw";
import GetDesignation from "./constructs/lambda/getLambda";
import CreateDesignation from "./constructs/lambda/createLambda";
import DeleteDesignation from "./constructs/lambda/deleteLambda";
import UpdateDesignation from "./constructs/lambda/updateLambda";
import SoftDeleteDesignation from "./constructs/lambda/softDeleteLambda";

interface Props {
  devEnv: string;
}

export default class QuestionStack extends cdk.Construct {
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

    // --------- Get Designation ---------------
    const getLambda = new GetDesignation(this, "get", {
      tableName: this.table.tableName,
    }).lambda;

    const getResourceInt = new agw.LambdaIntegration(getLambda);

    apigw.apiRoot.addMethod("GET", getResourceInt);

    this.table.grantReadData(getLambda);

    // --------- Post Designation ---------------
    const createLambda = new CreateDesignation(this, "create", {
      tableName: this.table.tableName,
    }).lambda;

    const createResourceInt = new agw.LambdaIntegration(createLambda);

    apigw.apiRoot.addMethod("POST", createResourceInt);

    this.table.grantWriteData(createLambda);

    // --------- Delete Designation ---------------
    const deleteLambda = new DeleteDesignation(this, "delete", {
      tableName: this.table.tableName,
    }).lambda;

    const deleteResourceInt = new agw.LambdaIntegration(deleteLambda);

    apigw.apiRoot.addMethod("DELETE", deleteResourceInt);

    this.table.grantWriteData(deleteLambda);

    // --------- List Questions ---------------
    // const listLambda = new ListQuestions(this, "list", {
    //   tableName: this.table.tableName,
    // }).lambda;

    // const listResourceInt = new agw.LambdaIntegration(listLambda);
    // const list = apigw.apiQuestion.addResource("list");

    // list.addMethod("GET", listResourceInt);

    // this.table.grantWriteData(listLambda);

    // --------- Update Designation ---------------
    const updateLambda = new UpdateDesignation(this, "update", {
      tableName: this.table.tableName,
    }).lambda;

    const updateResourceInt = new agw.LambdaIntegration(updateLambda);

    apigw.apiRoot.addMethod("PUT", updateResourceInt);

    this.table.grantWriteData(updateLambda);

    // --------- Soft Delete Designation ---------------
    const softDeleteLambda = new SoftDeleteDesignation(this, "soft-delete", {
      tableName: this.table.tableName,
    }).lambda;

    const softDeleteResourceInt = new agw.LambdaIntegration(softDeleteLambda);

    const softDeleteEndpoint = apigw.apiRoot.addResource("soft-delete");
    softDeleteEndpoint.addMethod("PUT", softDeleteResourceInt);

    this.table.grantWriteData(softDeleteLambda);
  }
}
