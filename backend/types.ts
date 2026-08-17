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

// Internal server-side problem shape. Test cases must never be sent to clients.
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

export interface IPublicProblem {
  _id: string;
  title: string;
  description: string;
  topic: string;
  difficulty: string;
  examples: IExample[];
  starterCode: IStarterCode;
}

export interface IJoinRoomPayload {
  roomId: string;
}

export interface ICodeChangePayload {
  roomId: string;
  code: string;
}

export interface IRunCodePayload {
  roomId: string;
  code: string;
  language: string;
}
