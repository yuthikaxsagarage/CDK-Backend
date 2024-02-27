import * as cdk from '@aws-cdk/core';
import * as dynamo from '@aws-cdk/aws-dynamodb';
import * as agw from '@aws-cdk/aws-apigateway';
import Table from "./constructs/dynamo/categoryTable";
import ApiGw from "./constructs/apigw";
import CreateCategory from './constructs/lambda/createCategory/createCategory';
import ListCategory from './constructs/lambda/listCategory/listCategory';
import DeleteCategory from './constructs/lambda/deleteCategory/deleteCategory';
import SoftDeleteCategory from './constructs/lambda/softDeleteCategory/softDeleteCategory';
import UpdateCategory from './constructs/lambda/updateCategory/updateCategory';

interface Props {
    devEnv: string;
}

export default class CategoryStack extends cdk.Construct {
    public readonly table: dynamo.ITable;

    constructor(scope: cdk.Construct, id: string, props: Props){
        super(scope, id);
        const devEnv = props.devEnv ? props.devEnv : 'prod';

        this.table = new Table(this, "table", {
            devEnv,
        }).table;

        const apigw = new ApiGw(this, "apigw", {
            devEnv,
        });

        //Create Category
        const createLambda = new CreateCategory(this, "create", {
            tableName: this.table.tableName,
        }).lambda;

        const createCategoryInt = new agw.LambdaIntegration(createLambda);

        apigw.apiRoot.addMethod("POST", createCategoryInt);

        this.table.grantWriteData(createLambda);

        //Get Category
        const listLambda = new ListCategory(this, "list", {
            tableName: this.table.tableName,
        }).lambda;

        const listLambdaInt = new agw.LambdaIntegration(listLambda);

        apigw.apiRoot.addMethod("GET", listLambdaInt);

        this.table.grantReadData(listLambda);
        
        //Update Category
        const updateLambda = new UpdateCategory(this, "update", {
            tableName: this.table.tableName,
        }).lambda;

        const updateCategoryInt = new agw.LambdaIntegration(updateLambda);

        apigw.apiRoot.addMethod("PUT", updateCategoryInt);

        this.table.grantReadWriteData(updateLambda);

        //Delete Category
        const deleteLambda = new DeleteCategory(this, "delete", {
            tableName: this.table.tableName,
        }).lambda;

        const deleteCategoryInt = new agw.LambdaIntegration(deleteLambda);

        apigw.apiRoot.addMethod("DELETE", deleteCategoryInt);

        this.table.grantReadWriteData(deleteLambda);

        //Soft-delete Category
        const softDeleteLambda = new SoftDeleteCategory(this, "soft-delete", {
            tableName: this.table.tableName,
        }).lambda;

        const softDeleteCategoryInt = new agw.LambdaIntegration(softDeleteLambda);

        const subRoot = apigw.apiRoot.addResource("soft-delete");
        subRoot.addMethod("PUT", softDeleteCategoryInt);

        this.table.grantWriteData(softDeleteLambda);
    }
}