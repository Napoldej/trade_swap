import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@Injectable()
export class S3Service {
  private client: S3Client | null = null;
  private readonly bucket: string;
  private readonly region: string;

  constructor() {
    this.bucket = process.env.AWS_BUCKET_NAME ?? '';
    this.region = process.env.AWS_BUCKET_REGION ?? '';

    if (this.bucket && this.region && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      this.client = new S3Client({
        region: this.region,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      });
    }
  }

  private getClient(): S3Client {
    if (!this.client) {
      throw new InternalServerErrorException('S3 is not configured. Set AWS_BUCKET_NAME, AWS_BUCKET_REGION, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY.');
    }
    return this.client;
  }

  async uploadFile(file: Express.Multer.File, folder = 'items'): Promise<string> {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const key = `${folder}/${uuidv4()}${ext}`;

    try {
      await this.getClient().send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );
    } catch (err) {
      throw new InternalServerErrorException('Failed to upload image to S3');
    }

    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  async deleteFile(url: string): Promise<void> {
    try {
      const key = url.split('.amazonaws.com/')[1];
      if (!key) return;
      await this.getClient().send(
        new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
      );
    } catch {
      // Best effort — don't throw if delete fails
    }
  }
}
