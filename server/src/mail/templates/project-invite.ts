const EXISTING_USER_INVITATION_TEMPLATE = `
<p style="font-size: 16px; line-height: 24px; color: #717a8a; margin: 0 0 20px;">
  Hi {{recipientName}},
</p>
<h1 style="font-size: 20px; line-height: 28px; color: #3d3b3d; margin: 0 0 20px;">
  🚀 Project Invitation
</h1>
<p style="font-size: 16px; line-height: 24px; color: #717a8a; margin: 0 0 20px;">
  <strong>{{senderName}}</strong> has invited you to join project <strong>{{projectName}}</strong> on Heizen as a <strong>{{role}}</strong>.
</p>
<div style="margin-bottom: 20px; text-align: left">
  <a href="{{projectLink}}" style="border-radius: 8px; display: inline-block; font-size: 14px; font-weight: bold; line-height: 24px; padding: 8px 24px; text-align: center; text-decoration: none; color: #ffffff; background-color: #444bbc;">View Project</a>
</div>
<p style="font-size: 16px; line-height: 24px; color: #717a8a; margin: 0 0 20px;">
  Can't click the button? Copy and paste this link into your browser:
  <br>
  <a href="{{projectLink}}" style="color: #444cbb; text-decoration: none;">{{projectLink}}</a>
</p>
<p style="font-size: 12px; color: #999; margin-top: 20px;">
  This link will expire in 24 hours. If you did not request this, please ignore this email.
</p>
`;

const NEW_USER_INVITATION_TEMPLATE = `
<p style="font-size: 16px; line-height: 24px; color: #717a8a; margin: 0 0 20px;">
  Hello!
</p>
<h1 style="font-size: 20px; line-height: 28px; color: #3d3b3d; margin: 0 0 20px;">
  👋 Join Heizen
</h1>
<p style="font-size: 16px; line-height: 24px; color: #717a8a; margin: 0 0 20px;">
  <strong>{{senderName}}</strong> has invited you to collaborate on project <strong>{{projectName}}</strong> as a <strong>{{role}}</strong>.
</p>
<div style="margin-bottom: 20px; text-align: left">
  <a href="{{signupLink}}" style="border-radius: 8px; display: inline-block; font-size: 14px; font-weight: bold; line-height: 24px; padding: 8px 24px; text-align: center; text-decoration: none; color: #ffffff; background-color: #444bbc;">Join Project</a>
</div>
<p style="font-size: 16px; line-height: 24px; color: #717a8a; margin: 0 0 20px;">
  Can't click the button? Copy and paste this link into your browser:
  <br>
  <a href="{{signupLink}}" style="color: #444cbb; text-decoration: none;">{{signupLink}}</a>
</p>
<p style="font-size: 12px; color: #999; margin-top: 20px;">
  This link will expire in 24 hours. If you did not request this, please ignore this email.
</p>
`;

export { EXISTING_USER_INVITATION_TEMPLATE, NEW_USER_INVITATION_TEMPLATE };
