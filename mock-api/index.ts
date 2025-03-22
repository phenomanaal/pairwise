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

interface FileData {
  fileType: string;
  externalFileType: string | null;
  fileName: string;
}

const readJsonFile = (filePath: string): JsonData => {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(fileContent);
};

const writeJsonFile = (filePath: string, data: JsonData) => {
  const jsonData = JSON.stringify(data, null, 2);
  fs.writeFileSync(filePath, jsonData, 'utf-8');
};

const writeExternalFile = (
  filePath: string,
  newFile: ExternalFile
): void => {
  const jsonData = readJsonFile(filePath);
  const externalFiles = jsonData.externalFiles;

  const existingFileIndex = externalFiles.findIndex(
    (file) => file.fileName === newFile.fileName
  );

  if (existingFileIndex !== -1) {
    externalFiles[existingFileIndex] = { ...externalFiles[existingFileIndex], ...newFile };
    console.log(`Updated file: ${newFile.fileName}`);
  } else {
    externalFiles.push(newFile);
    console.log(`Added new file: ${newFile.fileName}`);
  }

  jsonData.externalFiles = externalFiles;
  writeJsonFile(filePath, jsonData);
};

const server = fastify({ logger: true });

server.register(fastifyCors, {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
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
    let fileData: FileData[] = [];
    try {
      const data = await fs.promises.readFile('data.json', 'utf8');
      fileData = JSON.parse(data) as FileData[];
    } catch (error) {
      fileData = [];
    }
    
    if (fileType === 'voter' && fileData.some((item: FileData) => item.fileType === 'voter')) {
      return reply.status(400).send({ 
        message: 'A voter file already exists in the system.' 
      });
    }
    
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
    
    const newEntry: FileData = {
      fileType,
      externalFileType: fileType === 'external' ? externalFileType : null,
      fileName
    };
    
    fileData.push(newEntry);
    
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

server.get('/pairwise/files', async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    interface FileData {
      fileType: string;
      externalFileType: string | null;
      fileName: string;
    }
    
    let fileData: FileData[] = [];
    
    try {
      const data = await fs.promises.readFile('data.json', 'utf8');
      fileData = JSON.parse(data) as FileData[];
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        fileData = [];
      } else {
        console.error('Error reading data.json:', error);
        return reply.status(500).send({
          message: 'An error occurred while retrieving the file list',
          error: (error as Error).message
        });
      }
    }
    
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
  console.log(`Server listening at ${address}`);
});
