from agents import writer_runnable , build_search_agent


def run_research_pipeline(topic :str) -> dict:
    state= {}


    search_agent = build_search_agent()
    search_result = search_agent.invoke({
        'messages' : [("user" , f"Find recent , reliable detailed info about:{skill}")]
    })

    state["search_results"] = search_result['messages'][-1].content 

    
    state['report'] = writer_runnable.invoke({
        "topic": topic , 
        "research": state["search_results"]
    })

    return state


if __name__ == "__main__":
    skill = input("\n Enter a research skill:"  )
    run_research_pipeline(skill) 