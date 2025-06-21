import { NextRequest, NextResponse } from 'next/server';
import { AWSService } from '@/services/aws.api';
import { authOptions } from '@/auth';
import { getServerSession } from 'next-auth';
export const POST = async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string;
    const awsService = new AWSService();
    const { url } = await awsService.uploadFile(file, folder || 'wiki');
    return NextResponse.json({ url });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
};
