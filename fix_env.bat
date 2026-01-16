@echo off
set PATH=%PATH%;D:\NodeJS
cd /d "c:\Users\Administrator\OneDrive\Attachments\Desktop\Kaggle Hackthon\Swades_Assignment"
echo Installing @types/node...
call "D:\NodeJS\npm.cmd" install --save-dev @types/node
echo Installing @types/chrome...
call "D:\NodeJS\npm.cmd" install --save-dev @types/chrome
echo Build check...
call npm run build
pause
