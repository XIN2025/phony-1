import Chat from '@/components/chatbot/Chat';
import React from 'react';

const Page = async (props: { params: Promise<{ name: string }> }) => {
  const params = await props.params;
  return <Chat projectName={params.name} />;
};

export default Page;
