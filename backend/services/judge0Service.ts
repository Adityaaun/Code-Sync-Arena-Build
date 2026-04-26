import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const JUDGE0_URL = 'https://judge0-ce.p.rapidapi.com/submissions';
const RAPIDAPI_HOST = 'judge0-ce.p.rapidapi.com';

const languageMap: Record<string, number> = {
  javascript: 63,
  python: 71,
  cpp: 54,
  java: 62
};

export const runCode = async (code: string, language: string, stdin: string) => {
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
          'content-type': 'application/json',
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
          'X-RapidAPI-Host': RAPIDAPI_HOST,
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
    console.error('Judge0 API Error:', error.response?.data || error.message);
    throw new Error('Code execution failed');
  }
};
