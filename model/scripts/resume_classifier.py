import tensorflow as tf
from transformers import AutoTokenizer, TFDistilBertForSequenceClassification
import json
import numpy as np
from sklearn.model_selection import train_test_split
import os
from sklearn.utils.class_weight import compute_class_weight

class ResumeClassifier:
    def __init__(self):
        # Загружаем конфигурацию модели
        with open("model/scripts/model_config.json", "r", encoding='utf-8') as config_file:
            self.config = json.load(config_file)
        
        self.max_length = self.config['architecture']['max_length']
        
        # Загружаем категории из JSON файла
        with open("model/scripts/categories.json", "r", encoding='utf-8') as file:
            self.labels_dict = json.load(file)
            
        # Инвертируем словарь для получения числовых меток
        self.label_to_id = {label: idx for label, idx in self.labels_dict.items()}
        self.id_to_label = {idx: label for label, idx in self.labels_dict.items()}
        
        # Загружаем предобученную модель
        self.model = TFDistilBertForSequenceClassification.from_pretrained(
            "distilbert-base-uncased",
            num_labels=len(self.labels_dict)
        )
        self.tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased")
        
    def initialize_labels(self, train_labels):
        unique_labels = sorted(set(train_labels))
        self.label_to_id = {label: idx for idx, label in enumerate(unique_labels)}
        self.id_to_label = {idx: label for label, idx in self.label_to_id.items()}
        self.num_labels = len(unique_labels)
    
    def train(self, train_texts, train_labels, epochs=5, batch_size=8, fine_tuning=False, class_weights=False):
        """
        Обучен��е модели с улучшенными параметрами
        """
        self.initialize_labels(train_labels)
        
        train_texts = list(map(str, train_texts))
        
        # Токенизация
        train_encodings = self.tokenizer(
            train_texts,
            truncation=True,
            padding=True,
            max_length=512,
            return_tensors="tf"
        )
        
        y = np.array([self.label_to_id[label] for label in train_labels])
        
        # Рассчитываем веса классов если необходимо
        if class_weights:
            weights = compute_class_weight(
                class_weight='balanced',
                classes=np.unique(y),
                y=y
            )
            class_weights_dict = dict(zip(np.unique(y), weights))
        else:
            class_weights_dict = None
        
        # Настраиваем оптимизатор
        learning_rate = 1e-5 if fine_tuning else 5e-5
        
        self.model.compile(
            optimizer=tf.keras.optimizers.Adam(learning_rate=learning_rate),
            loss=tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True),
            metrics=['accuracy']
        )
        
        dataset = tf.data.Dataset.from_tensor_slices((
            dict(train_encodings),
            y
        )).shuffle(1000).batch(batch_size)
        
        # Обучаем модель с весами классов
        history = self.model.fit(
            dataset,
            epochs=epochs,
            verbose=1,
            class_weight=class_weights_dict
        )
        
        return history
    
    def predict_category(self, text_or_path):
        """
        Предсказание категории для текста резюме или пути к файлу
        """
        # Определяем, получили мы путь к файлу или текст
        if isinstance(text_or_path, str) and os.path.exists(text_or_path):
            with open(text_or_path, 'r', encoding='utf-8') as file:
                text = file.read()
        else:
            text = text_or_path
        
        # Токенизируем текст
        inputs = self.tokenizer(
            text,
            truncation=True,
            padding=True,
            max_length=self.max_length,
            return_tensors='tf'
        )
        
        # Получаем предсказания
        outputs = self.model(inputs)
        predictions = tf.nn.softmax(outputs.logits, axis=-1)
        predicted_label_id = tf.argmax(predictions, axis=-1).numpy()[0]
        
        # Конвертируем числовую метку обратно в категорию
        return self.id_to_label[predicted_label_id]
    
    def save_model(self, path):
        """Сохранение модели и конфигурации"""
        self.model.save_pretrained(path)
        self.tokenizer.save_pretrained(path)
        self.save_model_config(path)
    
    def load_model(self, path):
        """Загрузка модели и конфигурации"""
        self.model = TFDistilBertForSequenceClassification.from_pretrained(path)
        self.load_model_config(path)
    
    def get_model_architecture(self):
        """Получение архитектуры модели"""
        return self.config['architecture']
    
    def save_model_config(self, path):
        """Сохранение конфигурации модели"""
        config_path = os.path.join(path, 'model_config.json')
        with open(config_path, 'w', encoding='utf-8') as f:
            json.dump(self.config, f, ensure_ascii=False, indent=4)
    
    def load_model_config(self, path):
        """Загрузка конфигурации модели"""
        config_path = os.path.join(path, 'model_config.json')
        if os.path.exists(config_path):
            with open(config_path, 'r', encoding='utf-8') as f:
                self.config = json.load(f)
            self.max_length = self.config['architecture']['max_length']
