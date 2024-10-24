import {
  SendMessageCommand,
  SendMessageCommandOutput,
  SQSClient,
} from '@aws-sdk/client-sqs';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SqsProducerService {
  private readonly logger = new Logger(SqsProducerService.name);
  private readonly sqsClient: SQSClient;

  public constructor() {
    this.sqsClient = new SQSClient();
  }

  public sendObject<T>(queueUrl: string, bodyObject: T) {
    return this.send({ queueUrl, body: JSON.stringify(bodyObject) });
  }

  public sendObjectFifo<T>(
    queueUrl: string,
    bodyObject: T,
    messageGroupId: string
  ) {
    return this.send({
      queueUrl,
      body: JSON.stringify(bodyObject),
      messageGroupId,
    });
  }

  private send(params: {
    queueUrl: string;
    body: string;
    messageGroupId?: string;
  }): Promise<SendMessageCommandOutput> {
    this.logger.log(`Sending message to queue ${params.queueUrl}`);

    const sendMessageCommand = new SendMessageCommand({
      QueueUrl: params.queueUrl,
      MessageBody: params.body,
      MessageGroupId: params.messageGroupId,
    });

    try {
      return this.sqsClient.send(sendMessageCommand);
    } catch (e) {
      this.logger.error(
        `Fail to send SQS message to queue ${params.queueUrl}`,
        e
      );
      throw e;
    }
  }
}
