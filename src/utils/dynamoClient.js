const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

const isLocal = process.env.STAGE === 'dev' || process.env.IS_OFFLINE;

const clientConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
};

if (isLocal) {
  clientConfig.endpoint = process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000';
  clientConfig.credentials = {
    accessKeyId: 'LOCAL',
    secretAccessKey: 'LOCAL',
  };
}

const dynamoClient = new DynamoDBClient(clientConfig);

const docClient = DynamoDBDocumentClient.from(dynamoClient, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertEmptyValues: false,
  },
  unmarshallOptions: {
    wrapNumbers: false,
  },
});

const TABLE_NAME = process.env.DYNAMODB_TABLE || 'mimotomipasion-marketplace-api-partes-dev';

module.exports = { docClient, TABLE_NAME, dynamoClient };
