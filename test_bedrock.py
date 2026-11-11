
import os
import json
import boto3
from dotenv import load_dotenv
from botocore.exceptions import ClientError, NoCredentialsError

# Load environment variables from .env
load_dotenv()

MODEL_PROVIDER = os.getenv("MODEL_PROVIDER", "bedrock")
MODEL_ID = os.getenv("MODEL_ID", "apac.amazon.nova-pro-v1:0")

AWS_REGION = os.getenv("AWS_REGION", "ap-south-1")
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")


def test_bedrock():

    print("=" * 55)
    print("       AWS BEDROCK CONNECTION TEST")
    print("=" * 55)

    # 1. Validate configuration
    print("\n[1] Checking configuration...")

    if not AWS_ACCESS_KEY_ID or not AWS_SECRET_ACCESS_KEY:
        print("FAILED: AWS credentials missing in .env")
        return

    print(f"Provider : {MODEL_PROVIDER}")
    print(f"Model ID : {MODEL_ID}")
    print(f"Region   : {AWS_REGION}")
    print("Credentials: Present")

    try:
        # 2. Create AWS session
        session = boto3.Session(
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
            region_name=AWS_REGION
        )

        # 3. Test AWS authentication
        print("\n[2] Testing AWS authentication (STS)...")

        sts = session.client("sts")
        identity = sts.get_caller_identity()

        print("SUCCESS: AWS authentication working")
        print("Account ID:", identity["Account"])
        print("ARN:", identity["Arn"])

        # 4. Test Bedrock connectivity
        print("\n[3] Connecting to Amazon Bedrock...")

        bedrock = session.client(
            service_name="bedrock-runtime",
            region_name=AWS_REGION
        )

        # 5. Test model inference
        print("\n[4] Testing model inference...")

        response = bedrock.converse(
            modelId=MODEL_ID,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"text": "Reply with exactly: BEDROCK WORKING"}
                    ]
                }
            ],
            inferenceConfig={
                "maxTokens": 50,
                "temperature": 0
            }
        )

        result = response["output"]["message"]["content"][0]["text"]

        print("\nSUCCESS: Bedrock inference working!")
        print("Model response:", result)

        print("\n" + "=" * 55)
        print("ALL TESTS PASSED")
        print("AWS credentials and Bedrock model are working.")
        print("=" * 55)

    except NoCredentialsError:
        print("\nFAILED: AWS credentials could not be found.")

    except ClientError as e:
        error = e.response.get("Error", {})
        print("\nAWS ERROR:", error.get("Code"))
        print("Message:", error.get("Message"))

    except Exception as e:
        print("\nUNEXPECTED ERROR:", str(e))


if __name__ == "__main__":
    test_bedrock()
