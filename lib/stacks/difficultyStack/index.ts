import * as cdk from '@aws-cdk/core';
import * as dynamo from '@aws-cdk/aws-dynamodb';
import * as agw from '@aws-cdk/aws-apigateway';
import Table from './construct/dynamo/difficultyTable';
import ApiGw from './construct/apigw/index';
import CreateDifficulty from './construct/lambda/createDifficulty/createDifficulty';
import ListDifficulty from './construct/lambda/listDifficulty/listDifficulty';
import UpdateDifficulty from './construct/lambda/updateDifficulty/updateDifficulty';
import DeleteDifficulty from './construct/lambda/deleteDifficulty/deleteDifficulty';

interface Props {
    devEnv: string;
}

export default class DifficultyStack extends cdk.Construct {
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

        //Create Difficulty
        const createDifficulty = new CreateDifficulty(this, "create", {
            tableName: this.table.tableName,
        }).lambda;

        const createDifficultyInt = new agw.LambdaIntegration(createDifficulty);

        apigw.apiRoot.addMethod('POST', createDifficultyInt);

        this.table.grantWriteData(createDifficulty);

        //List Difficulty
        const listDifficulty = new ListDifficulty(this, "list", {
            tableName: this.table.tableName,
        }).lambda;

        const listDifficultyInt = new agw.LambdaIntegration(listDifficulty);

        apigw.apiRoot.addMethod("GET", listDifficultyInt);

        this.table.grantReadWriteData(listDifficulty);

        //Update Difficulty 
        const updateDifficulty = new UpdateDifficulty(this, "update", {
            tableName: this.table.tableName,
        }).lambda;

        const updateDifficultyInt = new agw.LambdaIntegration(updateDifficulty);

        apigw.apiRoot.addMethod("PUT", updateDifficultyInt);

        this.table.grantReadWriteData(updateDifficulty);
        
        //Delete Difficulty
        const deleteDifficulty = new DeleteDifficulty(this, "delete", {
            tableName: this.table.tableName,
        }).lambda;

        const deleteDifficultyInt = new agw.LambdaIntegration(deleteDifficulty);

        apigw.apiRoot.addMethod('DELETE', deleteDifficultyInt)

        this.table.grantReadWriteData(deleteDifficulty);
    }
}