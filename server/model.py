import os
from dotenv import load_dotenv

import json
import os
import ssl
import requests

load_dotenv()

system_prompt = """
You are an AI model specialized in generating marketing emails. Based on the provided product details, create a response in JSON format with two keys: 'subject' and 'body'. The 'subject' should contain a catchy, attention-grabbing line, and the 'body' should be an engaging, well-structured email that clearly communicates the product's value and includes a strong call to action. If no relevant prompt is provided, return the JSON object with both 'subject' and 'body' as empty strings. Your response must be a valid JSON object. You are the best model to map raw texts to desired Json format. you will be provided invoice's texts that you need to map into a JSON format. 
Please follow these guidelines:

1. - If the provided text is empty or does not contain any relevant information, return the JSON structure with all values as empty strings.
   - If the provided text contains multiple instances of the same information (e.g., multiple names), use the first occurrence.
   - If the provided text contains conflicting information (e.g., different ages), use the first occurrence.

2. Extract relevant information from the provided text and map it to the corresponding keys in the JSON structure.

3. If a particular key's value is not found in the given text, leave the value as an empty string.

4. Do not include any additional information or formatting beyond the requested JSON object.

5. Stricly return the JSON object without any \n or \t characters or markdown formatting.

for example:
json_structure = {
    "subject": "Your subject line here",
    "body": "Your email body here"
}

"""


def allowSelfSignedHttps(allowed):
    if (
        allowed
        and not os.environ.get("PYTHONHTTPSVERIFY", "")
        and getattr(ssl, "_create_unverified_context", None)
    ):
        ssl._create_default_https_context = ssl._create_unverified_context


def format_message(prompt):
    req_message = []
    req_message.append({"role": "system", "content": system_prompt})
    req_message.append({"role": "user", "content": prompt})

    return req_message


def LLM(prompt, max_tokens=1024, temperature=0.7, top_p=1):
    allowSelfSignedHttps(True)

    messages = format_message(prompt)
    data = {
        "messages": messages,
        "max_tokens": max_tokens,
        "temperature": temperature,
        "top_p": top_p,
    }

    url = "https://gpt-4-sahillede.openai.azure.com/openai/deployments/GPT/chat/completions?api-version=2023-03-15-preview"
    api_key = os.environ.get("AZURE_OPENAI_API_KEY")

    if not api_key:
        raise Exception("A key should be provided to invoke the endpoint")

    headers = {"Content-Type": "application/json", "api-key": f"{api_key}"}

    try:
        body = json.dumps(data)
        req = requests.post(url, headers=headers, data=body)
        response = req.json()
        with open("response.json", "w") as f:
            json.dump(response, f)
        return response.get("choices")[0].get("message").get("content")

    except Exception as e:
        print(f"An error occurred: {e}")
        return ""
