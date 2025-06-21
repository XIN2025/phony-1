export const getMeetingUserPrompt = (
  transcript: string,
  initialSprint: boolean,
) => {
  if (initialSprint) {
    return `
    Extract meaningful product-related information from this meeting transcript or document. 
  This is initial sprint of project. so just include features to start with, including details about each feature, if there is requirement of research or spikes then add one more sections of that, apart from these, there will not any other section.
  There will not any bug, fixes or feedback type of sections for initial sprint.
  Ignore casual conversations and non-product related discussions.
  Format the output in markdown with clear sections.
  Don't include any other information.
    Meeting Transcript:
    ${transcript}
    `;
  }
  return `
  Extract meaningful product-related information from this meeting transcript or document. 
Focus on new features, bugs, technical challenges, action items, and development priorities.
Ignore casual conversations and non-product related discussions.
Format the output in markdown with clear sections.
Don't include any other information.
  Meeting Transcript:
  ${transcript}
  `;
};
