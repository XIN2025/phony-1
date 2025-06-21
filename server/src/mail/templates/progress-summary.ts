export const PROGRESS_SUMMARY_TEMPLATE = `
<p style="font-size: 16px; line-height: 24px; color: #717a8a; margin: 0 0 20px;">
  Hi {{recipientName}},
</p>
<h1 style="font-size: 20px; line-height: 28px; color: #3d3b3d; margin: 0 0 20px;">
  📈 Daily Progress Summary
</h1>
<p style="font-size: 16px; line-height: 24px; color: #717a8a; margin: 0 0 20px;">
  Great progress today! Here's what was completed in <strong>{{projectName}}</strong>:
</p>
<div style="border-radius: 8px;">
  <div style="font-size: 16px; font-weight: 600; color: #059669; margin-bottom: 16px;">
    ✅ {{completedCount}} Stories Completed
  </div>
  <div style="space-y: 12px;">
    {{#each stories}}
    <div style="background: #ffffff; padding: 16px; border-radius: 6px; border: 1px solid #e5e7eb; margin-bottom: 12px;">
      <div style="font-size: 16px; font-weight: 500; color: #111827; margin-bottom: 8px;">{{title}}</div>
      <div style="font-size: 14px; color: #6b7280;">
        <strong>Priority:</strong> {{priority}} | <strong>Assigned to:</strong> {{assignedTo}}
      </div>
      {{#if description}}
      <div style="font-size: 14px; color: #6b7280; margin-top: 8px; padding-top: 8px; border-top: 1px solid #f3f4f6;">
        {{description}}
      </div>
      {{/if}}
    </div>
    {{/each}}
  </div>
</div>
<div style="margin: 24px 0; text-align: center;">
  <a href="{{projectLink}}" style="border-radius: 8px; display: inline-block; font-size: 14px; font-weight: bold; line-height: 24px; padding: 12px 32px; text-align: center; text-decoration: none; color: #ffffff; background-color: #444bbc;">View Project Dashboard</a>
</div>
<p style="font-size: 14px; line-height: 20px; color: #9ca3af; margin: 20px 0 0;">
  Keep up the momentum! 🚀
</p>
<p style="font-size: 12px; color: #999; margin-top: 20px;">
  Can't click the button? Copy and paste this link into your browser:
  <br>
  <a href="{{projectLink}}" style="color: #444cbb; text-decoration: none;">{{projectLink}}</a>
</p>
`;
