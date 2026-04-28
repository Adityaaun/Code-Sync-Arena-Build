import Problem from '../models/Problem';

export const getRandomProblem = async (topic?: string, difficulty?: string) => {
  const query: any = {};
  if (topic && topic !== 'random') query.topic = topic;
  if (difficulty && difficulty !== 'random') query.difficulty = difficulty;

  const count = await Problem.countDocuments(query);
  if (count === 0) {
    const totalCount = await Problem.countDocuments();
    if (totalCount === 0) {
      throw new Error('Database is empty. Please run the seed script.');
    }
    
    // Fallback to a random problem if filters return no results
    const randomIndex = Math.floor(Math.random() * totalCount);
    return Problem.findOne().skip(randomIndex);
  }

  const randomIndex = Math.floor(Math.random() * count);
  return Problem.findOne(query).skip(randomIndex);
};

