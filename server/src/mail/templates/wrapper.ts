export const emailTemplateWrapper = (content: string) => `
<table style="border-collapse: collapse; table-layout: fixed; width: 100%; background-color: #fff;" cellpadding="0" cellspacing="0">
  <tr>
    <td>
      <div style="margin: 0 auto; max-width: 600px; min-width: 320px; width: 100%">
        <div style="font-size: 26px; line-height: 32px; margin-top: 16px; margin-bottom: 24px; color: #41637e; text-align: center;">
          <a href="https://heizen.work" style="text-decoration: none; color: #41637e">
            <img src="https://d2iyl9s54la9ej.cloudfront.net/heizen.png" alt="Logo" style="display: block; height: auto; width: 100%; max-width: 120px; margin: 0 auto; border: 0; border-radius: 8px;" />
          </a>
        </div>
      </div>
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif, 'Courier New', monospace; line-height: 1.6; color: #000; max-width: 600px; margin: 0 auto; padding: 20px 5px;">
        <div style="background: #f9f9f9; border-radius: 8px; padding: 24px; border: 1px solid #eee;">
          ${content}
        </div>
      </div>
      
      <!-- Footer -->
      <div style="margin: 0 auto; max-width: 600px; min-width: 320px; width: 100%; background-color: #ffffff;">
        <div style="padding: 20px; text-align: center">
          <div style="padding-top: 8px">
            <a href="https://x.com/opengigofficial" style="text-decoration: none; display: inline-block; border-radius: 50%; width: 24px; height: 24px; background-color: #7f7f7f; margin-right: 4px;">
              <img src="https://i4.createsend1.com/static/eb/master/13-the-blueprint-3/images/socialmedia/twitter-white-small.png" alt="Twitter" style="border: 0; width: 100%; height: 100%" />
            </a>
            <a href="https://www.youtube.com/@opengig2024" style="text-decoration: none; display: inline-block; border-radius: 50%; width: 24px; height: 24px; background-color: #7f7f7f; margin-right: 4px;">
              <img src="https://i6.createsend1.com/static/eb/master/13-the-blueprint-3/images/socialmedia/youtube-white-small.png" alt="YouTube" style="border: 0; width: 100%; height: 100%" />
            </a>
            <a href="https://www.linkedin.com/company/opengig" style="text-decoration: none; display: inline-block; border-radius: 50%; width: 24px; height: 24px; background-color: #7f7f7f;">
              <img src="https://i2.createsend1.com/static/eb/master/13-the-blueprint-3/images/socialmedia/linkedin-white-small.png" alt="LinkedIn" style="border: 0; width: 100%; height: 100%" />
            </a>
          </div>
          <div style="font-size: 12px; line-height: 19px; color: #999; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin-top: 10px;">
            <p style="margin: 0">Heizen Inc.</p>
            <p style="margin: 0">
              We Build and Launch Fully Functional Enterprise-Grade AI Apps.
            </p>
            <p style="margin: 0">
              <a href="https://heizen.work" style="text-decoration: underline; color: #999">heizen.work</a>
              |
              <a href="https://build.opengig.work/unsubscribe" style="text-decoration: underline; color: #999">Unsubscribe</a>
            </p>
          </div>
        </div>
      </div>
    </td>
  </tr>
</table>
`;
