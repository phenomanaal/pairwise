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
const validAccessCode = '098765';

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

// Explicitly define the interface first
interface FileData {
  fileType: string;
  externalFileType: string | null;
  fileName: string;
}

server.post('/pairwise/file', async (request: FastifyRequest, reply: FastifyReply) => {
  const parts = request.parts();
  let fileName: string = '';
  let fileType: string = '';
  let externalFileType: string | null = null;

  for await (const part of parts) {
    if (part.type === 'file') {
      fileName = part.filename;
    }

    if (part.type === "field" && part.fieldname === "fileType") {
      fileType = String(part.value);
    }

    if (part.type === "field" && part.fieldname === "externalFileType") {
      externalFileType = part.value ? String(part.value) : null;
    }
  }
  
  // Validate required fields
  if (!fileType) {
    return reply.status(400).send({
      message: 'File type is required'
    });
  }

  if (!fileName) {
    return reply.status(400).send({
      message: 'No file was uploaded'
    });
  }
  
  try {
    // Read the existing data or create an empty array if file doesn't exist
    let fileData: FileData[] = [];
    try {
      // Using fs/promises
      const data = await fs.promises.readFile('data.json', 'utf8');
      fileData = JSON.parse(data) as FileData[];
    } catch (error) {
      // File doesn't exist or other error, start with empty array
      fileData = [];
    }
    
    // Check if a voter file already exists
    if (fileType === 'voter' && fileData.some((item: FileData) => item.fileType === 'voter')) {
      return reply.status(400).send({ 
        message: 'A voter file already exists in the system.' 
      });
    }
    
    // Check for exact duplicate entries (matching all fields)
    const isDuplicate = fileData.some((item: FileData) => 
      item.fileType === fileType && 
      item.externalFileType === externalFileType && 
      item.fileName === fileName
    );
    
    if (isDuplicate) {
      return reply.status(400).send({
        message: 'This exact file entry already exists in the system.'
      });
    }
    
    // Create the new file entry with explicit typing
    const newEntry: FileData = {
      fileType,
      externalFileType: fileType === 'external' ? externalFileType : null,
      fileName
    };
    
    // Add the new file data
    fileData.push(newEntry);
    
    // Write the updated data back to the file
    await fs.promises.writeFile('data.json', JSON.stringify(fileData, null, 2));
    
    return reply.status(200).send({ 
      message: 'File uploaded successfully'
    });
    
  } catch (error) {
    console.error('Error handling file upload:', error);
    return reply.status(500).send({ 
      message: 'An error occurred while processing your request'
    });
  }
});

// GET endpoint to retrieve the file list from data.json
server.get('/pairwise/files', async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    // Define the file data type
    interface FileData {
      fileType: string;
      externalFileType: string | null;
      fileName: string;
    }
    
    let fileData: FileData[] = [];
    
    try {
      // Read the data.json file
      const data = await fs.promises.readFile('data.json', 'utf8');
      fileData = JSON.parse(data) as FileData[];
    } catch (error) {
      // If file doesn't exist or other error, return empty array
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        // File doesn't exist yet
        fileData = [];
      } else {
        // Some other error occurred
        console.error('Error reading data.json:', error);
        return reply.status(500).send({
          message: 'An error occurred while retrieving the file list',
          error: (error as Error).message
        });
      }
    }
    
    // Return the file data as JSON
    return reply.status(200).send(fileData);
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return reply.status(500).send({
      message: 'An unexpected error occurred',
      error: (error as Error).message
    });
  }
});

server.listen({ port: 3001, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`); // Log the address if successful
});
