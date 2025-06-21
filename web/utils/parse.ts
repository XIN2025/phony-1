export const parseMessage = (message: string) => {
  if (!message) return '';
  if (!message.includes('_')) {
    return message.charAt(0).toUpperCase() + message.slice(1).toLowerCase();
  }
  const parsedMessage = message
    ?.split('_')
    ?.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    ?.join(' ');
  return parsedMessage;
};
