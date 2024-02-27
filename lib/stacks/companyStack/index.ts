import * as cdk from "@aws-cdk/core";
import * as dynamo from "@aws-cdk/aws-dynamodb";
import { Table } from "./constructs/Table";

export default class CompanyStack extends cdk.NestedStack {
  public readonly companyTable: dynamo.Table;

  constructor(scope: cdk.Construct, id: string, props?: cdk.NestedStackProps) {
    super(scope, id, props);
    const table = new Table(this, "company-table");

    this.companyTable = table.table;
  }
}
