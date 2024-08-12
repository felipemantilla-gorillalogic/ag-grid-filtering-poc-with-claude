
# AG Grid Testing with AI-Powered Filters

This monorepo contains two main projects: 
- **server**: A Node.js Express server that interacts with the Anthropic Claude API to process natural language queries.
- **ag-grid-testing**: A Vue.js frontend that uses AG Grid to display and filter car data based on AI-generated filters.

## Overview

### server

The server is built with Express and uses the Anthropic Claude API to convert natural language queries into JSON filters that can be applied to AG Grid. 

#### Setup

1. **Install dependencies**:
   ```bash
   cd server
   npm install
   ```

2. **Environment Variables**:
   - Create a `.env` file in the `server` directory.
   - Add your Anthropic Claude API key:
     ```
     API_KEY=your_anthropic_api_key
     ```

3. **Run the server**:
   ```bash
   npm start
   ```
   The server will run on `http://localhost:3000`.

### ag-grid-testing

The frontend is a Vue.js project that displays car data in an AG Grid table. Users can input natural language queries to filter the grid using AI-powered filters.

#### Setup

1. **Install dependencies**:
   ```bash
   cd ag-grid-testing
   npm install
   ```

2. **Run the frontend**:
   ```bash
   npm run serve
   ```
   The frontend will run on `http://localhost:8080`.

### How It Works

1. The user enters a filter query in the input box on the frontend.
2. The query is sent to the Express server, where it's processed by the Anthropic Claude API.
3. The server returns a JSON object representing the filters.
4. The frontend applies these filters to the AG Grid.

### Example Queries

- "Show me electric cars priced under $50,000."
- "Filter for cars made after 2020 with a rating of 4 or more stars."

### Directory Structure

```
/ag-grid-testing
    /src
    /public
    /node_modules
    ...
/server
    /node_modules
    index.js
    ...
README.md
```

### License

This project is licensed under the MIT License. See the `LICENSE` file for details.
