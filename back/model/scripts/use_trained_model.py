from transformers import BertForSequenceClassification
import torch

class ResumeMatcherPredictor(BertForSequenceClassification):
    def __init__(self):
        model = BertForSequenceClassification.from_pretrained(
            'bert-base-multilingual-cased',
            num_labels=2
        )
        super().__init__(model.config)
        self._device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.to(self._device)
    
    @property
    def device(self):
        return self._device