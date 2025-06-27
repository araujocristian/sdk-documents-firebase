import {onCallGenkit} from "firebase-functions/https";
import {defineSecret} from "firebase-functions/params";
import {analyzeDocumentFlow} from "./analyze-document-flow";

const googleAIapiKey = defineSecret("GEMINI_API_KEY");

export const analyzeDocument = onCallGenkit({
  // Uncomment to enable AppCheck. This can reduce costs by ensuring only your Verified
  // app users can use your API. Read more at https://firebase.google.com/docs/app-check/cloud-functions
  // enforceAppCheck: true,

  // authPolicy can be any callback that accepts an AuthData (a uid and tokens dictionary) and the
  // request data. The isSignedIn() and hasClaim() helpers can be used to simplify. The following
  // will require the user to have the email_verified claim, for example.
  // authPolicy: hasClaim("email_verified"),

  // Grant access to the API key to this function:
  secrets: [googleAIapiKey],
}, analyzeDocumentFlow);
