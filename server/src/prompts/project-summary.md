Given a list of tasks with their associated user stories in the format:

- Task: Task Title (Type)
  Description: Task Description
  User Stories:
  - Story Title (Status): Story Description
    - Acceptance Criteria 1 (Status)
    - Acceptance Criteria 2 (Status)

Generate a sprint summary report that:

1. 📊 Groups and Analyzes:

   - Extract key tasks and their implemented features
   - Group related user stories by task
   - Identify main acceptance criteria met

2. 📝 Create Overall Summary:

   - High-level completion status and major achievements
   - Format as an engaging introduction with emojis
   - Written in first person from admin's perspective

3. 📱 Format Output as JSON:

   ```json
   {
     "summary": "{{ADMIN_NAME}} here ✌️\n[Overall sprint summary with major achievements]",
     "sections": [
       {
         "title": "🚀(Relevant Emoji) [Task Category/Feature Name]",
         "paragraphs": [
           "paragraph about implementation and benefits",
           "Additional information or instructions if applicable"
         ]
       }
       // Additional sections for each major task/feature
     ]
   }
   ```

4. ✨ Content Requirements:

   - Write each summary in detail, not just repeating task descriptions
   - Use engaging language with relevant emojis
   - Focus on benefits and achievements rather than listing tasks
   - Include links or instructions where appropriate

5. Please only return the formatted JSON with no additional text.

Example Output Format:

```json
{
  "summary": "Aman Arora here ✌️ \nThis Sprint was an incredibly busy sprint - here's what we've been up to.\nLast month's updates include: \nThe new and improved Heizen Mobile App, Building iOS & Android apps on Heizen (from the Mobile App if you'd like!), Agent v2 🧠, Claude 3.7 Sonnet support, and much, much more!",
  "sections": [
    {
      "title": "📱 Build Anywhere, Anytime",
      "paragraphs": [
        "We've completely rebuilt Heizen Mobile from the ground up! Our new mobile app delivers a faster, more intuitive coding experience on the go.",
        "Head to website to give it a shot. You can check out a full walkthrough here."
      ]
    },
    {
      "title": "📱 Build apps for your phone",
      "paragraphs": [
        "Heizen now supports iOS and Android app creation thanks to React Native and Expo.",
        "This includes: enhanced iOS and Android development capabilities, integrated mobile preview and debugging tools, and streamlined app store deployment via Expo EAS.",
        "Check out our tutorial further down to get started!"
      ]
    },
    {
      "title": "💪 Agent and Assistant",
      "paragraphs": [
        "Assistant now supports Claude Sonnet 3.7 as the default model in \"Advanced\" mode, allowing you to build with the latest & greatest models."
      ]
    }
  ]
}
```
