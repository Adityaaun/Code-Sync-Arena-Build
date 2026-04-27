import Problem from '../models/Problem';

export const getRandomProblem = async (topic?: string, difficulty?: string) => {
  const query: any = {};
  if (topic && topic !== 'random') query.topic = topic;
  if (difficulty && difficulty !== 'random') query.difficulty = difficulty;

  console.log('Fetching problem with query:', query);

  const count = await Problem.countDocuments(query);
  if (count === 0) {
    const totalCount = await Problem.countDocuments();
    if (totalCount === 0) {
      throw new Error('Database is empty. Please run the seed script.');
    }
    // If no match found for filters, try to find any problem as a fallback
    console.log(`No problems found for topic: ${topic}, difficulty: ${difficulty}. Falling back to random.`);
    const random = Math.floor(Math.random() * totalCount);
    return Problem.findOne().skip(random);
  }

  const random = Math.floor(Math.random() * count);
  return Problem.findOne(query).skip(random);
};
