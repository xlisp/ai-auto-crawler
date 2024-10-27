import autogen
from typing import Dict, List
import json
import asyncio
from pathlib import Path

# Configuration for the agents
config_list = [
    {
        "model": "gpt-4",
        "api_key": "YOUR_API_KEY"
    }
]

class WebCrawlerAgent:
    def __init__(self):
        self.process = None

    async def crawl(self, url: str, custom_code: str) -> Dict:
        proc = await asyncio.create_subprocess_exec(
            'node', 'crawler.js',
            stdin=asyncio.subprocess.PIPE,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        
        # Send URL and custom code to crawler
        input_data = json.dumps({
            "url": url,
            "customCode": custom_code
        }).encode()
        stdout, stderr = await proc.communicate(input_data)
        
        if stderr:
            raise Exception(f"Crawler error: {stderr.decode()}")
            
        return json.loads(stdout)

# Create the agents
assistant = autogen.AssistantAgent(
    name="assistant",
    llm_config={"config_list": config_list},
    system_message="You are an AI assistant that helps coordinate web crawling tasks."
)

js_code_generator = autogen.AssistantAgent(
    name="js_code_generator",
    llm_config={"config_list": config_list},
    system_message="""You are a JavaScript code generator specialized in creating Puppeteer crawling code.
    You generate code that will be injected into the page context for extraction.
    Always return only pure JavaScript code without markdown formatting."""
)

crawler_agent = autogen.AssistantAgent(
    name="crawler",
    llm_config={"config_list": config_list},
    system_message="You are a web crawler agent that executes crawling tasks with provided JavaScript code."
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

def generate_crawl_code(question: str, url: str) -> str:
    """Generate custom crawling code based on the question and URL."""
    prompt = f"""
    Generate JavaScript code for crawling {url} to answer the question: {question}
    The code should:
    1. Return an object with extracted data
    2. Use Puppeteer's page context
    3. Handle potential errors
    4. Be optimized for the specific question
    
    Return only the function code without any markdown or explanation.
    """
    
    response = js_code_generator.generate_reply(
        user_proxy,
        message=prompt
    )
    
    # Extract only the JavaScript code from the response
    code = response.get("content", "").strip()
    return code

async def process_question(question: str, url: str):
    # Start the conversation
    user_proxy.initiate_chat(
        assistant,
        message=f"I need to crawl {url} to answer this question: {question}"
    )

    # Generate custom crawling code
    custom_code = generate_crawl_code(question, url)
    
    # Log the generated code for debugging
    print(f"Generated JavaScript code:\n{custom_code}")

    # Execute crawling with custom code
    try:
        crawled_data = await web_crawler.crawl(url, custom_code)
        
        # Parser analyzes the content
        analysis = parser_agent.generate_reply(
            crawler_agent,
            message=f"Analyze this crawled content to answer the question: {json.dumps(crawled_data)}"
        )
        
        # Final answer synthesis
        final_answer = assistant.generate_reply(
            parser_agent,
            message=f"Based on the parsed content, please provide a comprehensive answer to: {question}"
        )
        
        return final_answer
        
    except Exception as e:
        return f"Error during crawling: {str(e)}"

# Example usage
async def main():
    question = "What are the latest AI research papers on the arXiv homepage?"
    url = "https://arxiv.org/list/cs.AI/recent"
    
    # Example of how the JS code generator might be used
    print("Generating custom crawling code...")
    custom_code = generate_crawl_code(question, url)
    print("\nExecuting crawl with generated code...")
    
    answer = await process_question(question, url)
    print(f"\nFinal Answer: {answer}")

if __name__ == "__main__":
    asyncio.run(main())

# Example of generated code for specific use cases
EXAMPLE_GENERATED_CODES = {
    "research_papers": """
    async function extractPapers() {
        const papers = [];
        const elements = document.querySelectorAll('.list-title');
        
        elements.forEach(el => {
            papers.push({
                title: el.textContent.trim(),
                link: el.querySelector('a')?.href,
                abstract: el.nextElementSibling?.textContent.trim()
            });
        });
        
        return {
            papers: papers.slice(0, 5),  // Get latest 5 papers
            timestamp: new Date().toISOString()
        };
    }
    """,
    
    "news_articles": """
    async function extractNews() {
        const articles = [];
        const headlines = document.querySelectorAll('article h1, article h2');
        
        headlines.forEach(h => {
            articles.push({
                title: h.textContent.trim(),
                url: h.closest('a')?.href,
                summary: h.closest('article')?.querySelector('p')?.textContent.trim()
            });
        });
        
        return {
            articles: articles.slice(0, 10),
            lastUpdated: document.querySelector('.last-updated')?.textContent
        };
    }
    """
}

