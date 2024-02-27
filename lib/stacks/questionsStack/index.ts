import * as cdk from "@aws-cdk/core";
import * as dynamo from "@aws-cdk/aws-dynamodb";
import * as agw from "@aws-cdk/aws-apigateway";
import Table from "./constructs/dynamo/QuestionTable";
import ApiGw from "./constructs/apigw";
import GetQuestion from "./constructs/lambda/getLambda";
import CreateQuestion from "./constructs/lambda/createLambda";
import DeleteQuestion from "./constructs/lambda/deleteLambda";
import ListQuestions from "./constructs/lambda/listLambda";
import UpdateQuestion from "./constructs/lambda/updateLambda";
import BatchGet from "./constructs/lambda/batchGetLambda";

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

    // --------- Get Question ---------------
    const getLambda = new GetQuestion(this, "get", {
      tableName: this.table.tableName,
    }).lambda;

    const getResourceInt = new agw.LambdaIntegration(getLambda);

    apigw.apiRoot.addMethod("GET", getResourceInt);

    this.table.grantReadData(getLambda);

    // --------- Post Question ---------------
    const createLambda = new CreateQuestion(this, "create", {
      tableName: this.table.tableName,
    }).lambda;

    const createResourceInt = new agw.LambdaIntegration(createLambda);

    apigw.apiRoot.addMethod("POST", createResourceInt);

    this.table.grantWriteData(createLambda);

    // --------- Delete Question ---------------
    const deleteLambda = new DeleteQuestion(this, "delete", {
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

    // --------- Update Question ---------------
    const updateLambda = new UpdateQuestion(this, "update", {
      tableName: this.table.tableName,
    }).lambda;

    const updateResourceInt = new agw.LambdaIntegration(updateLambda);

    apigw.apiRoot.addMethod("PUT", updateResourceInt);

    this.table.grantWriteData(updateLambda);

    // Batch get
    const batchGetLambda = new BatchGet(this, "batchGet", {
      tableName: this.table.tableName,
    }).lambda;
    const batchGetResource = apigw.apiRoot.addResource("batch-get");
    const batchGetResourceInt = new agw.LambdaIntegration(batchGetLambda);

    batchGetResource.addMethod("GET", batchGetResourceInt);
    this.table.grantReadData(batchGetLambda);
  }
}
