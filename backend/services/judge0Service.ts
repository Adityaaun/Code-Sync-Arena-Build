import axios from 'axios';

const JUDGE0_URL = 'https://ce.judge0.com/submissions';

const languageMap: Record<string, number> = {
  javascript: 63,
  python: 71,
  cpp: 54,
  java: 62
};

interface Judge0Response {
  stdout: string;
  stderr: string;
  compile_output: string;
  status: string;
}

export const runCode = async (code: string, language: string, stdin: string): Promise<Judge0Response> => {
  const languageId = languageMap[language] || 63;

  try {
    const response = await axios.post(
      `${JUDGE0_URL}?wait=true`,
      {
        source_code: Buffer.from(code).toString('base64'),
        language_id: languageId,
        stdin: Buffer.from(stdin).toString('base64'),
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const { stdout, stderr, compile_output, status } = response.data;

    return {
      stdout: stdout ? Buffer.from(stdout, 'base64').toString() : '',
      stderr: stderr ? Buffer.from(stderr, 'base64').toString() : '',
      compile_output: compile_output ? Buffer.from(compile_output, 'base64').toString() : '',
      status: status.description
    };
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || 'Unknown Judge0 Error';
    console.error('Judge0 API Error:', errorMsg);
    throw new Error(`Code execution failed: ${errorMsg}`);
  }
};
