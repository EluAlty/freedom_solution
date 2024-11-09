import os
import PyPDF2

def pdf_to_text(pdf_folder, text_folder):
    if not os.path.exists(text_folder):
        os.makedirs(text_folder)
    
    for pdf_file in os.listdir(pdf_folder):
        if pdf_file.endswith('.pdf'):
            pdf_path = os.path.join(pdf_folder, pdf_file)
            text_file_name = pdf_file.replace('.pdf', '.txt')
            text_path = os.path.join(text_folder, text_file_name)

    
            if os.path.exists(text_path):
                print(f"Файл {text_file_name} уже существует, пропускаем.")
                continue

            
            with open(pdf_path, "rb") as file:
                reader = PyPDF2.PdfReader(file)
                text = ""
                for page in reader.pages:
                    text += page.extract_text()

          
            with open(text_path, "w", encoding="utf-8") as text_file:
                text_file.write(text)
            print(f"Сохранён текст из {pdf_file} в {text_file_name}.")


pdf_folder = "../cv_processing/cv_pdf"
text_folder = "../cv_processing/cv_txt"
pdf_to_text(pdf_folder, text_folder)
