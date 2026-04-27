import mongoose from 'mongoose';
import Problem from './models/Problem';
import dotenv from 'dotenv';

dotenv.config();

const problems = [
  // --- ARRAYS ---
  {
    title: "Two Sum",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. \nConstraints: 2 <= nums.length <= 10^4",
    topic: "array",
    difficulty: "easy",
    examples: [{ input: "2 7 11 15\n9", output: "0 1" }],
    testCases: [
      { input: "2 7 11 15\n9", expectedOutput: "0 1", isHidden: false },
      { input: "3 2 4\n6", expectedOutput: "1 2", isHidden: false },
      { input: "3 3\n6", expectedOutput: "0 1", isHidden: true }
    ],
    starterCode: {
      javascript: "function twoSum(nums, target) {\n    // Write your code here\n}",
      python: "def twoSum(nums, target):\n    # Write your code here\n    pass",
      cpp: "vector<int> twoSum(vector<int>& nums, int target) {\n    \n}"
    }
  },
  {
    title: "Container With Most Water",
    description: "You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]). Find two lines that together with the x-axis form a container, such that the container contains the most water. Return the maximum amount of water a container can store.",
    topic: "array",
    difficulty: "medium",
    examples: [{ input: "1 8 6 2 5 4 8 3 7", output: "49" }],
    testCases: [
      { input: "1 8 6 2 5 4 8 3 7", expectedOutput: "49", isHidden: false },
      { input: "1 1", expectedOutput: "1", isHidden: false },
      { input: "4 3 2 1 4", expectedOutput: "16", isHidden: true }
    ]
  },
  {
    title: "Trapping Rain Water",
    description: "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
    topic: "array",
    difficulty: "hard",
    examples: [{ input: "0 1 0 2 1 0 1 3 2 1 2 1", output: "6" }],
    testCases: [
      { input: "0 1 0 2 1 0 1 3 2 1 2 1", expectedOutput: "6", isHidden: false },
      { input: "4 2 0 3 2 5", expectedOutput: "9", isHidden: false }
    ]
  },

  // --- STRINGS ---
  {
    title: "Valid Palindrome",
    description: "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Given a string s, return true if it is a palindrome, or false otherwise.",
    topic: "string",
    difficulty: "easy",
    examples: [{ input: "A man, a plan, a canal: Panama", output: "true" }],
    testCases: [
      { input: "A man, a plan, a canal: Panama", expectedOutput: "true", isHidden: false },
      { input: "race a car", expectedOutput: "false", isHidden: false },
      { input: " ", expectedOutput: "true", isHidden: true }
    ]
  },
  {
    title: "Longest Substring Without Repeating Characters",
    description: "Given a string s, find the length of the longest substring without repeating characters.",
    topic: "string",
    difficulty: "medium",
    examples: [{ input: "abcabcbb", output: "3" }],
    testCases: [
      { input: "abcabcbb", expectedOutput: "3", isHidden: false },
      { input: "bbbbb", expectedOutput: "1", isHidden: false },
      { input: "pwwkew", expectedOutput: "3", isHidden: true }
    ]
  },
  {
    title: "Minimum Window Substring",
    description: "Given two strings s and t of lengths m and n respectively, return the minimum window substring of s such that every character in t (including duplicates) is included in the window. If there is no such substring, return the empty string \"\".",
    topic: "string",
    difficulty: "hard",
    examples: [{ input: "ADOBECODEBANC\nABC", output: "BANC" }],
    testCases: [
      { input: "ADOBECODEBANC\nABC", expectedOutput: "BANC", isHidden: false },
      { input: "a\na", expectedOutput: "a", isHidden: false },
      { input: "a\naa", expectedOutput: "", isHidden: true }
    ]
  },

  // --- DP ---
  {
    title: "Climbing Stairs",
    description: "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
    topic: "dp",
    difficulty: "easy",
    examples: [{ input: "3", output: "3" }],
    testCases: [
      { input: "2", expectedOutput: "2", isHidden: false },
      { input: "3", expectedOutput: "3", isHidden: false },
      { input: "45", expectedOutput: "1836311903", isHidden: true }
    ]
  },
  {
    title: "Longest Increasing Subsequence",
    description: "Given an integer array nums, return the length of the longest strictly increasing subsequence.",
    topic: "dp",
    difficulty: "medium",
    examples: [{ input: "10 9 2 5 3 7 101 18", output: "4" }],
    testCases: [
      { input: "10 9 2 5 3 7 101 18", expectedOutput: "4", isHidden: false },
      { input: "0 1 0 3 2 3", expectedOutput: "4", isHidden: false },
      { input: "7 7 7 7 7 7 7", expectedOutput: "1", isHidden: true }
    ]
  },
  {
    title: "Edit Distance",
    description: "Given two strings word1 and word2, return the minimum number of operations required to convert word1 to word2. You have the following three operations permitted on a word: Insert a character, Delete a character, Replace a character.",
    topic: "dp",
    difficulty: "hard",
    examples: [{ input: "horse\nros", output: "3" }],
    testCases: [
      { input: "horse\nros", expectedOutput: "3", isHidden: false },
      { input: "intention\nexecution", expectedOutput: "5", isHidden: false }
    ]
  },

  // --- GRAPH ---
  {
    title: "Find the Town Judge",
    description: "In a town, there are n people labeled from 1 to n. There is a rumor that one of these people is secretly the town judge. The town judge trusts nobody. Everybody (except for the town judge) trusts the town judge. There is exactly one person that satisfies these properties. Return the label of the town judge if the town judge exists and can be identified, or return -1 otherwise. Input format: n\\ntrust_edges (e.g., 1 2 means 1 trusts 2).",
    topic: "graph",
    difficulty: "easy",
    examples: [{ input: "2\n1 2", output: "2" }],
    testCases: [
      { input: "2\n1 2", expectedOutput: "2", isHidden: false },
      { input: "3\n1 3\n2 3", expectedOutput: "3", isHidden: false },
      { input: "3\n1 3\n2 3\n3 1", expectedOutput: "-1", isHidden: true }
    ]
  },
  {
    title: "Course Schedule",
    description: "There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1. You are given an array prerequisites where prerequisites[i] = [ai, bi] indicates that you must take course bi first if you want to take course ai. Return true if you can finish all courses. Otherwise, return false.",
    topic: "graph",
    difficulty: "medium",
    examples: [{ input: "2\n1 0", output: "true" }],
    testCases: [
      { input: "2\n1 0", expectedOutput: "true", isHidden: false },
      { input: "2\n1 0\n0 1", expectedOutput: "false", isHidden: false }
    ]
  },
  {
    title: "Word Ladder",
    description: "A transformation sequence from word beginWord to word endWord using a dictionary wordList is a sequence of words beginWord -> s1 -> s2 -> ... -> sk such that: Every adjacent pair of words differs by a single letter. Every si for 1 <= i <= k is in wordList. sk == endWord. Given two words, beginWord and endWord, and a dictionary wordList, return the number of words in the shortest transformation sequence from beginWord to endWord, or 0 if no such sequence exists.",
    topic: "graph",
    difficulty: "hard",
    examples: [{ input: "hit\ncog\nhot dot dog lot log cog", output: "5" }],
    testCases: [
      { input: "hit\ncog\nhot dot dog lot log cog", expectedOutput: "5", isHidden: false },
      { input: "hit\ncog\nhot dot dog lot log", expectedOutput: "0", isHidden: false }
    ]
  },

  // --- STACK ---
  {
    title: "Valid Parentheses",
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    topic: "stack",
    difficulty: "easy",
    examples: [{ input: "()[]{}", output: "true" }],
    testCases: [
      { input: "()[]{}", expectedOutput: "true", isHidden: false },
      { input: "(]", expectedOutput: "false", isHidden: false },
      { input: "([)]", expectedOutput: "false", isHidden: true }
    ]
  },
  {
    title: "Daily Temperatures",
    description: "Given an array of integers temperatures represents the daily temperatures, return an array answer such that answer[i] is the number of days you have to wait after the ith day to get a warmer temperature. If there is no future day for which this is possible, keep answer[i] == 0 instead.",
    topic: "stack",
    difficulty: "medium",
    examples: [{ input: "73 74 75 71 69 72 76 73", output: "1 1 4 2 1 1 0 0" }],
    testCases: [
      { input: "73 74 75 71 69 72 76 73", expectedOutput: "1 1 4 2 1 1 0 0", isHidden: false },
      { input: "30 40 50 60", expectedOutput: "1 1 1 0", isHidden: false }
    ]
  },
  {
    title: "Largest Rectangle in Histogram",
    description: "Given an array of integers heights representing the histogram's bar height where the width of each bar is 1, return the area of the largest rectangle in the histogram.",
    topic: "stack",
    difficulty: "hard",
    examples: [{ input: "2 1 5 6 2 3", output: "10" }],
    testCases: [
      { input: "2 1 5 6 2 3", expectedOutput: "10", isHidden: false },
      { input: "2 4", expectedOutput: "4", isHidden: false }
    ]
  },

  // --- QUEUE ---
  {
    title: "Number of Students Unable to Eat Lunch",
    description: "You are given two integer arrays students and sandwiches where sandwiches[i] is the type of the ith sandwich in the stack (i = 0 is the top of the stack) and students[j] is the preference of the jth student in the initial queue (j = 0 is the front of the queue). Return the number of students that are unable to eat.",
    topic: "queue",
    difficulty: "easy",
    examples: [{ input: "1 1 0 0\n0 1 0 1", output: "0" }],
    testCases: [
      { input: "1 1 0 0\n0 1 0 1", expectedOutput: "0", isHidden: false },
      { input: "1 1 1 0 0 1\n1 0 0 0 1 1", expectedOutput: "3", isHidden: false }
    ]
  },
  {
    title: "Design Circular Queue",
    description: "Design your implementation of the circular queue. The circular queue is a linear data structure in which the operations are performed based on FIFO (First In First Out) principle and the last position is connected back to the first position to make a circle. Return space-separated results of operations.",
    topic: "queue",
    difficulty: "medium",
    examples: [{ input: "enQueue 3\nenQueue 4\nRear\nisFull\ndeQueue\nenQueue 4\nRear", output: "true true 4 false true true 4" }],
    testCases: [
      { input: "enQueue 1\nenQueue 2\nenQueue 3\nenQueue 4\nRear\nisFull\ndeQueue\nenQueue 4\nRear", expectedOutput: "true true true false 3 true true true 4", isHidden: false }
    ]
  },

  // --- LINKED LIST ---
  {
    title: "Middle of the Linked List",
    description: "Given the head of a singly linked list, return the middle node of the linked list. If there are two middle nodes, return the second middle node. Format: input array elements, output array elements from middle.",
    topic: "linkedlist",
    difficulty: "easy",
    examples: [{ input: "1 2 3 4 5", output: "3 4 5" }],
    testCases: [
      { input: "1 2 3 4 5", expectedOutput: "3 4 5", isHidden: false },
      { input: "1 2 3 4 5 6", expectedOutput: "4 5 6", isHidden: false }
    ]
  },
  {
    title: "Remove Nth Node From End of List",
    description: "Given the head of a linked list, remove the nth node from the end of the list and return its head. Format: list elements \\n n",
    topic: "linkedlist",
    difficulty: "medium",
    examples: [{ input: "1 2 3 4 5\n2", output: "1 2 3 5" }],
    testCases: [
      { input: "1 2 3 4 5\n2", expectedOutput: "1 2 3 5", isHidden: false },
      { input: "1\n1", expectedOutput: "", isHidden: false },
      { input: "1 2\n1", expectedOutput: "1", isHidden: true }
    ]
  },
  {
    title: "Merge k Sorted Lists",
    description: "You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it. Format: num_lists \\n list1 \\n list2...",
    topic: "linkedlist",
    difficulty: "hard",
    examples: [{ input: "3\n1 4 5\n1 3 4\n2 6", output: "1 1 2 3 4 4 5 6" }],
    testCases: [
      { input: "3\n1 4 5\n1 3 4\n2 6", expectedOutput: "1 1 2 3 4 4 5 6", isHidden: false },
      { input: "0", expectedOutput: "", isHidden: false }
    ]
  },

  // --- RECURSION ---
  {
    title: "Power of Two",
    description: "Given an integer n, return true if it is a power of two. Otherwise, return false. An integer n is a power of two, if there exists an integer x such that n == 2^x.",
    topic: "recursion",
    difficulty: "easy",
    examples: [{ input: "1", output: "true" }],
    testCases: [
      { input: "1", expectedOutput: "true", isHidden: false },
      { input: "16", expectedOutput: "true", isHidden: false },
      { input: "3", expectedOutput: "false", isHidden: false },
      { input: "0", expectedOutput: "false", isHidden: true }
    ]
  },
  {
    title: "Combinations",
    description: "Given two integers n and k, return all possible combinations of k numbers chosen from the range [1, n]. Return them in lexicographical order.",
    topic: "recursion",
    difficulty: "medium",
    examples: [{ input: "4\n2", output: "[1,2] [1,3] [1,4] [2,3] [2,4] [3,4]" }],
    testCases: [
      { input: "4\n2", expectedOutput: "[1,2] [1,3] [1,4] [2,3] [2,4] [3,4]", isHidden: false },
      { input: "1\n1", expectedOutput: "[1]", isHidden: false }
    ]
  },
  {
    title: "N-Queens",
    description: "The n-queens puzzle is the problem of placing n queens on an n x n chessboard such that no two queens attack each other. Return the number of distinct solutions to the n-queens puzzle.",
    topic: "recursion",
    difficulty: "hard",
    examples: [{ input: "4", output: "2" }],
    testCases: [
      { input: "4", expectedOutput: "2", isHidden: false },
      { input: "1", expectedOutput: "1", isHidden: false },
      { input: "8", expectedOutput: "92", isHidden: true }
    ]
  },

  // --- MATH ---
  {
    title: "Missing Number",
    description: "Given an array nums containing n distinct numbers in the range [0, n], return the only number in the range that is missing from the array.",
    topic: "math",
    difficulty: "easy",
    examples: [{ input: "3 0 1", output: "2" }],
    testCases: [
      { input: "3 0 1", expectedOutput: "2", isHidden: false },
      { input: "0 1", expectedOutput: "2", isHidden: false },
      { input: "9 6 4 2 3 5 7 0 1", expectedOutput: "8", isHidden: true }
    ]
  },
  {
    title: "Pow(x, n)",
    description: "Implement pow(x, n), which calculates x raised to the power n (i.e., x^n). Return the result rounded to 5 decimal places.",
    topic: "math",
    difficulty: "medium",
    examples: [{ input: "2.00000 10", output: "1024.00000" }],
    testCases: [
      { input: "2.00000 10", expectedOutput: "1024.00000", isHidden: false },
      { input: "2.10000 3", expectedOutput: "9.26100", isHidden: false },
      { input: "2.00000 -2", expectedOutput: "0.25000", isHidden: true }
    ]
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('Connected to MongoDB');
    await Problem.deleteMany({});
    await Problem.insertMany(problems);
    console.log(`Seeded ${problems.length} highly curated problems successfully`);
    process.exit();
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

seedDB();