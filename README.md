# Chitkara Qualifier 1 - BFHL API

Node.js implementation for the Qualifier 1 problem.

## Endpoints

### `GET /health`

**200 OK**
```json
{
  "is_success": true,
  "official_email": "YOUR CHITKARA EMAIL"
}
```

### `POST /bfhl`

The request body must contain **exactly one** of the following keys:

- `{"fibonacci": 7}` → returns first 7 Fibonacci numbers
- `{"prime": [2,4,7,9,11]}` → returns only prime numbers
- `{"lcm": [12,18,24]}` → returns LCM
- `{"hcf": [24,36,60]}` → returns HCF
- `{"AI": "What is the capital city of Maharashtra?"}` → returns a **single-word** AI answer

Successful responses:
```json
{
  "is_success": true,
  "official_email": "YOUR CHITKARA EMAIL",
  "data": ...
}
```

Errors:
```json
{
  "is_success": false,
  "official_email": "YOUR CHITKARA EMAIL",
  "error": "Error message here"
}
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` from example:
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and set:
  - `OFFICIAL_EMAIL` to your Chitkara email
  - `GEMINI_API_KEY` from https://aistudio.google.com (optional)
  - `OPENAI_API_KEY` from https://platform.openai.com/api-keys (optional)
  - `AI_PROVIDER` set to `auto`, `gemini`, or `openai` (optional)
  - If both keys are set and `AI_PROVIDER=auto`, Gemini is used first and OpenAI is used as fallback

3. Run locally:
   ```bash
   npm start
   ```

Server will run on `http://localhost:3001` by default (or the `PORT` you set).

## Sample Requests

- `POST http://localhost:3001/bfhl`
  ```json
  { "fibonacci": 7 }
  ```

- `POST http://localhost:3001/bfhl`
  ```json
  { "prime": [2,4,7,9,11] }
  ```

- `POST http://localhost:3001/bfhl`
  ```json
  { "lcm": [12,18,24] }
  ```

- `POST http://localhost:3001/bfhl`
  ```json
  { "hcf": [24,36,60] }
  ```

- `POST http://localhost:3001/bfhl`
  ```json
  { "AI": "What is the capital city of Maharashtra?" }
  ```

## Using ngrok (Temporary Public URL)

If you need to expose your local API publicly for testing:

1. Start the server locally:
  ```bash
  npm start
  ```

2. In another terminal, run ngrok on the same port (for example 3001):
  ```bash
  ngrok http 3001
  ```

3. ngrok will show a URL like `https://xxxx-xxxx.ngrok-free.app`.
  Use this URL instead of `http://localhost:3001` when calling:
  - `GET /health`
  - `POST /bfhl`

## Deployment Notes

You can deploy this repository to Vercel, Railway, or Render.

Make sure to configure these environment variables in your deployment settings:

- `OFFICIAL_EMAIL`
- `GEMINI_API_KEY` (optional)
- `OPENAI_API_KEY` (optional)
- `AI_PROVIDER` (optional)
- `OPENAI_MODEL` (optional)
- (optional) `PORT`
