# ⚖️ Consensus — Multi-AI Council

> Ask a question. Multiple AI models deliberate, critique each other, and reach a consensus answer.

**Live demo → [miglen.github.io/consensus](https://miglen.github.io/consensus)**

---

## What is this?

Consensus is a single-file web application that orchestrates multiple Large Language Models (LLMs) into a deliberative council. Instead of trusting one AI's answer, several agents with distinct roles discuss the question across multiple rounds, then a designated judge synthesizes the best final response.

Inspired by [llm-council](https://github.com/av/llm-council) by Andrej Karpathy and [Consilium](https://huggingface.co/blog/consilium-multi-llm) from the HuggingFace hackathon.

```
You ask a question
    │
    ▼
Round 1 ── All agents answer independently (in parallel)
    │
    ▼
Round 2+ ── Each agent reads peer responses and refines its answer
    │
    ▼
Judge ── One agent synthesizes the best final answer
```

### Key design choices

- **Anonymized peer review** — agent identities are hidden during review rounds to prevent self-preference bias
- **Configurable discussion modes**: `Full` (everyone sees all), `Ring` (sequential chain), `Star` (routed through judge)
- **No backend required** — runs as a pure static HTML file with your own API keys
- **Optional Docker + SQLite** — for persistent history and team use

---

## Supported AI Providers

| Provider | Models |
|---|---|
| OpenAI | gpt-4o, gpt-4-turbo, gpt-3.5-turbo, … |
| Anthropic | claude-opus-4-6, claude-sonnet-4-6, … |
| Google Gemini | gemini-1.5-pro, gemini-1.5-flash, … |
| Perplexity | llama-3.1-sonar-large-128k-online, … |
| xAI Grok | grok-beta, … |
| Custom | Any OpenAI-compatible API endpoint |

---

## Getting API Keys

You need at least one API key to use Consensus. Enable only the agents whose keys you have.

### OpenAI (GPT-4o, GPT-4-turbo, …)

1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click **Create new secret key** → give it a name → **Create**
4. Copy the key (starts with `sk-`) — you won't see it again
5. Add billing at [platform.openai.com/settings/organization/billing](https://platform.openai.com/settings/organization/billing) (pay-as-you-go, no subscription needed)

> 💡 GPT-4o is recommended. Cheapest entry point: enable GPT-3.5-turbo for testing.

---

### Anthropic / Claude

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign in or create an account
3. Navigate to **API Keys → Create Key**
4. Copy the key (starts with `sk-ant-`)
5. Add credits at [console.anthropic.com/settings/billing](https://console.anthropic.com/settings/billing)

> 💡 `claude-sonnet-4-6` is the best balance of speed and quality. Use `claude-haiku-4-5` for lower cost.

---

### Google Gemini

1. Go to [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **Create API key** → select or create a project
4. Copy the key (starts with `AIza`)

> 💡 Gemini has a **free tier** — good for testing without adding billing. `gemini-1.5-flash` is fast and free up to quota.

---

### Perplexity

1. Go to [perplexity.ai/settings/api](https://www.perplexity.ai/settings/api)
2. Sign in or create an account
3. Click **Generate** under API Keys
4. Copy the key (starts with `pplx-`)
5. Add credits in the same page

> 💡 Perplexity's `sonar` models have live web search built in — great as a research agent role.

---

### xAI / Grok

1. Go to [console.x.ai](https://console.x.ai)
2. Sign in with your X (Twitter) account
3. Navigate to **API Keys → Create API Key**
4. Copy the key (starts with `xai-`)
5. Add billing at [console.x.ai/billing](https://console.x.ai/billing)

> 💡 xAI offers free trial credits on signup.

---

### Custom / Self-hosted (Ollama, LM Studio, etc.)

No API key needed for local models. Just set the **Base URL** to your local endpoint:

| Tool | Base URL |
|---|---|
| [Ollama](https://ollama.com) | `http://localhost:11434/v1` |
| [LM Studio](https://lmstudio.ai) | `http://localhost:1234/v1` |
| [Together AI](https://api.together.xyz) | `https://api.together.xyz/v1` |
| [Mistral](https://console.mistral.ai) | `https://api.mistral.ai/v1` |

For Ollama, pull a model first:
```bash
ollama pull llama3.2
```
Then in Consensus: **Config → Agents → Add Agent → Provider: custom → Base URL: http://localhost:11434/v1 → Model: llama3.2**

---

## Deployment Options

### Option 1 — GitHub Pages (static, no backend)

The simplest option. No server needed. History is stored in the browser's `localStorage` (~5 MB limit). A storage usage meter in the sidebar shows remaining space.

**Steps:**

1. Fork this repo
2. Go to **Settings → Pages → Source → Deploy from branch → `main` → `/ (root)`**
3. Visit `https://<your-username>.github.io/consensus`
4. Enter your API keys in **Config → API Keys** (keys are stored only in your browser, never sent anywhere except the AI providers)

> **Note:** GitHub Pages serves `index.html` directly. API keys never leave your browser.

---

### Option 2 — Docker Compose (SQLite, persistent)

Runs a Node.js + Express server with a SQLite database for unlimited persistent history. Best for local or self-hosted team use.

**Requirements:** Docker and Docker Compose

```bash
# Clone the repo
git clone https://github.com/miglen/consensus
cd consensus

# Start the server
docker compose up -d

# Visit
open http://localhost:3000
```

The SQLite database is stored in a named Docker volume (`consensus_data`) and persists across container restarts.

```bash
# View logs
docker compose logs -f

# Stop
docker compose down

# Stop and remove data
docker compose down -v
```

**Custom port:**

```yaml
# docker-compose.yml
ports:
  - "8080:3000"   # Change 8080 to your preferred port
```

---

### Option 3 — Run locally (Node.js)

```bash
git clone https://github.com/miglen/consensus
cd consensus
npm install
node server.js
# → http://localhost:3000
```

---

### Option 4 — Single HTML file (offline / portable)

No installation at all. Just open `index.html` directly in your browser.

```bash
# Download just the file
curl -O https://raw.githubusercontent.com/miglen/consensus/main/index.html

# Open it
open index.html
```

> When run as a local file, the app uses `localStorage`. The storage usage bar in the sidebar shows how much space remains.

---

## Configuration

### Via the UI

Go to **Config** in the top navigation:

- **Agents** — enable/disable providers, set model names, assign roles (Expert Advocate, Critical Analyst, Strategic Advisor, etc.), pick colors
- **API Keys** — enter keys per provider (masked, stored only in your browser or server)
- **Settings** — default rounds, discussion mode, judge selection, anonymization, max tokens
- **JSON** — raw config editor; export/import as `.json`

### Via config file

Export your config from the UI or create `consensus-config.json`:

```json
{
  "agents": [
    {
      "id": "gpt4o",
      "name": "GPT-4o",
      "provider": "openai",
      "model": "gpt-4o",
      "role": "expert_advocate",
      "color": "#10a37f",
      "enabled": true
    },
    {
      "id": "claude",
      "name": "Claude",
      "provider": "anthropic",
      "model": "claude-opus-4-6",
      "role": "critical_analyst",
      "color": "#c5986a",
      "enabled": true
    }
  ],
  "keys": {
    "openai": "sk-...",
    "anthropic": "sk-ant-..."
  },
  "settings": {
    "rounds": 2,
    "mode": "full",
    "judgeId": "gpt4o",
    "anonymize": true,
    "maxTokens": 2000
  }
}
```

Import it in **Config → JSON → Import File**, or place it next to `index.html` and it will be auto-loaded on first run.

### Adding a custom provider

Any OpenAI-compatible API works (Ollama, LM Studio, Together AI, Mistral, etc.):

1. Go to **Config → Agents → Add Agent**
2. Set **Provider** to `custom`
3. Set **Base URL** to your endpoint (e.g. `http://localhost:11434/v1` for Ollama)
4. Enter the model name

---

## Agent Roles

| Role | Behavior |
|---|---|
| `standard` | Balanced expert analysis |
| `expert_advocate` | Passionate advocate — argues its position with conviction |
| `critical_analyst` | Rigorous critic — finds flaws, risks, and weaknesses |
| `strategic_advisor` | Focuses on practical implementation and real-world constraints |
| `research_specialist` | Evidence-based, authoritative, cites reasoning explicitly |
| `innovation_catalyst` | Challenges conventional thinking, proposes breakthrough approaches |

---

## Discussion Modes

| Mode | How it works |
|---|---|
| **Full** | Every agent sees all peer responses each round |
| **Ring** | Each agent only sees the previous agent's response (sequential chain) |
| **Star** | All agents send responses to the judge; judge shares a summary back |

---

## File Structure

```
consensus/
├── index.html          # The entire frontend application (standalone)
├── server.js           # Node.js + Express backend (optional, for SQLite)
├── package.json
├── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## Storage

| Mode | Storage | Limit |
|---|---|---|
| GitHub Pages / static file | `localStorage` | ~5 MB (meter shown in sidebar) |
| Docker / Node.js server | SQLite database | Unlimited (disk space) |

When running in localStorage mode, the sidebar shows a live usage bar so you know how much space remains. Once you're getting close, use **Export** to archive old chats and **Config → Clear History** to free space.

---

## Privacy

- **API keys are never stored on any server in static mode.** They live only in your browser's `localStorage`.
- In Docker mode, keys are still stored client-side — the server only stores conversation history.
- Requests go directly from your browser to the AI provider APIs. No proxy.

---

## License

MIT