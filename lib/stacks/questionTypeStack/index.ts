import * as cdk from "@aws-cdk/core";
import * as dynamo from "@aws-cdk/aws-dynamodb";
import * as agw from "@aws-cdk/aws-apigateway";
import Table from "./constructs/dynamo/QuestionTable";
import ApiGw from "./constructs/apigw";
import GetQuestionType from "./constructs/lambda/getLambda";
import CreateQuestionType from "./constructs/lambda/createLambda";
import DeleteQuestionType from "./constructs/lambda/deleteLambda";
import UpdateQuestionType from "./constructs/lambda/updateLambda";

interface Props {
  devEnv: string;
}

export default class QuestionTypeStack extends cdk.Construct {
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
    const getLambda = new GetQuestionType(this, "get", {
      tableName: this.table.tableName,
    }).lambda;

    const getResourceInt = new agw.LambdaIntegration(getLambda);

    apigw.apiRoot.addMethod("GET", getResourceInt);

    this.table.grantReadData(getLambda);

    // --------- Post Question ---------------
    const createLambda = new CreateQuestionType(this, "create", {
      tableName: this.table.tableName,
    }).lambda;

    const createResourceInt = new agw.LambdaIntegration(createLambda);

    apigw.apiRoot.addMethod("POST", createResourceInt);

    this.table.grantWriteData(createLambda);

    // --------- Delete Question ---------------
    const deleteLambda = new DeleteQuestionType(this, "delete", {
      tableName: this.table.tableName,
    }).lambda;

    const deleteResourceInt = new agw.LambdaIntegration(deleteLambda);

    apigw.apiRoot.addMethod("DELETE", deleteResourceInt);

    this.table.grantWriteData(deleteLambda);

    // --------- Update Question ---------------
    const updateLambda = new UpdateQuestionType(this, "update", {
      tableName: this.table.tableName,
    }).lambda;

    const updateResourceInt = new agw.LambdaIntegration(updateLambda);

    apigw.apiRoot.addMethod("PUT", updateResourceInt);

    this.table.grantWriteData(updateLambda);
  }
}
