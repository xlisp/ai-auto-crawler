# crawler.py
import autogen
from typing import Dict, List
import json
import asyncio

# Configuration for the agents
config_list = [
    {
        "model": "gpt-4",
        "api_key": "YOUR_API_KEY"
    }
]

# Define the web crawler agent
class WebCrawlerAgent:
    def __init__(self):
        # Initialize Node.js process for Puppeteer
        self.process = None

    async def crawl(self, url: str) -> Dict:
        # Create Node.js process
        proc = await asyncio.create_subprocess_exec(
            'node', 'ai_crawler.js',
            stdin=asyncio.subprocess.PIPE,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        
        # Send URL to crawler
        url_data = json.dumps({"url": url}).encode()
        stdout, stderr = await proc.communicate(url_data)
        
        if stderr:
            raise Exception(f"Crawler error: {stderr.decode()}")
            
        return json.loads(stdout)

# Create the agents
assistant = autogen.AssistantAgent(
    name="assistant",
    llm_config={"config_list": config_list},
    system_message="You are an AI assistant that helps coordinate web crawling tasks."
)

crawler_agent = autogen.AssistantAgent(
    name="crawler",
    llm_config={"config_list": config_list},
    system_message="You are a web crawler agent that fetches and processes web content."
)

parser_agent = autogen.AssistantAgent(
    name="parser",
    llm_config={"config_list": config_list},
    system_message="You are a content parser that analyzes web content and extracts relevant information."
)

user_proxy = autogen.UserProxyAgent(
    name="user_proxy",
    human_input_mode="NEVER",
    max_consecutive_auto_reply=10,
    is_termination_msg=lambda x: "TERMINATE" in x.get("content", ""),
)

# Initialize the WebCrawlerAgent
web_crawler = WebCrawlerAgent()

async def process_question(question: str):
    # Start the conversation
    user_proxy.initiate_chat(
        assistant,
        message=f"I need help answering this question: {question}"
    )

    # Assistant delegates to crawler
    response = assistant.generate_reply(
        user_proxy,
        message=f"Let's crawl some relevant web pages to answer this question. Crawler, please help."
    )

    # Crawler performs the crawling
    try:
        crawled_data = await web_crawler.crawl("https://example.com")  # Replace with relevant URL
        
        # Parser analyzes the content
        parser_agent.generate_reply(
            crawler_agent,
            message=f"Please analyze this content to answer the question: {json.dumps(crawled_data)}"
        )
        
        # Final answer synthesis
        final_answer = assistant.generate_reply(
            parser_agent,
            message="Based on the parsed content, what is the answer to the original question?"
        )
        
        return final_answer
        
    except Exception as e:
        return f"Error during crawling: {str(e)}"

# Example usage
async def main():
    question = "What is the latest news about AI?"
    answer = await process_question(question)
    print(f"Answer: {answer}")

if __name__ == "__main__":
    asyncio.run(main())

