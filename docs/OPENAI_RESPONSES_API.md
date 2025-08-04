# OpenAI Responses API Documentation

The Responses API is a new stateful API from OpenAI designed to be simpler and more flexible than previous APIs. It makes it easy to build advanced AI applications that use multiple tools, handle multi-turn conversations, and work with different types of data (not just text).

## Overview

Unlike older APIs—such as Chat Completions, which were built mainly for text, or the Assistants API, which can require a lot of setup—the Responses API is built from the ground up for:

- **Seamless multi-turn interactions** (carry on a conversation across several steps in a single API call)
- **Easy access to powerful hosted tools** (like file search, web search, and code interpreter)
- **Fine-grained control over the context** you send to the model
- **Stateful conversations** managed by OpenAI
- **Asynchronous and stateful operations** for complex, long-running reasoning

## Key Features

### 1. Stateful Conversations

The API maintains conversation state automatically, eliminating the need to manage conversation history manually.

### 2. Hosted Tools

Built-in support for:

- **Web Search** - Real-time web search capabilities
- **File Search** - Document and file analysis
- **Code Interpreter** - Python code execution in sandboxed environments
- **Image Generation** - Create and edit images
- **Remote MCP Servers** - Connect to Model Context Protocol servers

### 3. Multimodal Support

Native support for text, images, audio, and file inputs.

### 4. Background Tasks

Run long-running tasks asynchronously with status polling.

## Getting Started

### Basic Setup

```python
from openai import OpenAI
import os

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
```

### Simple Text Response

```python
response = client.responses.create(
    model="gpt-4o-mini",
    input="tell me a joke",
)

print(response.output[0].content[0].text)
```

**Output:**

```
Why did the scarecrow win an award?
Because he was outstanding in his field!
```

### Retrieving Responses

One key feature is that responses are stateful and can be retrieved:

```python
fetched_response = client.responses.retrieve(response_id=response.id)
print(fetched_response.output[0].content[0].text)
```

### Continuing Conversations

Continue conversations by referencing previous responses:

```python
response_two = client.responses.create(
    model="gpt-4o-mini",
    input="tell me another",
    previous_response_id=response.id
)

print(response_two.output[0].content[0].text)
```

### Forking Conversations

You can fork conversations at any point:

```python
response_forked = client.responses.create(
    model="gpt-4o-mini",
    input="I didn't like that joke, tell me another and explain the difference",
    previous_response_id=response.id  # Forking from the first response
)
```

## Hosted Tools

### Web Search

Incorporate real-time web search results:

```python
response = client.responses.create(
    model="gpt-4o",
    input="What's the latest news about AI?",
    tools=[{"type": "web_search"}]
)
```

### Code Interpreter

Execute Python code in a secure sandbox:

```python
response = client.responses.create(
    model="gpt-4o",
    tools=[
        {
            "type": "code_interpreter",
            "container": {"type": "auto"}
        }
    ],
    instructions="You are a personal math tutor. When asked a math question, write and run code using the python tool to answer the question.",
    input="I need to solve the equation 3x + 11 = 14. Can you help me?",
)
```

### Image Generation

Generate and edit images as part of conversations:

```python
response = client.responses.create(
    model="gpt-4o",
    input="Generate an image of a cat wearing a hat",
    tools=[{"type": "image_generation"}],
)

# Save the generated image
image_data = [
    output.result
    for output in response.output
    if output.type == "image_generation_call"
]

if image_data:
    import base64
    image_base64 = image_data[0]
    with open("cat_with_hat.png", "wb") as f:
        f.write(base64.b64decode(image_base64))
```

## Multimodal Inputs

### Text and Image Input

```python
response = client.responses.create(
    model="gpt-4o",
    input=[
        {
            "role": "user",
            "content": [
                {"type": "input_text", "text": "What's in this image?"},
                {
                    "type": "input_image",
                    "image_url": "https://example.com/image.jpg"
                }
            ]
        }
    ]
)
```

### Base64 Encoded Images

```python
import base64

def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")

base64_image = encode_image("path/to/image.jpg")

response = client.responses.create(
    model="gpt-4o",
    input=[
        {
            "role": "user",
            "content": [
                {"type": "input_text", "text": "Describe this image"},
                {
                    "type": "input_image",
                    "image_url": f"data:image/jpeg;base64,{base64_image}"
                }
            ]
        }
    ]
)
```

### File Input (PDF Support)

```python
# Upload PDF file first
file = client.files.create(
    file=open("document.pdf", "rb"),
    purpose="assistants"
)

response = client.responses.create(
    model="gpt-4o",
    input=[
        {
            "role": "user",
            "content": [
                {
                    "type": "input_file",
                    "file_id": file.id
                },
                {
                    "type": "input_text",
                    "text": "Summarize this PDF",
                }
            ]
        }
    ]
)
```

## Function Calling

```python
response = client.responses.create(
    model="gpt-4o",
    tools=[
        {
            "type": "function",
            "name": "get_weather",
            "description": "Get the weather for a location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {"type": "string"}
                },
                "required": ["location"]
            }
        }
    ],
    input=[{"role": "user", "content": "What's the weather in San Francisco?"}]
)

# Handle function calls
input_items = []
for output in response.output:
    if output.type == "function_call":
        if output.name == "get_weather":
            input_items.append({
                "type": "function_call_output",
                "call_id": output.call_id,
                "output": '{"temperature": "70 degrees"}'
            })

# Continue conversation with function results
second_response = client.responses.create(
    model="gpt-4o",
    previous_response_id=response.id,
    input=input_items
)
```

## Streaming

### Basic Streaming

```python
response = client.responses.create(
    model="gpt-4o",
    input="Tell me a story",
    stream=True
)

for event in response:
    if event.type == 'response.output_text.delta':
        print(event.delta, end='')
```

### Image Streaming

Stream partial images during generation:

```python
stream = client.responses.create(
    model="gpt-4o",
    input="Draw a beautiful landscape",
    stream=True,
    tools=[{"type": "image_generation", "partial_images": 2}]
)

for event in stream:
    if event.type == "response.image_generation_call.partial_image":
        idx = event.partial_image_index
        image_base64 = event.partial_image_b64
        image_bytes = base64.b64decode(image_base64)
        with open(f"landscape_partial_{idx}.png", "wb") as f:
            f.write(image_bytes)
```

## Background Tasks

For long-running operations, use background mode:

```python
# Start background task
response = client.responses.create(
    model="gpt-4o",
    input="Write a very long story",
    background=True
)

# Poll for completion
import time
while response.status in {"queued", "in_progress"}:
    print(f"Status: {response.status}")
    time.sleep(2)
    response = client.responses.retrieve(response.id)

print(f"Final status: {response.status}")
print(response.output_text)
```

### Background Streaming

```python
stream = client.responses.create(
    model="gpt-4o",
    input="Write a comprehensive analysis",
    background=True,
    stream=True
)

for event in stream:
    print(event)
```

### Cancel Background Tasks

```python
response = client.responses.cancel("resp_1234567890")
print(response.status)
```

## Remote MCP Servers

Connect to Model Context Protocol servers:

```python
response = client.responses.create(
    model="gpt-4o",
    tools=[
        {
            "type": "mcp",
            "server_label": "github",
            "server_url": "https://example.com/mcp-server",
            "require_approval": "never"
        }
    ],
    input="Query the repository information"
)
```

### MCP with Authentication

```python
response = client.responses.create(
    model="gpt-4o",
    tools=[
        {
            "type": "mcp",
            "server_label": "private_server",
            "server_url": "https://api.example.com/mcp",
            "headers": {
                "Authorization": "Bearer YOUR_API_KEY"
            }
        }
    ],
    input="Access private data"
)
```

## Advanced Features

### Manual Context Management

```python
inputs = [{"type": "message", "role": "user", "content": "What is AI?"}]

response = client.responses.create(
    model="gpt-4o",
    input=inputs
)

# Add response to context
inputs += response.output

# Add follow-up
inputs.append({
    "role": "user",
    "type": "message",
    "content": "Explain it simply"
})

second_response = client.responses.create(
    model="gpt-4o",
    input=inputs
)
```

### Response Management

```python
# List input items
input_items = client.responses.input_items.list("resp_12345")

# Delete response (data retained for 30 days by default)
client.responses.delete("resp_12345")
```

## Response Schema

### Basic Response Structure

```python
{
    "id": "resp_12345",
    "created_at": 1234567890.0,
    "model": "gpt-4o-2024-08-06",
    "object": "response",
    "status": "completed",
    "output": [
        {
            "id": "msg_67890",
            "content": [
                {
                    "text": "Response text here",
                    "type": "output_text"
                }
            ],
            "role": "assistant",
            "type": "message"
        }
    ],
    "usage": {
        "input_tokens": 20,
        "output_tokens": 50,
        "total_tokens": 70
    }
}
```

## Error Handling

```python
try:
    response = client.responses.create(
        model="gpt-4o",
        input="Hello world"
    )
except Exception as e:
    print(f"Error: {e}")
```

## Supported File Types

The Responses API supports various file formats for input:

| Extension  | MIME Type                                                               |
| ---------- | ----------------------------------------------------------------------- |
| .txt       | text/plain                                                              |
| .md        | text/markdown                                                           |
| .pdf       | application/pdf                                                         |
| .docx      | application/vnd.openxmlformats-officedocument.wordprocessingml.document |
| .csv       | text/csv                                                                |
| .json      | application/json                                                        |
| .py        | text/x-python                                                           |
| .js        | text/javascript                                                         |
| .html      | text/html                                                               |
| .jpg/.jpeg | image/jpeg                                                              |
| .png       | image/png                                                               |
| .gif       | image/gif                                                               |

## Comparison: Responses API vs Chat Completions API

### With Responses API (Single Call)

✅ Analyze multimodal input  
✅ Perform web search via hosted tool  
✅ Summarize results

### With Chat Completions API (Multiple Calls)

1️⃣ Upload and analyze content → 1 request  
2️⃣ Call external tools manually → separate process  
3️⃣ Submit tool results for summarization → another request

## Best Practices

1. **Use Background Mode** for long-running tasks
2. **Leverage Stateful Nature** to avoid managing conversation history
3. **Stream Responses** for better user experience
4. **Fork Conversations** to explore different paths
5. **Use Hosted Tools** instead of manual tool management
6. **Handle Errors Gracefully** with proper exception handling

## Limitations

- Background mode requires `store=true`
- Some features may have specific model requirements
- File upload limits: 100 pages and 32MB for PDFs
- Certain tools may not be available in all regions

---

_For the most up-to-date information, refer to the [OpenAI API Documentation](https://platform.openai.com/docs/api-reference/responses) and [OpenAI Cookbook](https://cookbook.openai.com/examples/responses_api/responses_example)._
