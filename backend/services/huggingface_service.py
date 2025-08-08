from huggingface_hub import InferenceClient
from ..config import HF_TOKEN_DISTILBERT, HF_TOKEN_BERT

class HuggingFaceService:
    def __init__(self):
        self.distilbert_client = InferenceClient(token=HF_TOKEN_DISTILBERT)
        self.bert_client = InferenceClient(token=HF_TOKEN_BERT)

    def classify_disaster_tweet(self, text):
        try:
            result = self.distilbert_client.text_classification(
                text, model="sacculifer/dimbat_disaster_type_distilbert"
            )
            return result
        except Exception as e:
            print(f"Error classifying disaster tweet: {e}")
            return None

    def detect_misinformation(self, text):
        try:
            result = self.bert_client.text_classification(
                text, model="cardiffnlp/twitter-roberta-base-irony"
            )
            return result
        except Exception as e:
            print(f"Error detecting misinformation: {e}")
            return None
