require('dotenv').config();

const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;


const OFFICIAL_EMAIL = process.env.OFFICIAL_EMAIL || 'krrish0553.be23@chitkara.edu.in';

app.use(cors());
app.use(express.json());

function successResponse(data) {
  return {
    is_success: true,
    official_email: OFFICIAL_EMAIL,
    data
  };
}

function errorResponse(message) {
  return {
    is_success: false,
    official_email: OFFICIAL_EMAIL,
    error: message
  };
}

function generateFibonacci(n) {
  const result = [];
  if (n <= 0) return result;
  result.push(0);
  if (n === 1) return result;
  result.push(1);
  for (let i = 2; i < n; i += 1) {
    result.push(result[i - 1] + result[i - 2]);
  }
  return result;
}

function isPrime(num) {
  if (!Number.isInteger(num) || num <= 1) return false;
  if (num === 2) return true;
  if (num % 2 === 0) return false;
  const limit = Math.floor(Math.sqrt(num));
  for (let i = 3; i <= limit; i += 2) {
    if (num % i === 0) return false;
  }
  return true;
}

function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const temp = y;
    y = x % y;
    x = temp;
  }
  return x;
}

function lcmTwo(a, b) {
  if (a === 0 || b === 0) return 0;
  return Math.abs(a * b) / gcd(a, b);
}

function lcmArray(arr) {
  return arr.reduce((acc, val) => lcmTwo(acc, val));
}

function hcfArray(arr) {
  return arr.reduce((acc, val) => gcd(acc, val));
}

// AI helpers
function extractSingleWord(text) {
  if (!text) {
    throw new Error('Empty response from AI');
  }

  const firstWord = text
    .trim()
    .split(/\s+/)[0]
    .replace(/[^\p{L}\p{N}]/gu, '');

  if (!firstWord) {
    throw new Error('Unable to extract single-word answer from AI response');
  }

  return firstWord;
}

async function getGeminiSingleWord(question) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const prompt = `Answer the following question in exactly one word.\nQuestion: ${question}`;
  const body = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ]
  };

  const response = await axios.post(url, body, { timeout: 8000 });
  const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return extractSingleWord(text);
}

async function getOpenAISingleWord(question) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const url = 'https://api.openai.com/v1/chat/completions';
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const body = {
    model,
    messages: [
      { role: 'system', content: 'Answer in exactly one word.' },
      { role: 'user', content: question }
    ],
    temperature: 0
  };

  const response = await axios.post(url, body, {
    timeout: 8000,
    headers: {
      Authorization: `Bearer ${apiKey}`
    }
  });

  const text = response.data?.choices?.[0]?.message?.content || '';
  return extractSingleWord(text);
}

function normalizeAiError(err, provider) {
  const status = err?.response?.status;
  if (status === 429) {
    return {
      statusCode: 429,
      message: `${provider} rate limit or quota exceeded`
    };
  }

  if (status && status >= 400) {
    return {
      statusCode: 502,
      message: `${provider} API error (${status})`
    };
  }

  return {
    statusCode: 502,
    message: `${provider} API request failed`
  };
}

async function getSingleWordAIAnswer(question) {
  const provider = (process.env.AI_PROVIDER || 'gemini').toLowerCase();
  const hasGemini = Boolean(process.env.GEMINI_API_KEY);
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);

  if (!hasGemini && !hasOpenAI) {
    throw new Error('No AI provider configured. Set GEMINI_API_KEY or OPENAI_API_KEY.');
  }

  if (provider === 'gemini') {
    return getGeminiSingleWord(question);
  }

  if (provider === 'openai') {
    return getOpenAISingleWord(question);
  }

  let lastError = null;
  if (hasGemini) {
    try {
      return await getGeminiSingleWord(question);
    } catch (err) {
      lastError = err;
    }
  }

  if (hasOpenAI) {
    try {
      return await getOpenAISingleWord(question);
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('AI provider failed');
}

// Routes
app.get('/health', (req, res) => {
  try {
    return res.status(200).json({
      is_success: true,
      official_email: OFFICIAL_EMAIL
    });
  } catch (err) {
    return res.status(500).json(errorResponse('Internal server error'));
  }
});

app.post('/bfhl', async (req, res) => {
  try {
    if (!req.is('application/json')) {
      return res.status(415).json(errorResponse('Content-Type must be application/json'));
    }

    const body = req.body || {};
    const allowedKeys = ['fibonacci', 'prime', 'lcm', 'hcf', 'AI'];
    const keys = Object.keys(body).filter((k) => allowedKeys.includes(k));

    if (keys.length !== 1) {
      return res.status(400).json(errorResponse('Request body must contain exactly one of: fibonacci, prime, lcm, hcf, AI'));
    }

    const key = keys[0];
    const value = body[key];

    if (key === 'fibonacci') {
      if (!Number.isInteger(value)) {
        return res.status(400).json(errorResponse('fibonacci must be an integer'));
      }
      if (value < 1 || value > 50) {
        return res.status(400).json(errorResponse('fibonacci must be between 1 and 50'));
      }
      const data = generateFibonacci(value);
      return res.status(200).json(successResponse(data));
    }

    if (['prime', 'lcm', 'hcf'].includes(key)) {
      if (!Array.isArray(value) || value.length === 0) {
        return res.status(400).json(errorResponse(`${key} must be a non-empty array of integers`));
      }

      const nums = [];
      for (const item of value) {
        if (typeof item !== 'number' || !Number.isFinite(item) || !Number.isInteger(item)) {
          return res.status(400).json(errorResponse(`${key} array must contain only integers`));
        }
        nums.push(item);
      }

      if (nums.length > 1000) {
        return res.status(400).json(errorResponse(`${key} array is too large`));
      }

      if (key === 'prime') {
        const primes = nums.filter((n) => isPrime(n));
        return res.status(200).json(successResponse(primes));
      }

      if (key === 'lcm') {
        const result = lcmArray(nums);
        return res.status(200).json(successResponse(result));
      }

      if (key === 'hcf') {
        const result = hcfArray(nums);
        return res.status(200).json(successResponse(result));
      }
    }

    if (key === 'AI') {
      if (typeof value !== 'string' || !value.trim()) {
        return res.status(400).json(errorResponse('AI must be a non-empty string question'));
      }

      try {
        const answer = await getSingleWordAIAnswer(value.trim());
        return res.status(200).json(successResponse(answer));
      } catch (aiErr) {
        const provider = (process.env.AI_PROVIDER || 'auto').toLowerCase();
        const mapped = normalizeAiError(aiErr, provider === 'openai' ? 'OpenAI' : 'Gemini');
        console.error('AI error:', aiErr.message);
        return res.status(mapped.statusCode).json(errorResponse(mapped.message));
      }
    }

    return res.status(400).json(errorResponse('Invalid request'));
  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json(errorResponse('Internal server error'));
  }
});

// Error handling
app.use((req, res) => {
  return res.status(404).json(errorResponse('Not found'));
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  return res.status(500).json(errorResponse('Internal server error'));
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
