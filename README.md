# HMC Wallet Bot

A Discord bot for managing HeavenMine (HMC) wallets directly on your server. Supports wallet creation, recovery, airdrop requests, balance checks, transaction history, sending HMC, and blockchain viewing.

## Features
- **Tạo ví mới** (`/taovi`): Sinh mnemonic, private key (mã hoá), public key.
- **Phục hồi ví** (`/khoiphuc`): Khôi phục ví từ mnemonic và tạo private key mã hoá.
- **Kiểm tra số dư** (`/balance`): Xem số dư HMC của địa chỉ ví.
- **Giao dịch** (`/send-hmc`): Gửi HMC từ ví đã mã hoá.
- **Airdrop** (`/airdrop`): Xin airdrop HMC (giới hạn 1 lần/24h).
- **Lịch sử giao dịch** (`/lichsu`): Xem lịch sử giao dịch của ví.
- **Xem blockchain** (`/xem-blocks`): Xem toàn bộ blockchain (có phân trang).

## Prerequisites
- Node.js v16+
- npm
- Một node backend HeavenMine (API REST, ví dụ: http://localhost:3000)

## Setup
1. Clone repo:
   ```sh
   git clone <repo-url>
   cd hmc-wallet-bot
   ```
2. Cài đặt package:
   ```sh
   npm install
   ```
3. Tạo file `.env` với nội dung:
   ```env
   DISCORD_TOKEN=your_discord_bot_token
   CLIENT_ID=your_discord_client_id
   GUILD_ID=your_guild_id
   AIRDROP_WEBHOOK_URL=your_discord_webhook_url
   ```
4. Chạy bot:
   ```sh
   node index.js
   ```

## Bot Commands
| Lệnh           | Mô tả                                    |
|----------------|-------------------------------------------|
| `/taovi`       | Tạo ví mới                                |
| `/khoiphuc`    | Phục hồi ví từ mnemonic                   |
| `/balance`     | Kiểm tra số dư ví                         |
| `/send-hmc`    | Gửi HMC                                   |
| `/airdrop`     | Xin airdrop HMC                           |
| `/lichsu`      | Xem lịch sử giao dịch                     |
| `/xem-blocks`  | Xem blockchain                            |

## Notes
- Không chia sẻ file `.env` hoặc private key.
- Các lệnh đều trả kết quả riêng tư (ephemeral) trên Discord.
- Backend node phải chạy đúng API REST như ví dụ.

## License
MIT
