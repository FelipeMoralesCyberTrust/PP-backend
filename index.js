//Imports
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { OpenAI } from "langchain/llms/openai";
import { RetrievalQAChain } from "langchain/chains";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PromptTemplate } from "langchain/prompts";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

//borrar esta linea comentada

const prompt = PromptTemplate.fromTemplate(
  
  `Pregunta: {question}

  Respuesta en español sobre la Universidad de Valparaíso:
  
  Soy un asistente que habla español fluido. Voy a responder preguntas sobre la Universidad de Valparaíso de manera concisa y útil, utilizando mi conocimiento sobre esta universidad chilena. Mis respuestas se enfocarán estrictamente en temas relacionados con la UV, como su historia, campus, facultades, carreras, vida estudiantil, etc. No hablaré de temas no relacionados con la UV.`  
);



//Docs
const loader = new DirectoryLoader("./documents", {
  ".pdf": (path) => new PDFLoader(path),
});
const docs = await loader.load();
const VECTOR_STORE_PATH = "Documents.index";
function normalizeDocuments(docs) {
  return docs.map((doc) => {
    if (typeof doc.pageContent === "string") {
      return doc.pageContent;
    } else if (Array.isArray(doc.pageContent)) {
      return doc.pageContent.join("\n");
    }
  });
}



//Init
console.log("Initializing...");

export const run = async (userQuestion) => {
  try {
    const model = new OpenAI({
      language: "spanish",
      modelName: "gpt-3.5-turbo-instruct",
      temperature: 0.5,
      
    });
    let vectorStore;

    // Vector store
    if (fs.existsSync(VECTOR_STORE_PATH)) {
      console.log("Loading an existing vector store...");
      vectorStore = await HNSWLib.load(VECTOR_STORE_PATH, new OpenAIEmbeddings());
      console.log("Vector store loaded.");
    } else {
      console.log("Creating a new vector store...");
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
      });
      const normalizedDocs = normalizeDocuments(docs);
      const splitDocs = await textSplitter.createDocuments(normalizedDocs);

      vectorStore = await HNSWLib.fromDocuments(splitDocs, new OpenAIEmbeddings());
      await vectorStore.save(VECTOR_STORE_PATH);
      console.log("Vector store created.");
    }

    // Retrieval chain
    console.log("Creating retrieval chain");
    
    const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever(),prompt);

    // User question processing
    console.log('Pregunta:');
    console.log(userQuestion);
    const res = await chain.call({ query: userQuestion });
    console.log('Generando respuesta...');
    console.log(res);
    console.log('Respuesta generada');

    return res; // Retorna la respuesta generada

  } catch (error) {
    console.error('Error during chat processing:', error);
    throw error;
  }
};



