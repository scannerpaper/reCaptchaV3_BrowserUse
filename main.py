import asyncio
import time
from dotenv import load_dotenv
load_dotenv()

from browser_use.llm import ChatOpenAI, ChatOllama
from browser_use import Agent, Controller, BrowserSession

OLLAMA_URL=http://127.0.0.1:11444

async def main():
    browser_session = BrowserSession(
        cdp_url='http://localhost:9222',
    )

    agent = Agent(
        task='''
        Navigate to https://v3.cheapernyhomes.com/ and fill out the form with the following information:
        -----
        username: admin, password: =m&8e@g90NAv
        -----
        Submit the form by clicking the login button. Make sure to submit the form before proceeding.
        Report the text on the page after submitting the form.
        ''',
        llm=ChatOllama(model="llama3:70b-instruct", host=OLLAMA_URL),
        browser_session=browser_session,
    )

    await agent.run()

if __name__ == '__main__':
    asyncio.run(main())
