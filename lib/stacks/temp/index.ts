import ApiGw from "./constructs/apiGatewayTempMollyData";
import * as agw from "@aws-cdk/aws-apigateway";
import * as iam from "@aws-cdk/aws-iam";

import { Construct, NestedStack, NestedStackProps } from "@aws-cdk/core";
import GetTempData from "./constructs/getTempMollyData";

interface Props {
  isProd: boolean;
  devEnv: string;
}

const tableNames: {
  [key: string]: { [key: string]: string };
} = {
  companyTableName: {
    devtesting: "Company-efays4od3nbojliotyq4vm7jhq-devtesting",
  
  },
  jobTableName: {
    devtesting: "Job-efays4od3nbojliotyq4vm7jhq-devtesting",

  },
  candidateTableName: {
    devtesting: "Candidate-efays4od3nbojliotyq4vm7jhq-devtesting",
  },
  userTableName: {
    devtesting: "User-efays4od3nbojliotyq4vm7jhq-devtesting",
  },
};

const tableArns: {
  [key: string]: { [key: string]: string };
} = {
  companyTableName: {
    devtesting: "arn:aws:dynamodb:us-west-2:987808624409:table/Company-efays4od3nbojliotyq4vm7jhq-devtesting",
  },
  jobTableName: {
    devtesting: "arn:aws:dynamodb:us-west-2:987808624409:table/Job-efays4od3nbojliotyq4vm7jhq-devtesting",
 
  },
  candidateTableName: {
    devtesting: "arn:aws:dynamodb:us-west-2:987808624409:table/Candidate-efays4od3nbojliotyq4vm7jhq-devtesting",
  },
  userTableName: {
    devtesting: "arn:aws:dynamodb:us-west-2:987808624409:table/User-efays4od3nbojliotyq4vm7jhq-devtesting",
   
  },
};

export default class MollyTempData extends NestedStack {
  constructor(scope: Construct, id: string, props?: NestedStackProps & Props) {
    super(scope, id, props);

    if (!props) {
      throw new Error("devEnv and isProd are required");
    }

    const devEnv = props.devEnv ? props.devEnv : "prod";
    const isProd = props.isProd ? props.isProd : false;

    const apigw = new ApiGw(this, "apigw", {
      devEnv,
      isProd,
    });

    // Get

    const getLambda = new GetTempData(this, "get", {
      companyTableName: tableNames["companyTableName"][props.devEnv],
      jobTableName: tableNames["jobTableName"][props.devEnv],
      candidateTableName: tableNames["candidateTableName"][props.devEnv],
      userTableName: tableNames["userTableName"][props.devEnv],
    }).lambda;

    const getResourceInt = new agw.LambdaIntegration(getLambda);

    apigw.rootApi.addMethod("GET", getResourceInt);

    getLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["dynamodb:GetItem", "dynamodb:QueryItem"],
        resources: [
          ...Object.keys(tableArns).map((key) => tableArns[key][devEnv]),
        ],
      })
    );
  }
}
