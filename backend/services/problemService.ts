import Problem from '../models/Problem';
import { IProblem } from '../types';

export const getRandomProblem = async (topic?: string, difficulty?: string): Promise<IProblem | null> => {
  const query: Record<string, string> = {};
  if (topic && topic !== 'random') query.topic = topic;
  if (difficulty && difficulty !== 'random') query.difficulty = difficulty;

  const count = await Problem.countDocuments(query);
  if (count === 0) {
    const totalCount = await Problem.countDocuments();
    if (totalCount === 0) {
      throw new Error('Database is empty. Please run the seed script.');
    }
    
    const randomIndex = Math.floor(Math.random() * totalCount);
    return Problem.findOne().skip(randomIndex) as unknown as IProblem;
  }

  const randomIndex = Math.floor(Math.random() * count);
  return Problem.findOne(query).skip(randomIndex) as unknown as IProblem;
};


