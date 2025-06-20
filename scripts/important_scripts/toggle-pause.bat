@echo off
cls
echo ========================================
echo    UNIKŌ CONTRACT PAUSE/UNPAUSE
echo ========================================
echo.
echo Contract: 0x7Ed40cce63DD95B448f26A5361Bef20143e6F49a
echo Network: Base Sepolia
echo.
echo This will toggle the contract's pause state.
echo When PAUSED: No minting allowed
echo When UNPAUSED: Minting allowed
echo.

cd ..
cd ..

set /p choice="Continue with pause/unpause toggle? (y/N): "
if /i "%choice%"=="y" (
    echo.
    echo Running pause/unpause script...
    echo.
    npx hardhat run scripts/admin/pause-unpause.js --network baseSepolia
    echo.
    echo Script completed. Check output above for results.
) else (
    echo.
    echo Operation cancelled.
)

echo.
echo ========================================
echo Press any key to close this window...
pause 