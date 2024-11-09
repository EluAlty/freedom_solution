import pandas as pd
from resume_classifier import ResumeClassifier
from sklearn.model_selection import train_test_split
import tensorflow as tf
import os

def prepare_dataset(csv_path='D:\\Datathon\\datathon\\freedom_solution\\UpdatedResumeDataSet.csv'):
    # Загружаем датасет
    df = pd.read_csv(csv_path)
    
    # Очищаем данные
    df['Resume'] = df['Resume'].str.lower()
    df['Category'] = df['Category'].str.strip()
    
    # Выводим информацию о датасете
    print(f"\nРазмер датасета: {len(df)} записей")
    print("\nРаспределение по категориям:")
    print(df['Category'].value_counts())
    
    # Разделяем на тренировочную и тестовую выборки
    train_texts, test_texts, train_labels, test_labels = train_test_split(
        df['Resume'].values, 
        df['Category'].values,
        test_size=0.2,
        random_state=42,
        stratify=df['Category']
    )
    
    return train_texts, test_texts, train_labels, test_labels

def main():
    # Инициализируем классификатор
    classifier = ResumeClassifier()
    
    # Загружаем и подготавливаем данные
    print("Подготовка данных...")
    train_texts, test_texts, train_labels, test_labels = prepare_dataset()
    
    print(f"\nРазмер тренировочной выборки: {len(train_texts)}")
    print(f"Размер тестовой выборки: {len(test_texts)}")
    
    # Создаем директорию для сохранения модели
    model_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'trained_models')
    if not os.path.exists(model_dir):
        os.makedirs(model_dir)
    
    # Обучаем модель
    print("\nНачинаем обучение модели...")
    classifier.train(
        train_texts=train_texts,
        train_labels=train_labels,
        epochs=10,
        batch_size=8
    )
    
    # Сохраняем обученную модель
    model_path = os.path.join(model_dir, 'resume_classifier')
    print(f"\nСохраняем модель в: {model_path}")
    classifier.save_model(model_path)
    
    # Оцениваем модель на тестовой выборке
    print("\nОцениваем модель на тестовой выборке...")
    correct = 0
    total = len(test_texts)
    
    for text, true_label in zip(test_texts, test_labels):
        predicted = classifier.predict_category(text)
        if predicted == true_label:
            correct += 1
    
    accuracy = correct / total
    print(f"\nТочность на тестовой выборке: {accuracy:.2%}")

if __name__ == "__main__":
    main()