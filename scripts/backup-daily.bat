@echo off
cd /d D:\www\rp7\r7imoveis
call npm run backup >> backups\backup.log 2>&1
