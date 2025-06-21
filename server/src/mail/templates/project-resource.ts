export const PROJECT_RESOURCE_ADDED_TEMPLATE = `
<p style="font-size: 16px; line-height: 24px; color: #717a8a; margin: 0 0 20px;">
  Hi {{recipientName}},
</p>
<h1 style="font-size: 20px; line-height: 28px; color: #3d3b3d; margin: 0 0 20px;">
  📚 New Project Resource
</h1>
<p style="font-size: 16px; line-height: 24px; color: #717a8a; margin: 0 0 20px;">
  A new resource has been added to your project <strong>{{projectName}}</strong>:
</p>
<div style="background: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
  <div style="font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 12px;">{{resourceName}}</div>
  <div style="font-size: 14px; color: #6b7280;">
    <strong>Type:</strong> {{resourceType}}<br>
  </div>
</div>
<div style="margin-bottom: 20px; text-align: left">
  <a href="{{resourceUrl}}" style="border-radius: 8px; display: inline-block; font-size: 14px; font-weight: bold; line-height: 24px; padding: 8px 24px; text-align: center; text-decoration: none; color: #ffffff; background-color: #444bbc;">View Resource</a>
</div>
<p style="font-size: 16px; line-height: 24px; color: #717a8a; margin: 0 0 20px;">
  Can't click the button? Copy and paste this link into your browser:
  <br>
  <a href="{{resourceUrl}}" style="color: #444cbb; text-decoration: none;">{{resourceUrl}}</a>
</p>
`;

export const PROJECT_RESOURCE_MEETING_REMINDER_TEMPLATE = `
<p style="font-size: 16px; line-height: 24px; color: #717a8a; margin: 0 0 20px;">
  Hi {{recipientName}},
</p>
<h1 style="font-size: 20px; line-height: 28px; color: #3d3b3d; margin: 0 0 20px;">
  🎥 Meeting Reminder
</h1>
<p style="font-size: 16px; line-height: 24px; color: #717a8a; margin: 0 0 20px;">
  This is a reminder for your upcoming meeting in project <strong>{{projectName}}</strong>
</p>
<div style="background: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
  <div style="font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 12px;">{{meetingName}}</div>
  <div style="font-size: 14px; color: #6b7280;">
    <strong>Meeting Link:</strong> <a href="{{meetingUrl}}" style="color: #444cbb; text-decoration: none;">{{meetingUrl}}</a><br>
    <strong>Time:</strong> {{meetingTime}}
  </div>
  <div style="font-size: 14px; color: #92400e; margin-top: 12px;">
    ⚠️ Important: Please remember to record this meeting!
  </div>
</div>
<div style="margin-bottom: 20px; text-align: left">
  <a href="{{meetingUrl}}" style="border-radius: 8px; display: inline-block; font-size: 14px; font-weight: bold; line-height: 24px; padding: 8px 24px; text-align: center; text-decoration: none; color: #ffffff; background-color: #444bbc;">Join Meeting</a>
</div>
<p style="font-size: 16px; line-height: 24px; color: #717a8a; margin: 0 0 20px;">
  Can't click the button? Copy and paste this link into your browser:
  <br>
  <a href="{{meetingUrl}}" style="color: #444cbb; text-decoration: none;">{{meetingUrl}}</a>
</p>
`;
