// Extracts structured data from a receipt, pay stub, or credit card statement using
// Gemini's vision API. Runs server-side only: the GEMINI_API_KEY never reaches the
// browser. Deployed with JWT verification on, so only signed-in app users can call it.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const MODEL = "gemini-3.5-flash-lite";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
}

function schemaFor(kind: string, categories: string[]) {
  if (kind === "receipt") {
    return {
      type: "object",
      properties: {
        merchant: { type: "string", description: "Merchant/store name" },
        date: { type: "string", description: "Purchase date as YYYY-MM-DD, or \"\" if not visible" },
        amount: { type: "number", description: "Final total amount paid, including tax/tip" },
        category: { type: "string", enum: categories, description: "Best-fit category for this purchase" },
      },
      required: ["merchant", "date", "amount", "category"],
    };
  }
  if (kind === "paystub") {
    return {
      type: "object",
      properties: {
        gross: { type: "number", description: "This pay period's gross pay" },
        taxWithheld: { type: "number", description: "This pay period's income tax withheld" },
        payDate: { type: "string", description: "Pay date as YYYY-MM-DD, or \"\"" },
        ytdGross: { type: "number", description: "Year-to-date gross earnings" },
        citTaxableGross: { type: "number", description: "Year-to-date CIT taxable gross" },
        totalTaxes: { type: "number", description: "Year-to-date total taxes" },
        totalDeductions: { type: "number", description: "Year-to-date total deductions" },
        netPay: { type: "number", description: "Net pay shown on the stub" },
        hourlyWage: { type: "number", description: "Hourly rate if shown, else 0" },
        cit: { type: "number", description: "Year-to-date CIT (federal income tax withheld)" },
        cppEE: { type: "number", description: "Year-to-date CPP employee contribution" },
        eiEE: { type: "number", description: "Year-to-date EI employee contribution" },
        cpp2EE: { type: "number", description: "Year-to-date CPP2 (second additional CPP tier) employee contribution" },
      },
      required: ["gross", "taxWithheld", "payDate", "ytdGross", "citTaxableGross", "totalTaxes", "totalDeductions", "netPay", "hourlyWage", "cit", "cppEE", "eiEE", "cpp2EE"],
    };
  }
  // statement
  return {
    type: "object",
    properties: {
      transactions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            date: { type: "string", description: "Transaction date as YYYY-MM-DD" },
            merchant: { type: "string", description: "Merchant/description as shown on the statement" },
            amount: { type: "number", description: "Absolute value of the transaction amount" },
            isCredit: { type: "boolean", description: "true if this is a payment, credit, or refund rather than a purchase" },
            category: { type: "string", enum: categories, description: "Best-fit category for this transaction" },
          },
          required: ["date", "merchant", "amount", "isCredit", "category"],
        },
      },
    },
    required: ["transactions"],
  };
}

function systemPromptFor(kind: string) {
  if (kind === "paystub") {
    return "You extract structured pay data from Canadian pay stub images or PDFs. Extract ONLY numeric pay and tax figures matching the given response schema. NEVER extract, report, or repeat the employee's name, SIN, address, or employer name/address, even if clearly visible in the document — those fields do not exist in the schema on purpose. If a figure isn't present on this stub, report 0 for numbers or \"\" for dates. Figures are typically shown in a \"current | YTD\" pair per line; unless a field is explicitly the current-period figure, report the YTD (rightmost/larger) value.";
  }
  if (kind === "statement") {
    return "You extract every transaction line from a credit card or bank statement, which may span multiple pages. For each transaction, identify the date, merchant/description, amount, whether it is a payment/credit/refund rather than a purchase (isCredit), and the single best-fit category chosen from the exact list provided in the category enum — never invent a category outside that list.";
  }
  return "You extract the merchant name, purchase date, total amount (including tax and tip), and the single best-fit category from a receipt image or PDF, choosing the category from the exact list provided in the category enum — never invent a category outside that list.";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  if (!GEMINI_API_KEY) {
    return json({ error: "GEMINI_API_KEY is not configured for this project" }, 500);
  }

  let body: { kind?: string; mimeType?: string; data?: string; categories?: string[] };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const { kind, mimeType, data } = body;
  if (kind !== "receipt" && kind !== "paystub" && kind !== "statement") {
    return json({ error: "kind must be receipt, paystub, or statement" }, 400);
  }
  if (!mimeType || !data) {
    return json({ error: "mimeType and data (base64) are required" }, 400);
  }
  const categories = Array.isArray(body.categories) && body.categories.length ? body.categories : ["Other"];

  const schema = schemaFor(kind, categories);
  const maxOutputTokens = kind === "statement" ? 4096 : 1024;
  const instructionText = kind === "statement" ? "Extract every transaction from this statement." : "Extract the requested fields from this document.";

  let geminiResp: Response;
  try {
    geminiResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: "POST",
      headers: {
        "x-goog-api-key": GEMINI_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPromptFor(kind) }] },
        contents: [
          {
            role: "user",
            parts: [
              { text: instructionText },
              { inlineData: { mimeType, data } },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: schema,
          maxOutputTokens,
        },
      }),
    });
  } catch (e) {
    return json({ error: `Failed to reach Gemini API: ${String(e)}` }, 502);
  }

  if (!geminiResp.ok) {
    const errText = await geminiResp.text();
    return json({ error: `Gemini API error (${geminiResp.status}): ${errText}` }, 502);
  }

  const result = await geminiResp.json();
  const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    return json({ error: "Model did not return structured data", raw: result }, 502);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return json({ error: "Model returned invalid JSON", raw: text }, 502);
  }
  return json(parsed);
});
