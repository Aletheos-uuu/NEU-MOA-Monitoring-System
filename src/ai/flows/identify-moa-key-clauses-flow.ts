'use server';
/**
 * @fileOverview This file defines a Genkit flow for identifying key clauses, actionable items, and obligations
 * from MOA document text, designed for admin and faculty users.
 *
 * - identifyMoaKeyClauses - A function that processes MOA document text to extract key information.
 * - IdentifyMoaKeyClausesInput - The input type for the identifyMoaKeyClauses function.
 * - IdentifyMoaKeyClausesOutput - The return type for the identifyMoaKeyClauses function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const IdentifyMoaKeyClausesInputSchema = z.object({
  moaDocumentText: z.string().describe('The full text content of the MOA document.'),
});
export type IdentifyMoaKeyClausesInput = z.infer<typeof IdentifyMoaKeyClausesInputSchema>;

const IdentifyMoaKeyClausesOutputSchema = z.object({
  keyClauses: z.array(z.string()).describe('A list of significant key clauses identified in the MOA document.'),
  actionableItems: z.array(z.string()).describe('A list of actionable items or tasks specified in the MOA document.'),
  obligations: z.array(z.string()).describe('A list of obligations for the parties involved as described in the MOA document.'),
});
export type IdentifyMoaKeyClausesOutput = z.infer<typeof IdentifyMoaKeyClausesOutputSchema>;

export async function identifyMoaKeyClauses(input: IdentifyMoaKeyClausesInput): Promise<IdentifyMoaKeyClausesOutput> {
  return identifyMoaKeyClausesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyMoaKeyClausesPrompt',
  input: { schema: IdentifyMoaKeyClausesInputSchema },
  output: { schema: IdentifyMoaKeyClausesOutputSchema },
  prompt: `You are an expert legal assistant specializing in Memorandums of Agreement (MOAs). Your task is to analyze the provided MOA document text and extract key information.

Identify the following:
1.  **Key Clauses**: The most important or legally significant clauses.
2.  **Actionable Items**: Any specific tasks, steps, or actions that need to be performed by any party.
3.  **Obligations**: Any duties, responsibilities, or commitments that parties are bound to fulfill.

Present the extracted information in a structured JSON format as described by the output schema.

MOA Document Text:
{{{moaDocumentText}}}`,
});

const identifyMoaKeyClausesFlow = ai.defineFlow(
  {
    name: 'identifyMoaKeyClausesFlow',
    inputSchema: IdentifyMoaKeyClausesInputSchema,
    outputSchema: IdentifyMoaKeyClausesOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to identify key clauses, actionable items, and obligations.');
    }
    return output;
  }
);
