import os
os.environ['CUDA_VISIBLE_DEVICES'] = '-1'
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
os.environ['KMP_DUPLICATE_LIB_OK']='True'

import json
import tensorflow as tf
import tensorflow_hub as hub
import tensorflow_text as text
from transformers import pipeline, AutoTokenizer
import torch

# Установка параметров
torch.set_default_dtype(torch.float32)
device = torch.device('cpu')

def main():
    # Пути к папкам
    text_folder = r"src\cv_processing\cv_txt"
    processed_folder = r"src\cv_processing\processed_cv_json"
    
    print("Загрузка моделей...")
    models = setup_models()
    if not models:
        return
    
    print("Запуск обработки резюме...")
    if not os.path.exists(processed_folder):
        os.makedirs(processed_folder)
    
    # Обработка каждого файла
    for text_file in os.listdir(text_folder):
        if text_file.endswith('.txt'):
            print(f"\nОбработка файла: {text_file}")
            try:
                with open(os.path.join(text_folder, text_file), 'r', encoding='utf-8') as file:
                    text = file.read()
                
                # Обработка текста
                data = process_text(text, models)
                if data:
                    # Сохранение результатов
                    output_file = os.path.join(processed_folder, text_file.replace('.txt', '.json'))
                    with open(output_file, 'w', encoding='utf-8') as f:
                        json.dump(data, f, ensure_ascii=False, indent=2)
                    print(f"Успешно обработан файл: {text_file}")
                else:
                    print(f"Ошибка при обработке файла {text_file}")
            
            except Exception as e:
                print(f"Ошибка при обработке файла {text_file}: {str(e)}")

if __name__ == "__main__":
    main()

def setup_models():
    """Инициализация моделей"""
    print("Загрузка моделей...")
    
    try:
        # Загружаем базовую модель BERT для русского и английского
        model_name = "bert-base-multilingual-cased"
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        
        # NER для извлечения сущностей
        ner = pipeline('ner', 
                      model=model_name, 
                      tokenizer=tokenizer,
                      device=device,
                      aggregation_strategy="simple")
        
        return {
            'tokenizer': tokenizer,
            'ner': ner
        }
    except Exception as e:
        print(f"Ошибка при загрузке моделей: {str(e)}")
        return None

def process_text(text, models):
    """Обработка текста"""
    try:
        # Получаем NER результаты
        ner_results = models['ner'](text)
        
        # Извлекаем структурированные данные
        data = {
            "name": extract_name(text, ner_results),
            "contacts": extract_contact_info(text),
            "age": extract_age(text),
            "years_of_experience": None,
            "job_history": extract_work_experience(text, ner_results),
            "education": extract_education(text),
            "skills": extract_tech_stack(text)
        }
        
        return data
    except Exception as e:
        print(f"Ошибка при обработке текста: {str(e)}")
        return None

# Остальные функции остаются теми же