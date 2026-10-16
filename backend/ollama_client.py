import requests
import os


OLLAMA_URL = os.getenv(
    "OLLAMA_URL",
    "http://127.0.0.1:11434"
)

QWEN_MODEL = os.getenv(
    "QWEN_MODEL",
    "qwen2.5:1.5b"
)


def ask_qwen(prompt: str):

    url = f"{OLLAMA_URL}/api/generate"

    payload = {
        "model": QWEN_MODEL,
        "prompt": prompt,
        "stream": False,

        # Ask Ollama for JSON output
        "format": "json",

        "options": {
            "num_predict": 1500,
            "temperature": 0.2
        }
    }

    print("--------------------------------")
    print("PageGenieCraft → Ollama")
    print("URL:", url)
    print("Model:", QWEN_MODEL)
    print("Prompt length:", len(prompt))
    print("--------------------------------")

    try:

        response = requests.post(
            url,
            json=payload,
            timeout=300
        )

        print(
            "Ollama HTTP status:",
            response.status_code
        )

        response.raise_for_status()

        data = response.json()

        # Debug information
        print("Ollama response keys:", list(data.keys()))

        print(
            "Response length:",
            len(data.get("response", ""))
        )

        print(
            "Thinking length:",
            len(data.get("thinking", ""))
        )

        # Normal response
        result = data.get("response", "").strip()

        # Some Qwen responses may put generated content
        # into the thinking field instead.
        if not result:

            thinking = data.get("thinking", "").strip()

            if thinking:
                print(
                    "WARNING: Qwen response was empty."
                )
                print(
                    "Thinking was returned instead."
                )

                result = thinking

        if not result:

            print("FULL OLLAMA RESPONSE:")
            print(data)

            raise Exception(
                "Qwen returned an empty response."
            )

        print(
            "Final response length:",
            len(result)
        )

        return result

    except requests.exceptions.Timeout:

        raise Exception(
            "Ollama timed out after 300 seconds."
        )

    except requests.exceptions.ConnectionError:

        raise Exception(
            "Could not connect to Ollama at "
            f"{OLLAMA_URL}."
        )

    except requests.exceptions.RequestException as error:

        raise Exception(
            f"Ollama request failed: {error}"
        )
