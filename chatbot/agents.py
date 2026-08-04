from langchain.agents import create_agent
from langchain_mistralai import ChatMistralAI
from dotenv import load_dotenv
from langchain_core.output_parsers import StrOutputParser
from tool import web_search
import os
import requests
from langchain_core.prompts import ChatPromptTemplate

load_dotenv()
llm = ChatMistralAI(model="mistral-small-latest", temperature=0)


def build_search_agent():
    return create_agent(
        model=llm ,
        tools=[web_search]
    )

writer_prompt= ChatPromptTemplate.from_messages([
    ('system' , "you are an expert mentor, coach, or advisor . write clearer , structred and insightful reports of the skill asked by the user. be detailed and factual"),
    ('human' , """write a detailed research report on the skill below
Topic : {skill}

structre report as:
     --skill overview
     --importance of skill in future
     --disadvantages of skill 
     --Roadmap to learn the skill
     --rate it out of 10

be deatailed and factual     
     """)
])


writer_runnable = writer_prompt | llm | StrOutputParser()
