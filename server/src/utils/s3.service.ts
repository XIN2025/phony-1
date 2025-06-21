import { Injectable, Logger } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly logger = new Logger(S3Service.name);
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
  async uploadFile(
    file: Express.Multer.File,
    key: string,
  ): Promise<{ key: string; url: string }> {
    this.logger.debug(`Uploading the file to ${key}`);
    try {
      const uploadCommand = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3Client.send(uploadCommand);

      const url = this.getFileUrl(key);
      this.logger.debug(`Uploaded to S3: ${url}`);
      return { key, url };
    } catch (error) {
      this.logger.error(`Error uploading to S3: ${error}`);
      throw new Error('Failed to upload audio to S3');
    }
  }

  getFileUrl(key: string): string {
    return `https://${this.bucket}.s3.${process.env.NEXT_AWS_REGION || 'ap-south-1'}.amazonaws.com/${key}`;
  }
}
