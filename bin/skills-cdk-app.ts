#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import SkillsAppStack from "../lib/stacks";

// import { SkillsCdkAppStack } from "../lib/skills-cdk-app-stack";

const stackIdPrefix = `SkillsApp`;

const app = new cdk.App();

new SkillsAppStack(app, `${stackIdPrefix}-dev`, {
  isProd: false,
  devEnv: "dev",
});
new SkillsAppStack(app, `${stackIdPrefix}-devtesting`, {
  isProd: false,
  devEnv: "devtesting",
});
new SkillsAppStack(app, `${stackIdPrefix}-next`, { isProd: false, devEnv: "next"});
new SkillsAppStack(app, `${stackIdPrefix}-prod`, { isProd: true });

// const a = new SkillsCdkAppStack(app, stackIdPrefix, {
//   /* If you don't specify 'env', this stack will be environment-agnostic.
//    * Account/Region-dependent features and context lookups will not work,
//    * but a single synthesized template can be deployed anywhere. */
//   /* Uncomment the next line to specialize this stack for the AWS Account
//    * and Region that are implied by the current CLI configuration. */
//   // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
//   /* Uncomment the next line if you know exactly what Account and Region you
//    * want to deploy the stack to. */
//   // env: { account: '123456789012', region: 'us-east-1' },
//   /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
// });
