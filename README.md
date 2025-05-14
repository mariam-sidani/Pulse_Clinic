# Pulse Clinic Web Application

A comprehensive healthcare platform for managing patients, doctors, appointments, and medical consultations with AI assistance.

## Features

- User authentication with email verification
- Role-based access control (Admin, Doctor, Patient)
- Admin dashboard to manage users
- Doctor registration by admins
- Patient self-registration
- Responsive design for all devices
- AI-powered chat support for patients and doctors using LangGraph.js
- Appointment scheduling and management

## Tech Stack

- **Frontend**: React 19, Next.js 15, Tailwind CSS 4, Chakra UI 3
- **Backend**: Node.js, Next.js API routes
- **Database**: MySQL
- **State Management**: Zustand
- **Authentication**: JWT (JSON Web Tokens)
- **Email**: Nodemailer
- **AI**: LangGraph.js, LangChain, OpenAI

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MySQL database

### Setup

1. Clone the repository
```bash
git clone <repository-url>
cd clinic_agent_app
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env.local` file in the root directory (use the provided `.env.example` as a template)

4. Set up the database
   - Create a database named `pulse`
   - Import the schema from `db/pulse.sql`
   - Run any migration scripts if available in `db/migrations/`

5. Start the development server with Turbopack
```bash
npm run dev
```

6. Access the application at `http://localhost:3000`

## Environment Variables

The application requires several environment variables to be set. A `.env.example` file is provided as a template. Copy this to `.env` and update the values accordingly:

```
# Database connection
DATABASE_URL="mysql://username:password@localhost:3306/pulse"
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=
DATABASE_NAME=pulse

# JWT Secret for Authentication
JWT_SECRET="your-secure-jwt-secret-for-authentication"

# Email service (using nodemailer)
EMAIL_USER="your_email@gmail.com"
EMAIL_PASS="your_email_app_password"
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587

# Base URL for frontend
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Reset Users Secret Key (for admin)
RESET_USERS_SECRET_KEY="temp_reset_key"

# OpenAI API
OPENAI_API_KEY=your_openai_api_key_here

# LangSmith Tracing (for monitoring and debugging)
LANGCHAIN_API_KEY=your_langsmith_api_key_here
LANGCHAIN_ENDPOINT=https://api.smith.langchain.com
LANGCHAIN_PROJECT=clinic-agent-app
LANGCHAIN_TRACING_V2=true
LANGCHAIN_CALLBACKS_BACKGROUND=false
```

### Important Environment Variables:

- **Database Configuration**: Set your MySQL connection details
- **JWT Secret**: A secure secret key for JWT authentication
- **Email Configuration**: Required for sending verification emails and password resets
- **OpenAI API Key**: Required for the AI chat functionality
- **LangSmith Configuration**: Optional but recommended for monitoring AI interactions

## User Types and Access

### Admin
- User management (view, create, update, delete users)
- Register doctors
- Full system access

### Doctor
- View assigned patients
- Manage appointments
- Access to AI-assisted medical chat

### Patient
- Book appointments with doctors
- View medical history
- Access to AI-assisted healthcare chat

## Initial Setup

The database is configured with default roles. To create users:

- **Admin**: Create an admin user manually in the database or through the API
- **Doctors**: Register doctors through the admin interface
- **Patients**: Users can register as patients through the signup page

## Database Schema

The application uses the following main tables:
- `users`: Basic auth information and role assignment
- `roles`: User roles (Admin, Doctor, Patient)
- `doctors`: Doctor-specific information
- `patients`: Patient-specific information 
- `specialties`: Medical specialties
- `appointments`: Patient appointments with doctors
- `appointment_slots`: Available booking slots for doctors

## AI Chat Implementation

The application includes an advanced AI chat feature powered by LangGraph.js:

### Features:
- Message routing based on content
- Role-specific responses for admin, doctor, and patient users
- General healthcare inquiries handled by a general assistant
- Medical/clinic specific inquiries routed to specialized agents

### Tools and Integration:
- Built with LangGraph.js for agent orchestration
- Uses OpenAI's models for natural language understanding
- Optionally integrates with LangSmith for monitoring and debugging

### API Endpoint:
The LangGraph is exposed through the `/api/chat` endpoint, which accepts POST requests with authorization.

## Deployment

For production deployment:

```bash
npm run build
npm start
```

### Deployment Considerations:
- Set `NODE_ENV=production` for production environments
- Ensure all environment variables are properly configured
- For serverless environments (like Vercel), set `LANGCHAIN_CALLBACKS_BACKGROUND=false`

## Development

- Use the included ESLint configuration for code quality
- The project uses Turbopack for faster development builds
- Run `npm run lint` to check for code issues

## License

This project is licensed under the MIT License.
