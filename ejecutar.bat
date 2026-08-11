@echo off
echo Extrayendo imagenes del RTF y generando documento Word...
echo.

cd /d "C:\Users\Admin\Documents\INGENIERIA DE SOFTWARE\IV SEMESTRE\ARCHIVOS (.pptx .docx .pdf .xlsx)\APPS WELLNESS MENTAL\WellnessMentalApp(WEB)"

python simple_extract.py

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Proceso completado exitosamente
    echo Abre el documento Word generado
) else (
    echo.
    echo Hubo errores en el proceso
    echo Verifica que Python y las librerias esten instaladas
)

pause
