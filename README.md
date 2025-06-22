# HMC Wallet Bot

A Discord bot for wallet management and automation.

## Features
- Connects to Discord using a bot token
- Wallet management features (customize as needed)

## Prerequisites
- Node.js (v16 or newer recommended)
- npm

## Setup
1. Clone the repository:
   ```sh
   git clone <repo-url>
   cd hmc-wallet-bot
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a `.env` file in the project root with the following content:
   ```env
   DISCORD_TOKEN=your_discord_bot_token
   CLIENT_ID=your_discord_client_id
   ```
4. Start the bot:
   ```sh
   node index.js
   ```

## Usage
- Invite the bot to your Discord server using the CLIENT_ID.
- Use bot commands as documented in your code or help command.

## Notes
- Do not share your `.env` file or bot token publicly.
- Customize the bot logic in `index.js` as needed.

## License
MIT
