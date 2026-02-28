# MR_POPO Discord Bot System & Web Dashboard

![Mr. Popo Logo](assets/images/MR_POPO.png)

A fully-featured monorepo containing the **MR_POPO** Discord bot, integrated web dashboard (React/Express), and automated testing suite.

## Project Structure
- `packages/bot`: The MR_POPO Discord bot logic and persistent SQLite storage.
- `packages/dashboard`: React frontend and Express backend for monitoring offenses.
- `scripts/`: Initialization and automation scripts.
- `assets/images/`: Contains `MR_POPO.png` and `MR_POPO_CLOSE-UP.png`.

## Setup Instructions

### 1. Requirements
- Nix with flakes enabled.
- Discord App with Bot and OAuth2 configured.

### 2. Discord Configuration
1. Go to [Discord Developer Portal](https://discord.com/developers/applications).
2. Create an Application named **MR_POPO**.
3. **Bot Profile**: Upload `assets/images/MR_POPO_CLOSE-UP.png` as the bot's avatar.
4. **Bot Privileges**: Enable "Server Members" and "Message Content" intents.
5. **OAuth2 Redirects**: 
   - Add Redirect URI: `http://localhost:3001/auth/discord/callback` (for local dev) and your production URL.
   - Note `Client ID` and `Client Secret`.
6. **Invite Link Generation**:
   - Go to OAuth2 -> URL Generator.
   - Select scopes: `bot` and `applications.commands`.
   - Select permissions: `Ban Members`, `Send Messages`.
   - Use the generated link to invite MR_POPO to your server.

### 3. Initialize Environment
```bash
nix develop
cp packages/bot/.env.example .env
cp packages/dashboard/.env.example packages/dashboard/.env
# Fill in variables in both .env files (DISCORD_TOKEN, DISCORD_CLIENT_ID, etc.)
# IMPORTANT for Dashboard Admin: Set GUILD_ID in dashboard/.env to the Server ID you are securing.
```

### 4. GitHub Setup
To automate repository creation:
```bash
# Ensure you are in 'nix develop' shell
chmod +x scripts/init-repo.sh
./scripts/init-repo.sh
```

### 5. Running
```bash
# Install everything
npm install

# Start development
npm run dev --workspaces
```

## Testing
Run the automated test suite natively inside the Nix shell:
```bash
nix develop --command npm run test
```

## Dashboard Usage
The dashboard is restricted to users with **Administrator** or **Manage Server** permissions in the discord server defined by `GUILD_ID`.
1. Open the dashboard (defaults to port 3001).
2. Click "Login with Discord".
3. View the table of tracked offenses and reset users manually if needed.
