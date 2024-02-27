import { Construct, Stack, StackProps } from "@aws-cdk/core";
import UserStack from "./userStack";
import CompanyStack from "./companyStack";
import TestsStack from "./skillTestsStack";
import QuestionStack from "./questionsStack";
import CandidateTest from "./candidateTest";
import AnswerStack from "./answerStack";
import IndustryStack from "./industryStack";
import DesignationStack from "./designationStack";
import CategoryStack from "./categoryStack";
import DifficultyStack from "./difficultyStack";
import QuestionTypeStack from "./questionTypeStack";
import MollyTempData from "./temp";

type Props = {
  isProd: boolean;
  devEnv?: string;
};

export default class SkillAppStack extends Stack {
  public readonly companyStack: CompanyStack;
  public readonly userStack: UserStack;

  constructor(scope: Construct, id: string, props?: StackProps & Props) {
    super(scope, id, props);

    this.companyStack = new CompanyStack(this, "ms-company");

    this.userStack = new UserStack(this, "ms-user", {
      companyTable: this.companyStack.companyTable,
    });

    new TestsStack(this, "ms-skill-tests", {
      isProd: props?.isProd ? props.isProd : false,
      devEnv: props?.devEnv ? props.devEnv : "prod",
    });

    new QuestionStack(this, "ms-question", {
      devEnv: props?.devEnv ? props.devEnv : "prod",
    });

    new CandidateTest(this, "ms-candidate-test", {
      devEnv: props?.devEnv ? props.devEnv : "prod",
    });

    new AnswerStack(this, "ms-answer", {
      devEnv: props?.devEnv ? props.devEnv : "prod",
    });

    new IndustryStack(this, "ms-industry", {
      devEnv: props?.devEnv ? props.devEnv : "prod",
    });

    new DesignationStack(this, "ms-designation", {
      devEnv: props?.devEnv ? props.devEnv : "prod",
    });
    new CategoryStack(this, "ms-category", {
      devEnv: props?.devEnv ? props.devEnv : "prod",
    });

    new DifficultyStack(this, "ms-difficulty", {
      devEnv: props?.devEnv ? props.devEnv : "prod",
    });

    new QuestionTypeStack(this, "ms-question-type", {
      devEnv: props?.devEnv ? props.devEnv : "prod",
    });

    new MollyTempData(this, "ms-molly-temp-data", {
      isProd: props?.isProd ? props.isProd : false,
      devEnv: props?.devEnv ? props.devEnv : "prod",
    });
  }
}
