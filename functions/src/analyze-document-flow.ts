import {genkit, z} from "genkit";
import {googleAI, gemini20Flash} from "@genkit-ai/googleai";

const DocumentAnalysisSchema = z.object({
  documentType: z.string(),
  requiresBackSide: z.boolean(),
});

const ai = genkit({
  plugins: [
    googleAI(),
  ],
});

export const analyzeDocumentFlow = ai.defineFlow({
  name: "analyzeDocumentFlow",
  inputSchema: z.object({
    image: z.string().describe("Imagem em formato base64 (sem o prefixo)"),
  }),
  outputSchema: DocumentAnalysisSchema,
  // Política de segurança: Em produção, descomente e ative o App Check.
  // authPolicy: (auth, input) => {
  //   if (!auth.app) {
  //     throw new Error('Request not authorized by App Check.');
  //   }
  // },
  streamSchema: z.string(),
}, async ({image}) => {
  const prompt = `Analise a imagem de um documento. A sua tarefa é identificar o tipo do documento e se ele está completo (sem necessidade de foto do verso).

    Responda APENAS com um objeto JSON com a seguinte estrutura:
    {
      "documentType": "CNH" | "RG" | "CIN" | "Passaporte" | "Outro",
      "requiresBackSide": boolean
    }

    REGRAS OBRIGATÓRIAS PARA AVALIAÇÃO DE 'requiresBackSide':
    1.  Se a imagem mostrar um PASSAPORTE ABERTO (com a página da foto e a página de dados visíveis), retorne 'false'.
    2.  Se a imagem mostrar uma CNH (Carteira Nacional de Habilitação) ABERTA, com ambos os lados visíveis, retorne 'false'.
    3.  Se a imagem mostrar uma CIN (Carteira de Identidade Nacional) ABERTA, com ambos os lados visíveis, retorne 'false'.
    4.  Se a imagem mostrar um RG ABERTO, com ambos os lados visíveis, retorne 'false'.
    5.  Se a imagem mostrar APENAS a frente de uma CNH, RG ou CIN (onde o verso não é visível), retorne 'true'.
    6.  Se for um documento de face única que contenha todas as informações, retorne 'false'.
    7.  Para todos os outros casos e em caso de dúvida, assuma que o verso é necessário e retorne 'true'.
    `;

  const response = await ai.generate({
    model: gemini20Flash,
    prompt: [{text: prompt}, {media: {url: `data:image/jpeg;base64,${image}`}}],
    config: {
      temperature: 0,
    },
  });

  return response.output || {};
}
);
