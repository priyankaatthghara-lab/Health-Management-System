@echo off
setlocal
if not exist out mkdir out
dir /s /b src\*.java > sources.txt
javac -cp "lib\h2-2.2.224.jar" -d out @sources.txt
del sources.txt
if errorlevel 1 (
    echo Compilation failed.
    exit /b 1
)
java -cp "out;lib\h2-2.2.224.jar" com.lifelink.Main
