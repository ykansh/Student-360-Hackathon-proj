from langchain.tools import tool
import requests
from bs4 import BeautifulSoup
from tavily import TavilyClient
from dotenv import load_dotenv
import os


load_dotenv()

Tavily = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))

#--------------------------------------------------------------

@tool
def web_search(query: str)-> str:
    """Search the web for recent and reliable information on a topic. Returns titles , URLs & snippets. """
    results= Tavily.search(
        query=query , 
        max_results = 5
    )

    out = []
    for r in results["results"]:
        out.append(
            f"Title : {r["title"]}\n URL : {r["url"]}\n Snippet : {r["content"][:300]}\n"
        )    

    return "\n----\n".join(results)