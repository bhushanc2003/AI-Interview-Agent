import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory

# Load environment variables
load_dotenv()

# Get API Key
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise ValueError("GOOGLE_API_KEY is missing in .env file")

# Initialize Gemini model
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-pro",
    temperature=0.7,
    google_api_key=api_key
)

# Create memory for checkpointing (stores conversation history)
memory = ConversationBufferMemory(return_messages=True)

# Create a conversation chain with memory
conversation = ConversationChain(
    llm=llm,
    memory=memory,
    verbose=True  # Prints the conversation flow in terminal (for debugging)
)

def get_gemini_response(prompt: str) -> str:
    """
    Send user input to Gemini, keeping track of previous messages.
    """
    response = conversation.predict(input=prompt)
    return response
