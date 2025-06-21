export const BUG_NOTIFICATION_TEMPLATE = `
<h1 style="font-size: 20px; line-height: 28px; color: #3d3b3d; margin: 0 0 20px;">
  🐛 New Bug Reported: {{title}}
</h1>
<p style="font-size: 16px; line-height: 24px; color: #717a8a; margin: 0 0 20px;">
  A new bug has been reported in <strong>{{projectName}}</strong> by {{reporterName}} on {{reportedDate}}.
</p>
<p style="font-size: 16px; line-height: 24px; color: #717a8a; margin: 0 0 20px;">
  <strong>Summary:</strong><br>
  {{summary}}
</p>
<p style="font-size: 16px; line-height: 24px; color: #717a8a; margin: 0 0 20px;">
  <strong>Additional Details:</strong><br>
  {{textFeedback}}
</p>
<div style="margin-bottom: 20px; text-align: left">
  <a href="{{bugLink}}" style="border-radius: 8px; display: inline-block; font-size: 14px; font-weight: bold; line-height: 24px; padding: 8px 24px; text-align: center; text-decoration: none; color: #ffffff; background-color: #dc2626;">View Bug Details</a>
</div>
<p style="font-size: 12px; color: #999; margin-top: 20px;">
  You're receiving this notification because you're a team member of this project.
</p>
`;
