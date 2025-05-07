# This script is used to parse submitted meal 
# with OpenAI API key, we will optimize the food
# extraction part from AWS comprehend to GPT3.5 (LLM)
# to improve accruacy and robustness

from openai import OpenAI
client = OpenAI()

def parseMeal(input:str):
    response = client.responses.create(
        model="gpt-3.5-turbo",
        input = [
            {"role": "user", "content": input}
        ],
        temperature=0
    )
    return response.output_text

with open("prompt.txt") as f:
    # test 1
    prompt = f.read()
    input_text = "I had a bowl of rice and banana and a glass of milk for lunch"
    prompt = prompt.replace('"{user_input}"', input_text)
    print(parseMeal(prompt))
    # test 2
    input_text = "I eat two burrito and three chicken salad, and a can of coke"
    prompt = prompt.replace('"{user_input}"', input_text)
    print(parseMeal(prompt))
    # test 3
    input_text = "我吃了两个鸡蛋和一杯牛奶"
    prompt = prompt.replace('"{user_input}"', input_text)
    print(parseMeal(prompt))
    # test 4
    input_text = "today is a nice day"
    prompt = prompt.replace('"{user_input}"', input_text)
    print(parseMeal(prompt))