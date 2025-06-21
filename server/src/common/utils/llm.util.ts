import { google } from '@ai-sdk/google';
import { ModelType } from '../enums/ModelType.enum';
import { openai } from '@ai-sdk/openai';
import { deepseek } from '@ai-sdk/deepseek';
import { generateText, LanguageModelV1, Message } from 'ai';
import { generateObject } from 'ai';
import { ZodSchema } from 'zod';

export const getLLM = (model: ModelType): LanguageModelV1 | null => {
  switch (model) {
    case ModelType.O3_MINI:
    case ModelType.O4_MINI:
    case ModelType.GPT_4O:
    case ModelType.GPT_4O_MINI:
      return openai(model);
    case ModelType.GPT_4_1:
      return openai(model);
    case ModelType.DEEPSEEK_CHAT:
    case ModelType.DEEPSEEK_REASONER:
      return deepseek(model);
    case ModelType.GEMINI_2_0_FLASH:
      return google(model);
    case ModelType.GEMINI_2_5_PRO:
      return google(model);
    default:
      return null;
  }
};

export async function generateObjectAI<T>({
  model,
  schema,
  messages,
  system,
  prompt,
  maxRetries,
}: {
  model: ModelType;
  schema: ZodSchema<T>;
  system?: string;
  messages?: Message[];
  prompt?: string;
  maxRetries?: number;
}) {
  const llm = getLLM(model);
  if (isSupportJsonOutput(model)) {
    const res = await generateObject({
      model: llm,
      schema,
      messages,
      system: system,
      prompt,
      maxRetries,
    });
    return res.object;
  } else {
    const res = await generateText({
      model: llm,
      messages,
      prompt,
      system: `${system}\nYou must respond in JSON format. do not include any other text.`,
      maxRetries,
    });
    return JSON.parse(res.text.replace('```json', '').replace('```', '')) as T;
  }
}

export function isSupportJsonOutput(model: ModelType) {
  switch (model) {
    case ModelType.DEEPSEEK_REASONER:
      return false;
    default:
      return true;
  }
}
