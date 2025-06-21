import { readFileSync } from 'fs';

export const prompts = {
  getMeetingSummaryPrompt: () => {
    try {
      const prompt = readFileSync('src/prompts/meeting-summary.md', 'utf-8');
      return prompt;
    } catch (error) {
      return undefined;
    }
  },
  getRoadmapPrompt: () => {
    const prompt = readFileSync('src/prompts/sprint-roadmap.md', 'utf-8');
    return prompt;
  },
  getProjectSummaryPrompt: () => {
    const prompt = readFileSync('src/prompts/project-summary.md', 'utf-8');
    return prompt;
  },
  getBugPrompt: () => {
    return `You are a helpful assistant that extracts information from feedback.
        You will be given a feedback that can be a images or direct text feedback.
        Your role will be extract the useful information from the feedback. The feedback can be a improvement suggestion, a bug report, a feature request, a question, error or a general comment.
        In summary use text formatting like **bold**, *italic*, \n for new lines, etc. when needed to make the text more readable.
        The output should be in JSON format. Like below example:
      {
          "title": "string",  // A short title summarizing the main point of the feedback
          "summary": "string"  // A concise summary explaining the feedback in detail
        }
        Ensure that the extracted information is clear, concise, and relevant.`;
  },
  getTasksFromSummaryPrompt: () => {
    const systemPrompt = readFileSync(
      'src/prompts/tasks-from-summary.md',
      'utf8',
    );
    return systemPrompt;
  },
  getGenerateTasksPrompt: () => {
    const systemPrompt = readFileSync(
      'src/prompts/requirement-prompt.md',
      'utf-8',
    );
    return systemPrompt;
  },
  getStoryToPromptPrompt: () => {
    const systemPrompt = readFileSync(
      'src/prompts/story-to-prompt.md',
      'utf-8',
    );
    return systemPrompt;
  },
  getAcceptanceCriteriaPrompt: () => {
    const systemPrompt = readFileSync(
      'src/prompts/acceptance-criteria.md',
      'utf-8',
    );
    return systemPrompt;
  },
  getFilteredTranscriptPrompt: () => {
    const systemPrompt = readFileSync(
      'src/prompts/filtered-transcript.md',
      'utf-8',
    );
    return systemPrompt;
  },
  getGenerateStoriesPrompt: () => {
    const systemPrompt = readFileSync('src/prompts/stories-prompt.md', 'utf-8');
    return systemPrompt;
  },
  getChatbotPrompt: (projectData?: string) => {
    const systemPrompt = readFileSync(
      'src/prompts/v1/chatbot-prompt.md',
      'utf-8',
    );
    return systemPrompt.replace('{{projectData}}', projectData);
  },
};
