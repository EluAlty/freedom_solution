import pandas as pd
from resume_classifier import ResumeClassifier
import os

def prepare_training_data():
    """Подготовка данных для дообучения"""
    # Загружаем оба датасета
    gpt_df = pd.read_csv('gpt_dataset.csv')
    transformed_df = pd.read_csv('transformed_dataset.csv')
    
    # Очищаем данные
    gpt_df['Resume'] = gpt_df['Resume'].str.lower()
    gpt_df['Category'] = gpt_df['Category'].str.strip()
    
    transformed_df['Resume'] = transformed_df['Resume'].str.lower()
    transformed_df['Category'] = transformed_df['Category'].str.strip()
    
    # Объединяем датасеты
    df = pd.concat([gpt_df, transformed_df], ignore_index=True)
    
    # Добавляем специфичные примеры для мобильной разработки
    additional_data = pd.DataFrame({
        'Category': [
            'Android_Developer',
            'Android_Developer',
            'Android_Developer',
            'Mobile_Developer',
            'Mobile_Developer'
        ],
        'Resume': [
            "Android разработчик с опытом работы с Java, Kotlin и Android SDK, разработка нативных приложений",
            "Мобильный разработчик Android, опыт с Android Studio, Gradle, Google Play Services", 
            "Android developer с опытом Material Design, Room, Retrofit, Dagger",
            "Разработчик мобильных приложений для Android и iOS платформ",
            "Mobile developer с опытом разработки кроссплатформенных приложений"
        ]
    })
    
    # Объединяем с дополнительными данными
    df = pd.concat([df, additional_data], ignore_index=True)
    
    return df

def fine_tune_model(model_path='model/trained_models/resume_classifier'):
    """Дообучение модели на новых данных"""
    # Загружаем и подготавливаем данные
    print("Подготовка данных...")
    data = prepare_training_data()
    
    print(f"Всего примеров для обучения: {len(data)}")
    print("\nРаспределение категорий:")
    print(data['Category'].value_counts())
    
    # Инициализируем классификатор
    print("\nИнициализация классификатора...")
    classifier = ResumeClassifier()
    
    # Если есть сохраненная модель, загружаем её
    if os.path.exists(model_path):
        print("Загрузка существующей модели...")
        classifier.load_model(model_path)
    
    # Дообучаем модель
    print("\nНачинаем дообучение модели...")
    classifier.train(
        train_texts=data['Resume'].values,
        train_labels=data['Category'].values,
        epochs=5,  # Увеличиваем количество эпох
        batch_size=8,
        fine_tuning=True,
        class_weights=True  # Добавляем веса классов
    )
    
    # Сохраняем обновленную модель
    print("\nСохранение обновленной модели...")
    classifier.save_model(f"{model_path}_updated")
    
    return classifier

if __name__ == "__main__":
    fine_tune_model()