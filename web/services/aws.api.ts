import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

export class AWSService {
  private s3Client: S3Client;
  private bucket: string;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.NEXT_AWS_REGION || 'ap-south-1',
      credentials: {
        accessKeyId: process.env.NEXT_AWS_S3_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.NEXT_AWS_S3_SECRET_ACCESS_KEY || '',
      },
    });
    this.bucket = process.env.NEXT_AWS_S3_BUCKET || '';
  }

  async uploadAudio(audioBlob: Blob, userId: string): Promise<{ key: string; url: string }> {
    const timestamp = new Date().getTime();
    const key = `recordings/${userId}/${timestamp}.mp3`;

    try {
      const uploadCommand = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: Buffer.from(await audioBlob.arrayBuffer()),
        ContentType: audioBlob.type,
      });

      await this.s3Client.send(uploadCommand);

      const url = `https://${this.bucket}.s3.${process.env.NEXT_AWS_REGION || 'ap-south-1'}.amazonaws.com/${key}`;
      console.log('Uploaded to S3:', url);
      return { key, url };
    } catch (error) {
      console.error('Error uploading to S3:', error);
      throw new Error('Failed to upload audio to S3');
    }
  }

  async uploadFile(file: File, folder: string): Promise<{ key: string; url: string }> {
    const timestamp = new Date().getTime();
    const key = `${folder}/${timestamp}.${file.name}`;

    try {
      const uploadCommand = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: Buffer.from(await file.arrayBuffer()),
        ContentType: file.type,
      });

      await this.s3Client.send(uploadCommand);

      const url = `https://${this.bucket}.s3.${process.env.NEXT_AWS_REGION || 'ap-south-1'}.amazonaws.com/${key}`;
      console.log('Uploaded to S3:', url);
      return { key, url };
    } catch (error) {
      console.error('Error uploading to S3:', error);
      throw new Error('Failed to upload file to S3');
    }
  }
}
