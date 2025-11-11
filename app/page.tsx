import Link from "next/link";
import { MessageCircle, LayoutDashboard, Bot, Zap, Shield, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <Bot className="h-20 w-20 text-blue-500" />
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Ticket AI Agent
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Smart customer support that combines AI efficiency with human expertise.
            Get instant answers, seamless escalations, and superior customer experience.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/chat"
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              <span>Start Chat Support</span>
            </Link>

            <Link
              href="/dashboard"
              className="inline-flex items-center space-x-2 bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>Agent Dashboard</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need for modern customer support
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Zap className="h-10 w-10 text-blue-500" />}
              title="Instant AI Responses"
              description="Get immediate answers to common questions using GPT-4o, the most advanced AI model."
            />

            <FeatureCard
              icon={<Users className="h-10 w-10 text-green-500" />}
              title="Seamless Escalation"
              description="Automatic escalation to human agents when AI can't help, with full conversation context."
            />

            <FeatureCard
              icon={<Shield className="h-10 w-10 text-purple-500" />}
              title="Smart Ticket Management"
              description="Intelligent ticket creation, categorization, and priority assignment with agent dashboard."
            />
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard
              step="1"
              title="Customer Asks Question"
              description="Customers start a conversation through our intelligent chat interface."
            />

            <StepCard
              step="2"
              title="AI Provides Smart Answers"
              description="Our AI analyzes the question and provides helpful, contextual responses."
            />

            <StepCard
              step="3"
              title="Human Takeover When Needed"
              description="If AI can't resolve the issue, it's seamlessly escalated to a human agent."
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-4">
            <Bot className="h-8 w-8 text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Ticket AI Agent</h3>
          <p className="text-gray-400">
            Revolutionizing customer support with AI and human collaboration
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white p-8 rounded-xl shadow-lg text-center">
      <div className="flex justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function StepCard({ step, title, description }: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full text-xl font-bold mb-4">
        {step}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
