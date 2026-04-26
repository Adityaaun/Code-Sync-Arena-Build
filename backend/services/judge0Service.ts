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

const decodeBase64 = (data: string | null): string => {
  if (!data) return '';
  try {
    return Buffer.from(data, 'base64').toString('utf-8').trim();
  } catch (e) {
    return data.trim(); // Return as-is if not base64
  }
};

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
      stdout: decodeBase64(stdout),
      stderr: decodeBase64(stderr),
      compile_output: decodeBase64(compile_output),
      status: status.description
    };
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || 'Unknown Judge0 Error';
    console.error('Judge0 API Error:', errorMsg);
    throw new Error(`Code execution failed: ${errorMsg}`);
  }
};
