# Ticket AI Agent

A modern AI-powered customer support system that combines the efficiency of GPT-4o with seamless escalation to human agents. Built with Next.js 16, TypeScript, and Tailwind CSS.

## ✨ Features

- **🤖 AI-Powered Chat**: Instant responses using OpenAI GPT-4o
- **🔄 Smart Escalation**: Automatic detection when human intervention is needed
- **🎫 Ticket Management**: Intelligent ticket creation and categorization
- **👥 Agent Dashboard**: Complete view of tickets, escalations, and agent status
- **💾 Local Storage**: Data persistence using browser localStorage
- **📱 Responsive Design**: Works perfectly on desktop and mobile
- **⚡ Real-time Updates**: Live chat interface with typing indicators

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ticket-ai-agent
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.template .env.local
   ```

   Edit `.env.local` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
├── app/
│   ├── api/
│   │   ├── chat/route.ts        # OpenAI chat endpoint
│   │   └── tickets/             # Ticket management endpoints
│   ├── chat/page.tsx            # Chat interface page
│   ├── dashboard/page.tsx       # Agent dashboard
│   ├── layout.tsx               # Root layout with providers
│   └── page.tsx                 # Landing page
├── components/
│   ├── chat/
│   │   └── ChatInterface.tsx    # Main chat component
│   ├── tickets/
│   │   └── TicketList.tsx       # Ticket display component
│   └── Navigation.tsx           # App navigation
├── contexts/
│   └── AppContext.tsx           # Global state management
├── lib/
│   ├── types.ts                 # TypeScript definitions
│   ├── openai.ts                # OpenAI integration
│   └── storage.ts               # Local storage utilities
└── README.md
```

## 🎯 How It Works

### 1. Customer Interaction
- Customers start a conversation through the chat interface
- AI provides instant, intelligent responses using GPT-4o
- All conversations are tracked and stored locally

### 2. Smart Escalation
The system automatically escalates to human agents when:
- User explicitly asks for human help
- AI confidence falls below threshold
- Complex issues requiring human intervention
- Technical errors occur

### 3. Ticket Management
- Tickets are automatically created during escalation
- Smart categorization and priority assignment
- Agent dashboard for ticket management
- Complete conversation history preserved

### 4. Agent Dashboard
- View all tickets (active, escalated, resolved)
- Agent status and workload management
- Real-time statistics and analytics
- Easy ticket assignment and status updates

## 🔧 Configuration

### Escalation Triggers
The system uses multiple triggers for escalation:
- **Keywords**: "human agent", "speak to person", etc.
- **Confidence**: AI responses below 30% confidence
- **Sentiment**: Frustrated or angry customers
- **Context**: Billing issues, account problems

### AI Behavior
Configure AI responses in `lib/openai.ts`:
- System prompts
- Response temperature
- Maximum tokens
- Escalation keywords

## 🌐 API Endpoints

### Chat
- `POST /api/chat` - Send message and get AI response

### Tickets
- `GET /api/tickets` - List tickets with filters
- `POST /api/tickets` - Create new ticket
- `GET /api/tickets/[id]` - Get ticket details
- `PUT /api/tickets/[id]` - Update ticket
- `DELETE /api/tickets/[id]` - Delete ticket

## 💾 Data Storage

Currently uses browser localStorage for data persistence. The system is designed to easily migrate to:
- PostgreSQL
- MongoDB
- Supabase
- Firebase

## 🚀 Deployment

### Build for production
```bash
npm run build
npm start
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### Environment Variables for Production
- `OPENAI_API_KEY`: Your OpenAI API key
- `DATABASE_URL`: (when you add a database)
- `NEXTAUTH_SECRET`: (for authentication)

## 🛠️ Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Tech Stack
- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS
- **AI**: OpenAI GPT-4o
- **Icons**: Lucide React
- **UI Components**: Radix UI
- **State**: React Context + localStorage

## 📝 Usage Examples

### Basic Customer Support
```typescript
// Customer asks a question
"How do I reset my password?"

// AI responds with helpful instructions
// No escalation needed
```

### Escalation Scenario
```typescript
// Customer expresses frustration
"This is terrible, I want to speak to a human!"

// System detects escalation trigger
// Creates ticket and notifies agents
// Conversation context preserved
```

## 🔮 Future Enhancements

- **Database Integration**: Move from localStorage to proper database
- **Authentication**: User accounts and agent login
- **File Uploads**: Support for screenshots and documents
- **Integration**: Connect with existing CRM/helpdesk systems
- **Analytics**: Advanced reporting and insights
- **Multi-language**: Support for multiple languages
- **Voice Chat**: Voice-to-text integration
- **Mobile App**: React Native mobile application

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the [GitHub Issues](issues) page
2. Create a new issue with detailed information
3. For urgent matters, contact the development team

---

Built with ❤️ using Next.js, OpenAI, and modern web technologies.