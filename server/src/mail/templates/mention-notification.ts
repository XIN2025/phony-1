export const MENTION_NOTIFICATION_TEMPLATE = `
  <div style="text-align: center; margin-bottom: 20px;">
    <h1 style="font-size: 20px; line-height: 28px; color: #3d3b3d; margin: 0 0 10px;">🔔 New Mention</h1>
    <p style="font-size: 16px; line-height: 24px; color: #717a8a; margin: 0;">You were mentioned in a comment!</p>
  </div>

  <div>
    <p style="font-size: 16px; line-height: 24px; color: #717a8a; margin: 0 0 20px;">
      <strong>{{mentionerName}}</strong> mentioned you in a comment on the {{type}}: <strong>{{title}}</strong>
    </p>

    <div style="margin: 0 0 20px;">
      <p style="font-size: 16px; line-height: 24px; color: #717a8a; margin: 0;">
        {{content}}
      </p>
    </div>

    <div style="margin-bottom: 20px; text-align: left">
      <a href="{{link}}" style="border-radius: 4px; display: inline-block; font-size: 14px; font-weight: bold; line-height: 24px; padding: 12px 24px; text-align: center; text-decoration: none; color: #ffffff; background-color: #444bbc;">View Comment</a>
    </div>
  </div>
`;
