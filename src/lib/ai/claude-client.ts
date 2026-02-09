// Anthropic Claude API client wrapper

import Anthropic from '@anthropic-ai/sdk';
import { logger } from '@/lib/utils/logger';
import { AIError } from '@/lib/utils/errors';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ClaudeOptions {
  temperature?: number;
  maxTokens?: number;
}

export async function callClaude(
  prompt: string,
  options: ClaudeOptions = {}
): Promise<string> {
  const {
    temperature = 0.3,
    maxTokens = 4096,
  } = options;

  try {
    logger.debug('Calling Claude API...');

    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: maxTokens,
      temperature,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = response.content[0];

    if (content.type !== 'text') {
      throw new AIError('Unexpected response type from Claude', 'INVALID_RESPONSE');
    }

    return content.text;
  } catch (error: any) {
    logger.error('Claude API error:', error);

    if (error.status === 429) {
      throw new AIError('Rate limit exceeded', 'RATE_LIMIT');
    }

    if (error.status === 529) {
      throw new AIError('Service overloaded', 'OVERLOADED');
    }

    throw new AIError(
      error.message || 'Failed to call Claude API',
      'API_ERROR'
    );
  }
}

export async function callClaudeJSON<T = any>(
  prompt: string,
  options: ClaudeOptions = {}
): Promise<T> {
  const response = await callClaude(prompt, options);

  try {
    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = response.trim();

    // Remove markdown code blocks if present
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```\n?/g, '').replace(/```\n?$/g, '');
    }

    return JSON.parse(jsonStr);
  } catch (error) {
    logger.error('Failed to parse Claude response as JSON:', response);
    throw new AIError('Invalid JSON response from Claude', 'INVALID_JSON');
  }
}
