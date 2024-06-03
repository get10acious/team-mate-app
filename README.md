# Team-Mate App

Team-Mate is an independent company dedicated to helping students and trainees manage their time and focus more effectively. This project demonstrates a personalized LLM-enhanced agent designed to optimize schedules, facilitate collaboration, and provide tailored support for enhanced learning experiences.

## Repository Structure

```
.
├── README.md
├── bun.lockb
├── index.html
├── package.json
├── postcss.config.js
├── public
│   └── logo.png
├── src
│   ├── App.tsx
│   ├── assets
│   ├── context
│   │   └── webSocketContext.tsx
│   ├── hooks
│   │   ├── useConsumer.ts
│   │   ├── usePublisher.ts
│   │   └── useWebSocket.ts
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts

6 directories, 18 files
```

## Getting Started

### Project Setup

1. Fork the repository.
2. Clone the repository:
   ```sh
   git clone https://github.com/your-username/team-mate-app.git
   ```
3. Navigate to the project directory:
   ```sh
   cd team-mate-app
   ```
4. Install the required packages:
   ```sh
   bun install
   ```
5. Create a `.env` file in the project root directory with the following variables:
   ```env
   VITE_WEBSOCKET_URL=http://localhost:6789
   ```
6. Run the project:
   ```sh
   bun run dev
   ```

## Important Notes

- **Starter Project**: This project provides a basic structure and examples to help you get started. The provided components and hooks are just examples. You are encouraged to modify and extend them according to your needs.
- **Flexibility**: You are not restricted to the current architecture or the packages used. Feel free to make any modifications to suit your approach to solving the challenge.

## Overview

The provided components and hooks demonstrate how to set up a WebSocket connection and manage chat interactions. The `WebSocketContext` provides context for managing the WebSocket connection and chat state, while `useConsumer` and `usePublisher` hooks handle message consumption and publishing.

## Contributions

We welcome contributions and suggestions! Feel free to fork the repository, make improvements, and submit a pull request.

## License

This project is licensed under the MIT License.
