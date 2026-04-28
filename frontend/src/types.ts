export interface IExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface ITestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export interface IStarterCode {
  javascript?: string;
  python?: string;
  cpp?: string;
  java?: string;
}

export interface IProblem {
  _id: string;
  title: string;
  description: string;
  topic: string;
  difficulty: string;
  examples: IExample[];
  testCases: ITestCase[];
  starterCode: IStarterCode;
}
