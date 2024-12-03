// utils/dynamodb.ts

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

const region = process.env.APP_REGION;
const accessKeyId = process.env.APP_ACCESS_KEY_ID;
const secretAccessKey = process.env.APP_SECRET_ACCESS_KEY;

if (!region) {
    throw new Error('Missing required AWS configuration environment variable: APP_REGION.');
}
if (!accessKeyId) {
    throw new Error('Missing required AWS configuration environment variable: APP_ACCESS_KEY_ID.');
}
if (!secretAccessKey) {
    throw new Error('Missing required AWS configuration environment variable: APP_SECRET_ACCESS_KEY.');
}

const client = new DynamoDBClient({
    region,
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
});

const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;

export type UserMetadata = {
  id: string;
  user_name_str: string;
  userFullName: string;
  videosWatched: number[];
  vwCount: number;  // total number of videos watched by a user
  videoRatings: Record<number, number>;
};

export async function getUserMetadata(id: string, user_name_str: string): Promise<UserMetadata> {
  const command = new GetCommand({
    TableName: TABLE_NAME,
    Key: {
      id,
      user_name_str
    },
  });

  try {
    const response = await docClient.send(command);
    if (!response.Item) {
      // If the item doesn't exist, return a new user metadata object
      return {
        id,
        user_name_str,
        userFullName: '',
        vwCount: 0,
        videosWatched: [],
        videoRatings: {},
      };
    }
    return response.Item as UserMetadata;
  } catch (error) {
    console.error('Error getting user metadata:', error);
    if (error instanceof Error) {
      console.error('Full error object:', JSON.stringify(error, null, 2));
      
      switch (error.name) {
        case 'ValidationException':
          throw new Error(`DynamoDB schema mismatch: ${error.message}. Please check your table structure and key usage.`);
        case 'ResourceNotFoundException':
          throw new Error('DynamoDB table not found. Please check your table name and AWS configuration.');
        case 'ProvisionedThroughputExceededException':
          throw new Error('DynamoDB read capacity exceeded. Please try again later or contact support.');
        case 'AccessDeniedException':
          throw new Error('Access denied to DynamoDB. Please check your AWS credentials and permissions.');
        default:
          throw new Error(`Error retrieving user data: ${error.message}`);
      }
    } else {
      throw new Error('An unknown error occurred while retrieving user data.');
    }
  }
}

export async function updateUserMetadata(id: string, user_name_str: string, metadata: Partial<UserMetadata>) {
  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      id,
      user_name_str,
      ...metadata,
    },
  });

  try {
    await docClient.send(command);
  } catch (error) {
    console.error('Error updating user metadata:', error);
    if (error instanceof Error) {
      console.error('Full error object:', JSON.stringify(error, null, 2));
      
      switch (error.name) {
        case 'ValidationException':
          throw new Error(`DynamoDB schema mismatch: ${error.message}. Please check your table structure and key usage.`);
        case 'ResourceNotFoundException':
          throw new Error('DynamoDB table not found. Please check your table name and AWS configuration.');
        case 'ProvisionedThroughputExceededException':
          throw new Error('DynamoDB write capacity exceeded. Please try again later or contact support.');
        case 'AccessDeniedException':
          throw new Error('Access denied to DynamoDB. Please check your AWS credentials and permissions.');
        default:
          throw new Error(`Error updating user data: ${error.message}`);
      }
    } else {
      throw new Error('An unknown error occurred while updating user data.');
    }
  }
}