from services import resume as ResumeService
from sqlalchemy.orm import Session
from fastapi import Depends
import os
from services import vacancy
from database import get_db
import requests

# import google.generativeai as genai

# # Hardcode your API key here
# API_KEY = "AIzaSyBFnrypLPV0VZ1YBytYOq3jA8YZouW3nME"

# # Configure the API with your hardcoded API key
# genai.configure(api_key=API_KEY)

# # Initialize the Gemini model
# model = genai.GenerativeModel('gemini-1.5-flash')

# # Path to the PDF file in the 'files' folder
# file_path = "./resumes/CV Roman Vasilyev Android Dev.pdf" 
# file_path2 = "./resumes/AlikhanMazhikenCV (2).pdf"
# sample_file = genai.upload_file(path=file_path, display_name="CV_Roman_Vasilyev_Android_Dev.pdf")
# sample_file2 = genai.upload_file(path=file_path2, display_name="AlikhanMazhikenCV_(2).pdf")
# sample_file2 = genai.upload_file(path=file_path2, display_name="AlikhanMazhikenCV_(2).pdf")
# sample_file2 = genai.upload_file(path=file_path2, display_name="AlikhanMazhikenCV_(2).pdf")
# sample_file2 = genai.upload_file(path=file_path2, display_name="AlikhanMazhikenCV_(2).pdf")
# sample_file2 = genai.upload_file(path=file_path2, display_name="AlikhanMazhikenCV_(2).pdf")
# sample_file2 = genai.upload_file(path=file_path2, display_name="AlikhanMazhikenCV_(2).pdf")
# sample_file2 = genai.upload_file(path=file_path2, display_name="AlikhanMazhikenCV_(2).pdf")
# sample_file2 = genai.upload_file(path=file_path2, display_name="AlikhanMazhikenCV_(2).pdf")
# sample_file2 = genai.upload_file(path=file_path2, display_name="AlikhanMazhikenCV_(2).pdf")
# sample_file2 = genai.upload_file(path=file_path2, display_name="AlikhanMazhikenCV_(2).pdf")
# sample_file2 = genai.upload_file(path=file_path2, display_name="AlikhanMazhikenCV_(2).pdf")
# sample_file2 = genai.upload_file(path=file_path2, display_name="AlikhanMazhikenCV_(2).pdf")
# # Confirm upload
# print(f"Uploaded file '{sample_file.display_name}' as: {sample_file.uri}")
# print(f"Uploaded file '{sample_file2.display_name}' as: {sample_file2.uri}")

# # Generate content using the uploaded document
# response = model.generate_content([sample_file, sample_file2, "You are a smart resume checker machine. Which of these two resumes is appropriate on position Android Developer? Give the exact file name in format 'filename.pdf' Please avoid any other information except filename"])

# # Print the generated content
# print(response.text)

# print(ResumeService.get_resume_by_id("5b3483da0008abdf0e00b0c1c07537436d7767"))



