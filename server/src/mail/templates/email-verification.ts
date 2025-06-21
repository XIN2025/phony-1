export const EMAIL_VERIFICATION_TEMPLATE = `
<p style="font-size: 16px; line-height: 24px; color: #717a8a; margin: 0 0 20px;">
  Hi {{firstName}},
</p>
<h1 style="font-size: 20px; line-height: 28px; color: #3d3b3d; margin: 0 0 20px;">
  Welcome to Heizen!
</h1>
<p style="font-size: 16px; line-height: 24px; color: #717a8a; margin: 0 0 20px;">
  Thank you for signing up. Please verify your email address by clicking the button below:
</p>
<div style="margin-bottom: 20px; text-align: left">
  <a href="{{verificationLink}}" style="border-radius: 8px; display: inline-block; font-size: 14px; font-weight: bold; line-height: 24px; padding: 8px 24px; text-align: center; text-decoration: none; color: #ffffff; background-color: #444bbc;">Verify Email</a>
</div>
<p style="font-size: 16px; line-height: 24px; color: #717a8a; margin: 0 0 20px;">
  If the button above doesn't work, you can also use the following link:
  <br>
  <a href="{{verificationLink}}" style="color: #444cbb; text-decoration: none;">{{verificationLink}}</a>
</p>
<p style="font-size: 12px; color: #999; margin-top: 20px;">
  This link will expire in 24 hours. If you did not request this, please ignore this email.
</p>
`;
