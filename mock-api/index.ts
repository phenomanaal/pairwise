import fastify, { FastifyReply, FastifyRequest } from 'fastify';
import fastifyCors from '@fastify/cors';
import { fastifyMultipart } from '@fastify/multipart';

import * as fs from 'fs';

const DATA_FILE = './data.json'

interface FormData {
  fileType: string;
}

interface ExternalFile {
  fileType: string;
  fileName: string;
}

interface JsonData {
  externalFiles: ExternalFile[];
  voterFile: string;
}

const readJsonFile = (filePath: string): JsonData => {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(fileContent);
};

// Function to write updated data back to a JSON file
const writeJsonFile = (filePath: string, data: JsonData) => {
  const jsonData = JSON.stringify(data, null, 2); // Convert the data to a pretty-printed JSON string
  fs.writeFileSync(filePath, jsonData, 'utf-8');
};

const writeExternalFile = (
  filePath: string,
  newFile: ExternalFile
): void => {
  const jsonData = readJsonFile(filePath); // Read the current data
  const externalFiles = jsonData.externalFiles; // Get the externalFiles array

  // Check if the file already exists in the externalFiles array
  const existingFileIndex = externalFiles.findIndex(
    (file) => file.fileName === newFile.fileName
  );

  if (existingFileIndex !== -1) {
    // File already exists, update it
    externalFiles[existingFileIndex] = { ...externalFiles[existingFileIndex], ...newFile };
    console.log(`Updated file: ${newFile.fileName}`);
  } else {
    // File doesn't exist, add it
    externalFiles.push(newFile);
    console.log(`Added new file: ${newFile.fileName}`);
  }

  // Write the updated externalFiles array back to the JSON
  jsonData.externalFiles = externalFiles;
  writeJsonFile(filePath, jsonData);
};

const server = fastify({ logger: true });

// Register fastify-cors plugin
server.register(fastifyCors, {
  origin: 'http://localhost:3000', // Allow requests from this origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
});
server.register(fastifyMultipart)

interface LoginPayload {
  username: string;
  oneTimePassword: string;
}

interface AccessCodePayload {
  accessCode: string;
}

const validUsername = 'validUser';
const validOtp = '123456';
const validAccessCode = '98765';

server.post('/pairwise/login', async (request: FastifyRequest, reply: FastifyReply) => {
  const { username, oneTimePassword }: LoginPayload = request.body as LoginPayload;


  if (username === validUsername && oneTimePassword === validOtp) {
    return reply.status(200).send({
        status: "success",
        message: "TOTP Verified. Check your email for the access code.",
        next_step: "access_code",
        access_code_expiry: "10 minutes"
      });
  }

  return reply.status(401).send({
    message: "Invalid credentials."
  });
});

server.post('/pairwise/verify-access-code', async (request: FastifyRequest, reply: FastifyReply) => {
  const { accessCode }: AccessCodePayload = request.body as AccessCodePayload;


  if (accessCode == validAccessCode) {
    return reply.status(200).send({
      status: "success",
      message: "Access code verified successfully.",
      next_step: "authenticated",
      session_expiry: "60 minutes"
    });
  }

  return reply.status(401).send({
    status: "error",
    message: "Invalid access code. Please try again.",
    next_step: "retry"
  });
});

server.post('/pairwise/file', async (request: FastifyRequest, reply: FastifyReply) => {
  const parts = request.parts();
  let fileName = String();
  let fileType;

  for await (const part of parts){
    if (part.type == 'file') {
      fileName = part.filename
    }

    if (part.type == "field" && part.fieldname == "fileType") {
      fileType  = part.value
    }
  }                

});

server.listen({ port: 3001, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`); // Log the address if successful
});
