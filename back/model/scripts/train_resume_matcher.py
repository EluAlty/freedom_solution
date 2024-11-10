from resume_bert_matcher import ResumeMatcher
import torch
from sklearn.metrics import classification_report
import numpy as np
from tqdm import tqdm
import logging
import os
import pandas as pd

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ResumeMatcherTrainer:
    def __init__(self):
        self.resume_dataset_path = r'D:\Datathon\datathon\freedom_solution\UpdatedResumeDataSet.csv'
        
        if not os.path.exists(self.resume_dataset_path):
            raise FileNotFoundError(f"Resume dataset not found at {self.resume_dataset_path}")
        
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.matcher = ResumeMatcher()
        self.matcher.model.to(self.device)
        
        self.EPOCHS = 1
        self.TRAIN_BATCH_SIZE = 16
        self.VALID_BATCH_SIZE = 8
        self.LEARNING_RATE = 2e-5
        
        self.base_path = r'D:\Datathon\datathon\freedom_solution\model'
        
        logger.info(f"Using device: {self.device}")
        logger.info(f"Resume dataset path: {self.resume_dataset_path}")

    def prepare_data(self):
        """Подготовка данных из CSV файла"""
        logger.info("Loading CSV dataset...")
        df = pd.read_csv(self.resume_dataset_path)
        
        # Обрезаем слишком длинные тексты резюме
        df['Resume'] = df['Resume'].str[:1000]  # Ограничиваем длину текста
        
        logger.info(f"Loaded {len(df)} resumes")
        logger.info("Dataset columns:")
        logger.info(df.columns.tolist())
        
        pairs = []
        categories = df['Category'].unique()
        
        logger.info("Creating training pairs...")
        for idx, row in tqdm(df.iterrows(), total=len(df)):
            # Создаем более короткие тексты
            resume_text = row['Resume'][:500]  # Ограничиваем длину резюме
            
            # Положительный пример
            pairs.append({
                'resume_text': resume_text,
                'vacancy_text': f"{row['Category']} position",  # Очень короткий текст вакансии
                'label': 1
            })
            
            # Отрицательный пример
            other_category = np.random.choice([c for c in categories if c != row['Category']])
            pairs.append({
                'resume_text': resume_text,
                'vacancy_text': f"{other_category} position",
                'label': 0
            })
            
        np.random.shuffle(pairs)
        
        split_idx = int(len(pairs) * 0.8)
        train_pairs = pairs[:split_idx]
        test_pairs = pairs[split_idx:]
        
        logger.info(f"Created {len(pairs)} pairs total")
        logger.info(f"Training pairs: {len(train_pairs)}")
        logger.info(f"Test pairs: {len(test_pairs)}")
        
        return train_pairs, test_pairs

    def train_model(self):
        """Обучение модели"""
        logger.info("Preparing training data...")
        train_pairs, test_pairs = self.prepare_data()
        
        optimizer = torch.optim.AdamW(
            self.matcher.model.parameters(),
            lr=self.LEARNING_RATE
        )
        
        for epoch in range(self.EPOCHS):
            logger.info(f"\nEpoch {epoch+1}/{self.EPOCHS}")
            
            self.matcher.model.train()
            total_loss = 0
            
            for i in tqdm(range(0, len(train_pairs), self.TRAIN_BATCH_SIZE), desc="Training"):
                batch = train_pairs[i:i + self.TRAIN_BATCH_SIZE]
                
                # Обновленные параметры токенизации
                inputs = self.matcher.tokenizer(
                    [pair['resume_text'] for pair in batch],
                    [pair['vacancy_text'] for pair in batch],
                    padding='max_length',
                    truncation=True,
                    max_length=256,  # Уменьшаем максимальную длину
                    return_tensors="pt",
                    return_overflowing_tokens=False,  # Отключаем предупреждения
                    stride=0  # Отключаем перекрытие
                )
                
                labels = torch.tensor([pair['label'] for pair in batch]).to(self.device)
                inputs = {k: v.to(self.device) for k, v in inputs.items()}
                
                optimizer.zero_grad()
                outputs = self.matcher.model(**inputs, labels=labels)
                loss = outputs.loss
                
                loss.backward()
                optimizer.step()
                
                total_loss += loss.item()
            
            avg_loss = total_loss / (len(train_pairs) / self.TRAIN_BATCH_SIZE)
            logger.info(f"Average training loss: {avg_loss:.4f}")
            
            if epoch % 2 == 0:
                self.evaluate(test_pairs)
        
        # Сохраняем модель после обучения
        try:
            self.save_model()
        except Exception as e:
            logger.error(f"Ошибка при сохранении модели: {e}")

    def evaluate(self, test_pairs):
        """Оценка модели"""
        self.matcher.model.eval()
        predictions = []
        true_labels = []
        
        with torch.no_grad():
            for i in tqdm(range(0, len(test_pairs), self.VALID_BATCH_SIZE), desc="Evaluating"):
                batch = test_pairs[i:i + self.VALID_BATCH_SIZE]
                
                # Те же параметры токенизации
                inputs = self.matcher.tokenizer(
                    [pair['resume_text'] for pair in batch],
                    [pair['vacancy_text'] for pair in batch],
                    padding='max_length',
                    truncation=True,
                    max_length=256,
                    return_tensors="pt",
                    return_overflowing_tokens=False,
                    stride=0
                )
                
                inputs = {k: v.to(self.device) for k, v in inputs.items()}
                outputs = self.matcher.model(**inputs)
                preds = torch.argmax(outputs.logits, dim=1).cpu().numpy()
                
                predictions.extend(preds)
                true_labels.extend([pair['label'] for pair in batch])
        
        logger.info("\nEvaluation metrics:")
        logger.info(classification_report(true_labels, predictions))

    def save_model(self):
        """Сохранение обученной модели"""
        try:
            save_path = r'D:\Datathon\datathon\freedom_solution\model\trained_models\best_resume_matcher.pt'
            logger.info(f"Попытка сохранения модели в {save_path}")
            
            # Сохраняем модель
            torch.save(self.matcher.model.state_dict(), save_path)
            
            # Проверяем, что файл создан
            if os.path.exists(save_path):
                logger.info(f"Модель успешно сохранена. Размер файла: {os.path.getsize(save_path)} байт")
            else:
                logger.error("Файл модели не был создан!")
                
        except Exception as e:
            logger.error(f"Ошибка при сохранении модели: {str(e)}")
            raise

def main():
    trainer = ResumeMatcherTrainer()
    trainer.train_model()
    trainer.save_model()

if __name__ == "__main__":
    main() 