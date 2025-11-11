import OpenAI from 'openai';
import { AIResponse, Message } from './types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const DEFAULT_SYSTEM_PROMPT = `You are a helpful customer support AI assistant. Your goal is to help users with their questions and issues efficiently and courteously.

Guidelines:
1. Be helpful, professional, and empathetic
2. Provide clear, concise answers
3. If you don't know something, admit it rather than guessing
4. For complex technical issues, gather relevant information before providing solutions
5. If a user seems frustrated or asks to speak to a human, recommend escalation
6. Keep responses conversational but informative

Escalation triggers:
- User explicitly asks for human help
- You cannot provide a satisfactory answer after 2-3 attempts
- Technical issues requiring system access or account changes
- Billing or refund requests
- Complaints or escalated frustration
- Complex troubleshooting that requires back-and-forth

When you think an issue should be escalated, include [ESCALATE] in your response and explain why.`;

const ESCALATION_KEYWORDS = [
  'speak to human',
  'talk to person',
  'human agent',
  'representative',
  'manager',
  'supervisor',
  'escalate',
  'frustrated',
  'angry',
  'terrible service',
  'cancel subscription',
  'refund',
  'billing issue',
  'account problem'
];

export async function getChatCompletion(
  messages: Message[],
  systemPrompt: string = DEFAULT_SYSTEM_PROMPT
): Promise<AIResponse> {
  try {
    const openaiMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        ...openaiMessages
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const responseMessage = completion.choices[0]?.message?.content || '';

    // Check for escalation triggers
    const shouldEscalate = checkEscalationTriggers(messages, responseMessage);
    const escalationReason = shouldEscalate ? getEscalationReason(messages, responseMessage) : undefined;

    // Calculate confidence score based on response characteristics
    const confidence = calculateConfidence(responseMessage, messages);

    // Extract category and priority suggestions
    const suggestedCategory = extractCategory(messages);
    const suggestedPriority = extractPriority(messages, shouldEscalate);

    return {
      message: responseMessage.replace('[ESCALATE]', '').trim(),
      confidence,
      shouldEscalate,
      escalationReason,
      suggestedCategory,
      suggestedPriority
    };
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return {
      message: "I apologize, but I'm experiencing technical difficulties. Let me connect you with a human agent who can assist you better.",
      confidence: 0,
      shouldEscalate: true,
      escalationReason: 'Technical error with AI system'
    };
  }
}

function checkEscalationTriggers(messages: Message[], response: string): boolean {
  const lastUserMessage = messages.filter(m => m.role === 'user').slice(-1)[0];

  if (!lastUserMessage) return false;

  // Check for explicit escalation in AI response
  if (response.includes('[ESCALATE]')) return true;

  // Check for escalation keywords in user message
  const userContent = lastUserMessage.content.toLowerCase();
  const hasKeyword = ESCALATION_KEYWORDS.some(keyword =>
    userContent.includes(keyword)
  );

  // Check for repeated similar questions (simplified)
  const userMessages = messages.filter(m => m.role === 'user');
  if (userMessages.length >= 3) {
      // Simple similarity check would go here
    // For now, we'll escalate if user asked 3+ times
    return true;
  }

  return hasKeyword;
}

function getEscalationReason(messages: Message[], response: string): string {
  if (response.includes('[ESCALATE]')) {
    return 'AI recommended escalation';
  }

  const lastUserMessage = messages.filter(m => m.role === 'user').slice(-1)[0];
  if (lastUserMessage) {
    const content = lastUserMessage.content.toLowerCase();

    if (content.includes('human') || content.includes('person')) {
      return 'User requested human agent';
    }
    if (content.includes('frustrated') || content.includes('angry')) {
      return 'User expressed frustration';
    }
    if (content.includes('billing') || content.includes('refund')) {
      return 'Billing/financial issue requires human intervention';
    }
    if (content.includes('cancel')) {
      return 'Account cancellation request';
    }
  }

  return 'Automatic escalation trigger activated';
}

function calculateConfidence(response: string, messages: Message[]): number {
  let confidence = 0.8; // Base confidence

  // Lower confidence for uncertain language
  const uncertainPhrases = ['i think', 'maybe', 'possibly', 'not sure', 'might be'];
  const hasUncertainty = uncertainPhrases.some(phrase =>
    response.toLowerCase().includes(phrase)
  );

  if (hasUncertainty) confidence -= 0.3;

  // Lower confidence for very short responses
  if (response.length < 50) confidence -= 0.2;

  // Lower confidence for repeated interactions
  const userMessages = messages.filter(m => m.role === 'user');
  if (userMessages.length > 5) confidence -= 0.1;

  return Math.max(0.1, Math.min(1.0, confidence));
}

function extractCategory(messages: Message[]): AIResponse['suggestedCategory'] {
  const allContent = messages.map(m => m.content).join(' ').toLowerCase();

  if (allContent.includes('billing') || allContent.includes('payment') || allContent.includes('refund')) {
    return 'billing';
  }
  if (allContent.includes('bug') || allContent.includes('error') || allContent.includes('not working')) {
    return 'technical';
  }
  if (allContent.includes('feature') || allContent.includes('suggestion') || allContent.includes('improvement')) {
    return 'feature_request';
  }
  if (allContent.includes('angry') || allContent.includes('frustrated') || allContent.includes('terrible')) {
    return 'complaint';
  }

  return 'general';
}

function extractPriority(messages: Message[], shouldEscalate: boolean): AIResponse['suggestedPriority'] {
  const allContent = messages.map(m => m.content).join(' ').toLowerCase();

  if (shouldEscalate || allContent.includes('urgent') || allContent.includes('emergency')) {
    return 'high';
  }
  if (allContent.includes('billing') || allContent.includes('payment')) {
    return 'medium';
  }
  if (allContent.includes('feature') || allContent.includes('suggestion')) {
    return 'low';
  }

  return 'medium';
}