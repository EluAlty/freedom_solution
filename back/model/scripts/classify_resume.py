from pdf_to_text import pdf_to_text
from resume_classifier import ResumeClassifier
import os

def classify_resumes_from_folder(pdf_folder):
    # Создаем временную папку для txt файлов
    temp_txt_folder = "temp_txt"
    if not os.path.exists(temp_txt_folder):
        os.makedirs(temp_txt_folder)
    
    # Получаем список всех PDF файлов в папке
    pdf_files = [f for f in os.listdir(pdf_folder) if f.lower().endswith('.pdf')]
    results = {}
    
    # Конвертируем все PDF в текст
    pdf_to_text(pdf_folder, temp_txt_folder, pdf_files)
    
    # Классифицируем каждое резюме
    classifier = ResumeClassifier()
    
    for pdf_file in pdf_files:
        txt_filename = pdf_file.replace('.pdf', '.txt')
        txt_path = os.path.join(temp_txt_folder, txt_filename)
        
        if os.path.exists(txt_path):
            try:
                category = classifier.predict_category(txt_path)
                results[pdf_file] = category
            except Exception as e:
                print(f"Ошибка при обработке {pdf_file}: {str(e)}")
    
    # Очищаем временные файлы
    for file in os.listdir(temp_txt_folder):
        os.remove(os.path.join(temp_txt_folder, file))
    os.rmdir(temp_txt_folder)
    
    return results

# Пример использования
if __name__ == "__main__":
    # Создаём необходимые директории
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    cv_processing_dir = os.path.join(base_dir, "cv_processing")
    
    # Создаём директорию, если её нет
    if not os.path.exists(cv_processing_dir):
        os.makedirs(cv_processing_dir)
    
    # Проверяем наличие PDF файлов
    pdf_files = [f for f in os.listdir(cv_processing_dir) if f.lower().endswith('.pdf')]
    if not pdf_files:
        raise FileNotFoundError(
            f"PDF файлы не найдены в папке: {cv_processing_dir}\n"
            f"Пожалуйста, поместите PDF файлы резюме в эту папку"
        )
    
    # Классифицируем все резюме
    results = classify_resumes_from_folder(cv_processing_dir)
    
    # Выводим результаты
    print("\nРезультаты классификации:")
    print("-" * 50)
    for pdf_file, category in results.items():
        print(f"Файл: {pdf_file}")
        print(f"Категория: {category}")
        print("-" * 50) 