from transformers import BertTokenizer, BertForSequenceClassification
import torch
from torch.utils.data import Dataset, DataLoader
import json
import numpy as np
from tqdm import tqdm
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ResumeVacancyDataset(Dataset):
    def __init__(self, resume_texts, vacancy_texts, labels, tokenizer, max_len=512):
        self.resume_texts = resume_texts
        self.vacancy_texts = vacancy_texts
        self.labels = labels
        self.tokenizer = tokenizer
        self.max_len = max_len

    def __len__(self):
        return len(self.labels)

    def __getitem__(self, idx):
        resume_text = str(self.resume_texts[idx])
        vacancy_text = str(self.vacancy_texts[idx])
        label = self.labels[idx]

        # Кодируем пару текстов как в AI-career-consultant
        encoding = self.tokenizer.encode_plus(
            resume_text,
            vacancy_text,
            add_special_tokens=True,
            max_length=self.max_len,
            padding='max_length',
            truncation=True,
            return_attention_mask=True,
            return_token_type_ids=True,
            return_tensors='pt'
        )

        return {
            'input_ids': encoding['input_ids'].flatten(),
            'attention_mask': encoding['attention_mask'].flatten(),
            'token_type_ids': encoding['token_type_ids'].flatten(),
            'labels': torch.tensor(label, dtype=torch.long)
        }

class ResumeMatcher:
    def __init__(self):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        logger.info(f"Using device: {self.device}")

        self.tokenizer = BertTokenizer.from_pretrained('bert-base-multilingual-cased')
        self.model = BertForSequenceClassification.from_pretrained(
            'bert-base-multilingual-cased',
            num_labels=2
        ).to(self.device)

        # Гиперпараметры из AI-career-consultant
        self.MAX_LEN = 512
        self.TRAIN_BATCH_SIZE = 4
        self.VALID_BATCH_SIZE = 2
        self.EPOCHS = 6
        self.LEARNING_RATE = 1e-5
        self.MAX_GRAD_NORM = 10

    def prepare_data(self, data_path):
        """Подготовка данных из JSON файла"""
        logger.info("Loading and preparing data...")
        
        with open(data_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        resume_texts = []
        vacancy_texts = []
        labels = []

        for item in data:
            resume_texts.append(item['resume']['description'])
            vacancy_texts.append(item['vacancy']['description'])
            labels.append(1 if item['is_match'] else 0)

        return resume_texts, vacancy_texts, labels

    def train(self, train_data_path, valid_data_path=None):
        """Обучение модели"""
        # Подготовка данных
        train_texts_resume, train_texts_vacancy, train_labels = self.prepare_data(train_data_path)
        
        train_dataset = ResumeVacancyDataset(
            train_texts_resume,
            train_texts_vacancy,
            train_labels,
            self.tokenizer,
            self.MAX_LEN
        )

        train_dataloader = DataLoader(
            train_dataset,
            batch_size=self.TRAIN_BATCH_SIZE,
            shuffle=True
        )

        # Оптимизатор и планировщик
        optimizer = torch.optim.AdamW(
            self.model.parameters(),
            lr=self.LEARNING_RATE,
            eps=1e-8
        )

        total_steps = len(train_dataloader) * self.EPOCHS
        
        logger.info("Starting training...")
        
        for epoch in range(self.EPOCHS):
            logger.info(f'Epoch {epoch + 1}/{self.EPOCHS}')
            
            self.model.train()
            total_loss = 0

            for batch in tqdm(train_dataloader, desc="Training"):
                # Перемещаем данные на устройство
                input_ids = batch['input_ids'].to(self.device)
                attention_mask = batch['attention_mask'].to(self.device)
                token_type_ids = batch['token_type_ids'].to(self.device)
                labels = batch['labels'].to(self.device)

                # Очищаем градиенты
                self.model.zero_grad()

                # Прямой проход
                outputs = self.model(
                    input_ids=input_ids,
                    attention_mask=attention_mask,
                    token_type_ids=token_type_ids,
                    labels=labels
                )

                loss = outputs.loss
                total_loss += loss.item()

                # Обратный проход
                loss.backward()
                
                # Ограничение градиентов
                torch.nn.utils.clip_grad_norm_(
                    self.model.parameters(),
                    self.MAX_GRAD_NORM
                )

                optimizer.step()

            avg_train_loss = total_loss / len(train_dataloader)
            logger.info(f'Average training loss: {avg_train_loss}')

    def predict(self, resume_text, vacancy_text):
        """Предсказание соответствия резюме вакансии"""
        self.model.eval()
        
        encoding = self.tokenizer.encode_plus(
            resume_text,
            vacancy_text,
            add_special_tokens=True,
            max_length=self.MAX_LEN,
            padding='max_length',
            truncation=True,
            return_attention_mask=True,
            return_token_type_ids=True,
            return_tensors='pt'
        )

        input_ids = encoding['input_ids'].to(self.device)
        attention_mask = encoding['attention_mask'].to(self.device)
        token_type_ids = encoding['token_type_ids'].to(self.device)

        with torch.no_grad():
            outputs = self.model(
                input_ids=input_ids,
                attention_mask=attention_mask,
                token_type_ids=token_type_ids
            )
            
            probabilities = torch.softmax(outputs.logits, dim=1)
            match_probability = probabilities[0][1].item()

        return match_probability

    def save_model(self, path):
        """Сохранение модели"""
        torch.save(self.model.state_dict(), path)
        logger.info(f"Model saved to {path}")

    def load_model(self, path):
        """Загрузка модели"""
        self.model.load_state_dict(torch.load(path))
        logger.info(f"Model loaded from {path}") 