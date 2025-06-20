@echo off
cls
echo ========================================
echo    UNIKŌ CONTRACT FUND WITHDRAWAL
echo ========================================
echo.
echo Contract: 0x7Ed40cce63DD95B448f26A5361Bef20143e6F49a
echo Network: Base Sepolia
echo.
echo ⚠️  IMPORTANT: Contract withdraws to OWNER, not royalty recipient!
echo Contract Owner will receive funds, then manually transfer to:
echo Royalty Recipient: 0xE765185a42D623a99864C790a88cd29825d8A4b9
echo.
echo This will withdraw ALL funds from the contract
echo to the contract owner address.
echo.
echo ⚠️  WARNING: This action cannot be undone!
echo.

cd ..
cd ..

set /p choice="Continue with fund withdrawal? (y/N): "
if /i "%choice%"=="y" (
    echo.
    echo Running withdrawal script...
    echo.
    npx hardhat run scripts/admin/withdraw-funds.js --network baseSepolia
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