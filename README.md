# AI-Powered Classroom Worksheet Generator

## Overview

This project demonstrates how to transform AI-generated text into practical and engaging classroom worksheets using a user-friendly design interface. It showcases the effective integration of AI into educational tools, enabling educators to create customized teaching materials with minimal effort. With an intuitive drag-and-drop interface and a range of export options, educators can save time while delivering high-quality teaching materials.

---

## Key Features

- **AI-Generated Content**: Automatically generate worksheet content using AI, including text-based exercises, quizzes, and activities tailored to specific educational contexts.
- **Drag-and-Drop Interface**: Simplify worksheet design with a flexible drag-and-drop interface for easy layout and customization.
- **Customizable Templates**: Choose from a variety of pre-designed templates for different educational levels and subjects.
- **Responsive Design**: Ensure worksheets are optimized for print and digital use.
- **Editable Textboxes**: Add fully customizable and editable textboxes with precise layout control, allowing for wrapping and resizing.
- **Export Options**: Save worksheets in multiple formats such as PDF or print-ready designs.
- **Swagger API Documentation**: Interact with the backend API through a user-friendly Swagger UI available at [http://localhost:5172/docs](http://localhost:5172/docs).
- **[OpenAI-Compatible](https://platform.openai.com/docs/overview) Integration**: Use AI services such as [Local LM Studio](https://lmstudio.ai/docs/api/openai-api), [Ollama](https://ollama.com/blog/openai-compatibility), or hosted services like [Groq](https://console.groq.com/docs/openai), [HuggingFace](https://huggingface.co/docs/text-generation-inference/en/messages_api), or [OpenRouter](https://openrouter.ai/docs/api-keys) for generating content.

---

## Technologies Used

### Frontend

- **React.js**: Build an interactive and dynamic user interface.
- **Fabric.js (v6)**: Enable advanced canvas manipulation and dynamic worksheet editing.
- **Prettier & ESLint**: Maintain code quality and consistency.

### Backend

- **Node.js & Express**: Express powered API endpoints for managing content and worksheet generation.
- **Swagger UI**: Document and test API endpoints.

### DevOps

- **Concurrently**: Manage simultaneous frontend and backend development with ease.
- **Environment Configuration**: Leverage .env for local development and environment-specific settings.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or above)
- A modern web browser (Chrome, Firefox, Edge, etc.)
- Basic knowledge of web development (optional, for customization)
- Access to an OpenAI-compatible API (e.g., Local LM Studio, Ollama, HuggingFace)

## Monorepo and npm Workspaces

This project is structured as a monorepo using npm workspaces, which allows managing both the client and server directories within a single repository. This setup simplifies dependency management and development workflows.

### Installing Dependencies

When you run `npm install` from the root directory, it installs dependencies for both the `client` and `server` workspaces. This ensures that all necessary packages are available for both parts of the application.

To install a package specifically for the client or server workspace, use the `-w` flag followed by the workspace name. For example:

```bash
# Install a package for the client workspace
npm install <package-name> -w client

# Install a package for the server workspace
npm install <package-name> -w server
```

### Installation

1. Clone the repository:

```bash
git clone https://github.com/kristenmontesano/worksheet-generator.git
cd worksheet-generator
```

2. Setup environment variables:

>Create a .env file for your local environment:

```bash
cp .env.example .env
```

3. Install dependencies:

```bash
npm install
```

4. Start the development server:

```bash
npm start
```

#### Running Development Environments

We use concurrently to run both the server and client development environments together. This allows you to develop and test the entire application seamlessly.

>This command will concurrently start the server and client, making it easier to work on both parts of the application simultaneously.

5. Access the applications at the following URLs:

```arduino
Frontend: http://localhost:5173
Swagger UI: http://localhost:5172/docs
Backend API: http://localhost:5172
```

## Usage

### Creating a Worksheet

1. Generate AI Content:

- Enter a prompt or use pre-defined options to generate worksheet content using AI.

2. Customize with Drag-and-Drop:

- Use the intuitive interface to organize and format content. Add headers, text sections, or shapes for better visual design.

3. Editable Sections:

- Modify any section with editable textboxes to fit specific classroom requirements.

4. Export Options:

- Export your worksheet as a PDF or print-ready design for distribution.

## Scripts

### Development Scripts

- **Start the Development Server**:

```bash
npm start
```

- **Start Frontend Only**:

```bash
npm run start:client
```

- **Start Backend Only**:

```bash
npm run start:server
```

- **Lint Code**:

```bash
npm run lint
```

- **Fix Lint Issues**:

```bash
npm run lint:fix
```

## Contributing

We welcome contributions! If you'd like to improve this tool or add features:

1. Fork the repository.

```bash
git fork https://github.com/kristenmontesano/worksheet-generator.git
```

2. Create a feature branch:

```bash
git checkout -b feature/your-feature-name
```

3. Commit your changes:

```bash
git commit -am 'Add a new feature'
```

4. Push to the branch:

```bash
git push origin feature/your-feature-name
```

5. Submit a pull request to the main repository.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
