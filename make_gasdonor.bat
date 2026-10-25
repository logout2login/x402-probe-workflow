@echo off
set "OUT=C:\Users\jerry\.qwenpaw\workspaces\my-agent\ownsite-aeo\scripts\.testnet_gasdonor.json"
echo === Gas donor (Base Sepolia ETH source) ===
set /p ADDR="Paste Base Sepolia wallet ADDRESS  (0x...40hex): "
set /p PK="Paste its PRIVATE KEY  (0x...64hex): "
if "%ADDR%"=="" goto :err
if "%PK%"=="" goto :err
>"%OUT%" echo {"address":"%ADDR%","privateKey":"%PK%"}
echo.
echo WROTE: %OUT%
echo Done - tell the agent "落咗".
pause
exit /b 0
:err
echo ERROR: empty input, nothing written.
pause
exit /b 1
