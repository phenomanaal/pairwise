import fastify, { FastifyReply, FastifyRequest } from 'fastify';
import fastifyCors from '@fastify/cors';
import { fastifyMultipart } from '@fastify/multipart';
import fastifyJwt from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { pipeline } from 'stream/promises';
import { createWriteStream } from 'fs';
import { parse } from 'csv-parse';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { username: string; role: string };
    user: {
      username: string;
      role: string;
    };
  }
}

const DATA_FILE = './data.json';
const validUsername = 'validUser';
const validOtp = '123456';
const validAccessCode = '098765';
const server = fastify({ logger: true });

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
  id: string;
  fileType: string;
  externalFileType: string | null;
  fileName: string;
  matchStatus: boolean;
  downloadStatus: boolean;
}
interface AccessCodePayload {
  accessCode: string;
}
interface LoginPayload {
  username: string;
  oneTimePassword: string;
}

const REQUIRED_COLUMNS: Record<string, string[]> = {
  'state-dept-corrections-felons-list': [
    'name',
    'address',
    'city',
    'state',
    'DOB',
    'place_of_birth'
  ],
  'dept-of-vital-stats-deceased-list': [
    'name',
    'DOB',
    'DOD',
    'SSN',
    'last_known_address'
  ],
  'change-of-address-record': [
    'name',
    'old_address',
    'new_address',
    'city',
    'state',
    'zip',
    'move_date'
  ],
  'other-voter-file': [
    'voter_id',
    'name',
    'address',
    'city',
    'state',
    'zip',
    'registration_date'
  ]
};

const validateCSVColumns = async (
  filePath: string,
  requiredColumns: string[]
): Promise<{ valid: boolean; missingColumns?: string[]; foundColumns?: string[] }> => {
  return new Promise((resolve, reject) => {
    const parser = parse({
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true
    });

    let headers: string[] = [];
    let headersParsed = false;

    parser.on('readable', function () {
      let record;
      while ((record = parser.read()) !== null) {
        if (!headersParsed) {
          headers = Object.keys(record);
          headersParsed = true;
          parser.end(); // We only need the headers
        }
      }
    });

    parser.on('error', (err) => {
      reject(err);
    });

    parser.on('end', () => {
      const normalizedHeaders = headers.map(h => h.trim().toLowerCase());
      const normalizedRequired = requiredColumns.map(c => c.trim().toLowerCase());
      
      const missingColumns = normalizedRequired.filter(
        col => !normalizedHeaders.includes(col)
      );

      if (missingColumns.length > 0) {
        resolve({
          valid: false,
          missingColumns: missingColumns,
          foundColumns: headers
        });
      } else {
        resolve({
          valid: true,
          foundColumns: headers
        });
      }
    });

    const readStream = fs.createReadStream(filePath);
    readStream.pipe(parser);
  });
};

const readJsonFile = (filePath: string): JsonData => {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(fileContent);
};

const writeJsonFile = (filePath: string, data: JsonData) => {
  const jsonData = JSON.stringify(data, null, 2);
  fs.writeFileSync(filePath, jsonData, 'utf-8');
};

const writeExternalFile = (filePath: string, newFile: ExternalFile): void => {
  const jsonData = readJsonFile(filePath);
  const externalFiles = jsonData.externalFiles;

  const existingFileIndex = externalFiles.findIndex(
    (file) => file.fileName === newFile.fileName,
  );

  if (existingFileIndex !== -1) {
    externalFiles[existingFileIndex] = {
      ...externalFiles[existingFileIndex],
      ...newFile,
    };
    console.log(`Updated file: ${newFile.fileName}`);
  } else {
    externalFiles.push(newFile);
    console.log(`Added new file: ${newFile.fileName}`);
  }

  jsonData.externalFiles = externalFiles;
  writeJsonFile(filePath, jsonData);
};

server.register(fastifyJwt, {
  secret: 'mock-super-secret-key-change-in-production',
  cookie: {
    cookieName: 'pairwise_token',
    signed: false,
  },
});

server.register(fastifyCors, {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
});

server.register(fastifyMultipart);
server.register(fastifyCookie);

server.decorate(
  'authenticate',
  async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ message: 'Unauthorized' });
    }
  },
);

server.post(
  '/pairwise/login',
  async (request: FastifyRequest, reply: FastifyReply) => {
    const { username, oneTimePassword } = request.body as {
      username: string;
      oneTimePassword: string;
    };

    if (username === validUsername && oneTimePassword === validOtp) {
      return reply.status(200).send({
        status: 'success',
        message: 'TOTP Verified. Check your email for the access code.',
        next_step: 'access_code',
        access_code_expiry: '10 minutes',
      });
    }

    return reply.status(401).send({
      message: 'Invalid credentials.',
    });
  },
);

server.post(
  '/pairwise/verify-access-code',
  async (request: FastifyRequest, reply: FastifyReply) => {
    const { accessCode } = request.body as { accessCode: string };

    if (accessCode === validAccessCode) {
      const token = server.jwt.sign(
        {
          username: validUsername,
          role: 'user',
        },
        {
          expiresIn: '1h',
        },
      );

      reply.setCookie('pairwise_token', token, {
        path: '/',
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 3600,
      });

      return reply.status(200).send({
        status: 'success',
        message: 'Access code verified successfully.',
        next_step: 'authenticated',
        token: token,
      });
    }

    return reply.status(401).send({
      status: 'error',
      message: 'Invalid access code. Please try again.',
      next_step: 'retry',
    });
  },
);
server.post(
  '/pairwise/match',
  {
    preHandler: server.authenticate,
  },
  async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body;
    const { id } = request.body as { id: string };

    const randomValue = Math.random();
    if (randomValue < 0.5) {
      console.log(`Simulated match error (random value: ${randomValue})`);
      return reply.status(500).send({
        message: 'An error occurred during the matching process. Please try again.',
        error: 'Simulated processing error'
      });
    }

    const parts = request.parts();
    let fileData: FileData[] = [];
    try {
      const data = await fs.promises.readFile('data.json', 'utf8');
      fileData = JSON.parse(data) as FileData[];

      const fileIndex = fileData.findIndex((file) => file.id === id);
      if (fileIndex !== -1) {
        fileData[fileIndex].matchStatus = true;

        await fs.promises.writeFile(
          'data.json',
          JSON.stringify(fileData, null, 2),
          'utf8',
        );
      }
      return reply
        .status(200)
        .send({ message: `matchStatus of file ${id} set to true.` });
    } catch (error) {
      return reply.status(400).send({ message: String(error) });
    }
  },
);

server.post(
  '/pairwise/download',
  {
    preHandler: server.authenticate,
  },
  async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body;
    const { id } = request.body as { id: string };

    const parts = request.parts();
    let fileData: FileData[] = [];
    try {
      const randomValue = Math.random();
      if (randomValue < 0.5) {
        console.log(`Simulated download error (random value: ${randomValue})`);
        return reply.status(500).send({
          message: 'An error occurred during the download process. Please try again.',
          error: 'Simulated processing error'
        });
      }
      const data = await fs.promises.readFile('data.json', 'utf8');
      fileData = JSON.parse(data) as FileData[];

      const fileIndex = fileData.findIndex((file) => file.id === id);
      if (fileIndex !== -1) {
        fileData[fileIndex].downloadStatus = true;

        await fs.promises.writeFile(
          'data.json',
          JSON.stringify(fileData, null, 2),
          'utf8',
        );
      }
      return reply
        .status(200)
        .send({ message: `downloadStatus of file ${id} set to true.` });
    } catch (error) {
      return reply.status(400).send({ message: String(error) });
    }
  },
);

server.post(
  '/pairwise/file',
  {
    preHandler: server.authenticate,
  },
  async (request: FastifyRequest, reply: FastifyReply) => {
    const parts = request.parts();
    let fileName: string = '';
    let fileType: string = '';
    let externalFileType: string | null = null;
    let matchStatus = false;
    let downloadStatus = false;
    let tempFilePath: string = '';

    for await (const part of parts) {
      if (part.type === 'file') {
        fileName = part.filename;
        
        // Save file temporarily for validation
        tempFilePath = `./temp_${Date.now()}_${fileName}`;
        const writeStream = createWriteStream(tempFilePath);
        await pipeline(part.file, writeStream);
      }

      if (part.type === 'field' && part.fieldname === 'fileType') {
        fileType = String(part.value);
        matchStatus = fileType === 'voter';
        downloadStatus = fileType === 'voter';
      }

      if (part.type === 'field' && part.fieldname === 'externalFileType') {
        externalFileType = part.value ? String(part.value) : null;
      }
    }

    if (!fileType) {
      // Clean up temp file if it exists
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      return reply.status(400).send({
        message: 'File type is required',
      });
    }

    if (!fileName) {
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      return reply.status(400).send({
        message: 'No file was uploaded',
      });
    }

    if (fileType === 'external' && externalFileType) {
      const requiredColumns = REQUIRED_COLUMNS[externalFileType];
      
      if (requiredColumns && tempFilePath) {
        try {
          const validation = await validateCSVColumns(tempFilePath, requiredColumns);
          console.log(validation)
          if (!validation.valid) {
            if (fs.existsSync(tempFilePath)) {
              fs.unlinkSync(tempFilePath);
            }
            
            return reply.status(400).send({
              message: 'Invalid CSV format: Missing required columns',
              missingColumns: validation.missingColumns,
              foundColumns: validation.foundColumns,
              requiredColumns: requiredColumns
            });
          }
        } catch (error) {
          if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
          }
          
          return reply.status(400).send({
            message: 'Error validating CSV file',
            error: (error as Error).message
          });
        }
      }
    }

    // Clean up temp file after validation
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }

    try {
      let fileData: FileData[] = [];
      try {
        const data = await fs.promises.readFile('data.json', 'utf8');
        fileData = JSON.parse(data) as FileData[];
      } catch (error) {
        fileData = [];
      }

      if (
        fileType === 'voter' &&
        fileData.some((item: FileData) => item.fileType === 'voter')
      ) {
        return reply.status(400).send({
          message: 'A voter file already exists in the system.',
        });
      }

      const isDuplicate = fileData.some(
        (item: FileData) =>
          item.fileType === fileType &&
          item.externalFileType === externalFileType &&
          item.fileName === fileName,
      );

      if (isDuplicate) {
        return reply.status(400).send({
          message: 'This exact file entry already exists in the system.',
        });
      }
      const id: string = uuidv4();
      const newEntry: FileData = {
        id,
        fileType,
        externalFileType: fileType === 'external' ? externalFileType : null,
        fileName,
        matchStatus,
        downloadStatus,
      };

      fileData.push(newEntry);

      await fs.promises.writeFile(
        'data.json',
        JSON.stringify(fileData, null, 2),
      );

      return reply.status(200).send({
        message: 'File uploaded successfully',
      });
    } catch (error) {
      console.error('Error handling file upload:', error);
      return reply.status(500).send({
        message: 'An error occurred while processing your request',
      });
    }
  },
);

server.get(
  '/pairwise/files',
  {
    preHandler: server.authenticate,
  },
  async (request: FastifyRequest, reply: FastifyReply) => {
    try {
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
            error: (error as Error).message,
          });
        }
      }

      return reply.status(200).send(fileData);
    } catch (error) {
      console.error('Unexpected error:', error);
      return reply.status(500).send({
        message: 'An unexpected error occurred',
        error: (error as Error).message,
      });
    }
  },
);

server.post(
  '/pairwise/logout',
  async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      reply.clearCookie('pairwise_token', { path: '/' });
      await fs.promises.writeFile('data.json', JSON.stringify([], null, 2));
      return reply
        .status(200)
        .send({ message: 'Logged out successfully and data cleared' });
    } catch (error) {
      console.error('Error during logout:', error);
      return reply.status(500).send({
        message: 'An error occurred during logout',
        error: (error as Error).message,
      });
    }
  },
);

server.get(
  '/pairwise/auth-check',
  {
    preHandler: server.authenticate,
  },
  async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.status(200).send({
      authenticated: true,
      user: request.user,
    });
  },
);

server.listen({ port: 3001, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});