export const STORY_ASSIGNED_TEMPLATE = `
<p style="font-size: 16px; line-height: 24px; color: #717a8a; margin: 0 0 20px;">
  Hi {{recipientName}},
</p>
<h1 style="font-size: 20px; line-height: 28px; color: #3d3b3d; margin: 0 0 20px;">
  📋 New Story Assignment
</h1>
<p style="font-size: 16px; line-height: 24px; color: #717a8a; margin: 0 0 20px;">
  A new story has been assigned to you in <strong>{{projectName}}</strong>:
</p>
<div style="background: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
  <div style="font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 12px;">{{storyTitle}}</div>
  <div style="font-size: 14px; color: #6b7280;">
    <strong>Priority:</strong> {{priority}}<br>
    <strong>Description:</strong> {{storyDescription}}
  </div>
</div>
<div style="margin-bottom: 20px; text-align: left">
  <a href="{{projectLink}}" style="border-radius: 8px; display: inline-block; font-size: 14px; font-weight: bold; line-height: 24px; padding: 8px 24px; text-align: center; text-decoration: none; color: #ffffff; background-color: #444bbc;">View Story Details</a>
</div>
<p style="font-size: 16px; line-height: 24px; color: #717a8a; margin: 0 0 20px;">
  This story is marked as <strong>{{priority}}</strong> priority. Please review the details and update the status accordingly.
</p>
<p style="font-size: 12px; color: #999; margin-top: 20px;">
  Can't click the button? Copy and paste this link into your browser:
  <br>
  <a href="{{projectLink}}" style="color: #444cbb; text-decoration: none;">{{projectLink}}</a>
</p>
`;
