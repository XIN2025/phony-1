export const COMMENT_NOTIFICATION_TEMPLATE = `
  <div style="text-align: center; margin-bottom: 20px;">
    <h1 style="font-size: 20px; line-height: 28px; color: #3d3b3d; margin: 0 0 10px;">💬 New Comment</h1>
    <p style="font-size: 16px; line-height: 24px; color: #717a8a; margin: 0;">Someone commented on your {{type}}!</p>
  </div>

  <div>
    <p style="font-size: 16px; line-height: 24px; color: #717a8a; margin: 0 0 20px;">
      <strong>{{commenterName}}</strong> left a comment on your {{type}}: <strong>{{title}}</strong>
    </p>

    <div style="margin: 0 0 20px; background-color: #f8fafc; border-left: 4px solid #444bbc; padding: 16px; border-radius: 4px;">
      <p style="font-size: 14px; line-height: 20px; color: #64748b; margin: 0 0 8px; text-transform: uppercase; font-weight: 600;">
        Comment:
      </p>
      <p style="font-size: 16px; line-height: 24px; color: #334155; margin: 0;">
        {{content}}
      </p>
    </div>

    <div style="margin-bottom: 20px; text-align: left">
      <a href="{{link}}" style="border-radius: 6px; display: inline-block; font-size: 14px; font-weight: 600; line-height: 24px; padding: 12px 24px; text-align: center; text-decoration: none; color: #ffffff; background-color: #444bbc; box-shadow: 0 2px 4px rgba(68, 75, 188, 0.2);">View {{type}}</a>
    </div>

    <p style="font-size: 12px; color: #64748b; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
      You're receiving this notification because you created this {{type}}.
    </p>
  </div>
`;
