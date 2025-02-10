"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const multipart_1 = require("@fastify/multipart");
const fs = __importStar(require("fs"));
const DATA_FILE = './data.json';
const readJsonFile = (filePath) => {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(fileContent);
};
// Function to write updated data back to a JSON file
const writeJsonFile = (filePath, data) => {
    const jsonData = JSON.stringify(data, null, 2); // Convert the data to a pretty-printed JSON string
    fs.writeFileSync(filePath, jsonData, 'utf-8');
};
const writeExternalFile = (filePath, newFile) => {
    const jsonData = readJsonFile(filePath); // Read the current data
    const externalFiles = jsonData.externalFiles; // Get the externalFiles array
    // Check if the file already exists in the externalFiles array
    const existingFileIndex = externalFiles.findIndex((file) => file.fileName === newFile.fileName);
    if (existingFileIndex !== -1) {
        // File already exists, update it
        externalFiles[existingFileIndex] = Object.assign(Object.assign({}, externalFiles[existingFileIndex]), newFile);
        console.log(`Updated file: ${newFile.fileName}`);
    }
    else {
        // File doesn't exist, add it
        externalFiles.push(newFile);
        console.log(`Added new file: ${newFile.fileName}`);
    }
    // Write the updated externalFiles array back to the JSON
    jsonData.externalFiles = externalFiles;
    writeJsonFile(filePath, jsonData);
};
const server = (0, fastify_1.default)({ logger: true });
// Register fastify-cors plugin
server.register(cors_1.default, {
    origin: 'http://localhost:3000', // Allow requests from this origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
});
server.register(multipart_1.fastifyMultipart);
const validUsername = 'validUser';
const validOtp = '123456';
const validAccessCode = '98765';
server.post('/pairwise/login', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, oneTimePassword } = request.body;
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
}));
server.post('/pairwise/verify-access-code', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    const { accessCode } = request.body;
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
}));
server.post('/pairwise/file', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, e_1, _b, _c;
    const parts = request.parts();
    let fileName = String();
    let fileType;
    try {
        for (var _d = true, parts_1 = __asyncValues(parts), parts_1_1; parts_1_1 = yield parts_1.next(), _a = parts_1_1.done, !_a; _d = true) {
            _c = parts_1_1.value;
            _d = false;
            const part = _c;
            if (part.type == 'file') {
                fileName = part.filename;
            }
            if (part.type == "field" && part.fieldname == "fileType") {
                fileType = part.value;
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (!_d && !_a && (_b = parts_1.return)) yield _b.call(parts_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    console.log(fileName, fileType);
}));
server.listen({ port: 3001, host: '0.0.0.0' }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`); // Log the address if successful
});
