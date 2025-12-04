'use server';

/**
 * @fileOverview Dynamically adjusts quiz difficulty based on user performance.
 *
 * - adjustQuizDifficulty - A function to adjust the quiz difficulty based on the user's performance.
 * - AdjustQuizDifficultyInput - The input type for the adjustQuizDifficulty function.
 * - AdjustQuizDifficultyOutput - The return type for the adjustQuizDifficulty function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdjustQuizDifficultyInputSchema = z.object({
  userPerformance: z
    .number()
    .describe(
      'The user performance as a percentage (0-100), calculated as the percentage of correct answers in the last quiz set.'
    ),
  currentDifficulty: z
    .string()
    .describe(
      'The current difficulty level of the quiz set (e.g., Easy, Medium, Hard).'
    ),
});
export type AdjustQuizDifficultyInput = z.infer<typeof AdjustQuizDifficultyInputSchema>;

const AdjustQuizDifficultyOutputSchema = z.object({
  adjustedDifficulty: z
    .string()
    .describe(
      'The adjusted difficulty level of the quiz set based on the user performance (e.g., Easy, Medium, Hard).'
    ),
  reasoning: z
    .string()
    .describe(
      'The reasoning behind the adjusted difficulty level. It should explain why the difficulty was increased, decreased, or kept the same.'
    ),
});
export type AdjustQuizDifficultyOutput = z.infer<typeof AdjustQuizDifficultyOutputSchema>;

export async function adjustQuizDifficulty(input: AdjustQuizDifficultyInput): Promise<AdjustQuizDifficultyOutput> {
  return adjustQuizDifficultyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adjustQuizDifficultyPrompt',
  input: {schema: AdjustQuizDifficultyInputSchema},
  output: {schema: AdjustQuizDifficultyOutputSchema},
  prompt: `You are an AI quiz master who dynamically adjusts quiz difficulty to keep users challenged and engaged.

You will be provided with the user's performance in the last quiz set (as a percentage) and the current difficulty level of the quiz.
Based on this information, you will determine whether to increase, decrease, or keep the difficulty level the same.

Consider these factors:
- If the user's performance is consistently high (e.g., above 90%), increase the difficulty level to keep them challenged.
- If the user's performance is consistently low (e.g., below 60%), decrease the difficulty level to avoid frustration.
- If the user's performance is in the moderate range (e.g., 60-90%), keep the difficulty level the same to maintain a balance.

Here's the user's performance: {{{userPerformance}}}%
Current Difficulty: {{{currentDifficulty}}}

Output the adjusted difficulty level and a brief explanation of your reasoning. Follow the JSON schema.
`,
});

const adjustQuizDifficultyFlow = ai.defineFlow(
  {
    name: 'adjustQuizDifficultyFlow',
    inputSchema: AdjustQuizDifficultyInputSchema,
    outputSchema: AdjustQuizDifficultyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
