export const LinkifyText = ({ text, className }: { text: string; className?: string }) => {
  if (!text) return null;

  const parseTextToHTML = (text: string) => {
    const urlRegex = /(\bhttps?:\/\/[^\s]+|\bwww\.[^\s]+)/gi;
    const parsedText = text.replace(urlRegex, (url) => {
      const href = url.startsWith('http') ? url : `https://${url}`;
      return `<a href="${href}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });
    return { __html: parsedText };
  };

  return (
    <div
      dangerouslySetInnerHTML={parseTextToHTML(text)}
      className={`[&>a]:text-blue-500 ${className}`}
    />
  );
};
