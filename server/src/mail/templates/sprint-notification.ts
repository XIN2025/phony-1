export const SPRINT_NOTIFICATION_TEMPLATE = `
<p style="font-size: 16px; line-height: 24px; color: #717a8a; margin: 0 0 20px;">
  Hello Team,
</p>
<h1 style="font-size: 20px; line-height: 28px; color: #3d3b3d; margin: 0 0 20px;">
  New Sprint Started! 🚀
</h1>
<p style="font-size: 16px; line-height: 24px; color: #717a8a; margin: 0 0 20px;">
  We're excited to announce that a new sprint has begun! Here are the key details:
</p>
<div style="background: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
  <div style="font-size: 14px; color: #6b7280;">
    <strong>Sprint Name:</strong> {{sprintName}}<br>
    <strong>Duration:</strong> {{startDate}} - {{endDate}}<br>
    <strong>Number of Tasks:</strong> {{taskCount}}
  </div>
</div>
<p style="font-size: 16px; line-height: 24px; color: #717a8a; margin: 0 0 20px;">
  Please review the attached document and familiarize yourself with the sprint goals and deliverables.
  Let's make this sprint a successful one! 💪
</p>
`;
