import * as cdk from "@aws-cdk/core";
import * as dynamo from "@aws-cdk/aws-dynamodb";
import * as apg from "@aws-cdk/aws-apigateway";
import CandidateTestTable from "./constructs/dynamo/CandidateTestTable";
import ApiGw from "./constructs/apigw";
import GetCandidateTest from "./constructs/lambda/getLambda";
import CreateCandidateTest from "./constructs/lambda/createLambda";
import UpdateCandidateTest from "./constructs/lambda/updateLambda";
import SubmitCandidateTest from "./constructs/lambda/submitLambda";
import StartCandidateTest from "./constructs/lambda/startCandidateTest";
import ListCandidateTestsByCandidateId from "./constructs/lambda/listCandidateTestsByCandidateId";
import UpdateCandidateTestResult from "./constructs/lambda/updateCandidateTestResult";
import RateCandidateTestResult from "./constructs/lambda/rateCandidateTestResult";

interface Props {
  devEnv: string;
}

export default class CandidateTest extends cdk.NestedStack {
  public readonly candidateTestTable: dynamo.Table;

  constructor(
    scope: cdk.Construct,
    id: string,
    props?: cdk.NestedStackProps & Props
  ) {
    super(scope, id, props);

    this.candidateTestTable = new CandidateTestTable(
      this,
      "candidateTestTable",
      {
        devEnv: props?.devEnv ? props.devEnv : "prod",
      }
    ).table;

    const apiGw = new ApiGw(this, "apigw", {
      devEnv: props?.devEnv ? props.devEnv : "prod",
    });

    // Get
    const getLambda = new GetCandidateTest(this, "get", {
      tableName: this.candidateTestTable.tableName,
    }).lambda;

    const getResourceInt = new apg.LambdaIntegration(getLambda);

    apiGw.apiRoot.addMethod("GET", getResourceInt);
    this.candidateTestTable.grantReadData(getLambda);

    // Create
    const createLambda = new CreateCandidateTest(this, "create", {
      tableName: this.candidateTestTable.tableName,
    }).lambda;

    const createResourceInt = new apg.LambdaIntegration(createLambda);

    apiGw.apiRoot.addMethod("POST", createResourceInt);
    this.candidateTestTable.grantWriteData(createLambda);

    // Update
    const updateLambda = new UpdateCandidateTest(this, "update", {
      tableName: this.candidateTestTable.tableName,
    }).lambda;

    const updateResourceInt = new apg.LambdaIntegration(updateLambda);

    apiGw.apiRoot.addMethod("PUT", updateResourceInt);
    this.candidateTestTable.grantWriteData(updateLambda);

    // Submit
    const submitLambda = new SubmitCandidateTest(this, "submit", {
      tableName: this.candidateTestTable.tableName,
    }).lambda;

    const submitResourceInt = new apg.LambdaIntegration(submitLambda);
    const submit = apiGw.apiRoot.addResource("submit");
    submit.addMethod("PUT", submitResourceInt);
    this.candidateTestTable.grantWriteData(submitLambda);

    // Start candidate test
    const startCandidateTestLambda = new StartCandidateTest(this, "startTest", {
      tableName: this.candidateTestTable.tableName,
    }).lambda;

    const startCandidateTestInt = new apg.LambdaIntegration(
      startCandidateTestLambda
    );

    const abc = apiGw.apiRoot.addResource("start");
    abc.addMethod("PUT", startCandidateTestInt);

    this.candidateTestTable.grantReadWriteData(startCandidateTestLambda);

    //List candidate tests by candidate id
    const listCandidateTestByCandidateIdLambda =
      new ListCandidateTestsByCandidateId(
        this,
        "listCandidateTestsByCandidateId",
        {
          tableName: this.candidateTestTable.tableName,
        }
      ).lambda;

    const listCandidateTestByCandidateIdInt = new apg.LambdaIntegration(
      listCandidateTestByCandidateIdLambda
    );

    const listCandidateTestByCandidateIdResource =
      apiGw.apiRoot.addResource("candidate");
    listCandidateTestByCandidateIdResource.addMethod(
      "GET",
      listCandidateTestByCandidateIdInt
    );
    this.candidateTestTable.grantReadData(listCandidateTestByCandidateIdLambda);

    //Update candidate test results
    const updateCandidateTestResultLambda = new UpdateCandidateTestResult(
      this,
      "updateCandidateTestResults",
      {
        tableName: this.candidateTestTable.tableName,
      }
    ).lambda;

    const updateCandidateTestResultInt = new apg.LambdaIntegration(
      updateCandidateTestResultLambda
    );

    const updateCandidateTestResultResource =
      apiGw.apiRoot.addResource("updateResult");
    updateCandidateTestResultResource.addMethod(
      "PUT",
      updateCandidateTestResultInt
    );
    this.candidateTestTable.grantReadWriteData(updateCandidateTestResultLambda);

    // rate candidate test answers
    const rateCandidateTestResultLambda = new RateCandidateTestResult(
      this,
      "rateCandidateTestResults",
      {
        tableName: this.candidateTestTable.tableName,
      }
    ).lambda;

    const rateCandidateTestResultInt = new apg.LambdaIntegration(
      rateCandidateTestResultLambda
    );

    const rateCandidateTestResultResource =
      apiGw.apiRoot.addResource("rateResult");
    rateCandidateTestResultResource.addMethod(
      "PUT",
      rateCandidateTestResultInt
    );
    this.candidateTestTable.grantReadWriteData(rateCandidateTestResultLambda);
  }
}
