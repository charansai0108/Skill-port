# 🔧 Troubleshooting Guide

This guide helps you resolve common issues when setting up and running the SkillPort Community project.

## 📋 Table of Contents

- [Node.js Issues](#nodejs-issues)
- [Database Issues](#database-issues)
- [Module Installation Issues](#module-installation-issues)
- [Environment Configuration](#environment-configuration)
- [Build and Runtime Errors](#build-and-runtime-errors)
- [Authentication Issues](#authentication-issues)
- [Platform-Specific Issues](#platform-specific-issues)

## 🟢 Node.js Issues

### Issue: Node.js Not Found
```
'node' is not recognized as an internal or external command
```

**Solution:**
1. Download Node.js from [https://nodejs.org/](https://nodejs.org/)
2. Install the LTS version (18.17.0 or higher)
3. Restart your terminal/command prompt
4. Verify installation: `node --version`

### Issue: Node.js Version Too Old
```
Error: Node.js version X.X.X is not supported
```

**Solution:**
1. Check current version: `node --version`
2. Download latest LTS from [https://nodejs.org/](https://nodejs.org/)
3. Install and restart terminal
4. Verify: `node --version` should show 18.17.0 or higher

### Issue: npm Not Found
```
'npm' is not recognized as an internal or external command
```

**Solution:**
1. npm usually comes with Node.js
2. Reinstall Node.js from [https://nodejs.org/](https://nodejs.org/)
3. Or install npm separately: `npm install -g npm`

## 🗄️ Database Issues

### Issue: Database Connection Failed
```
Error: Can't reach database server
```

**Solutions:**

#### For SQLite (Development):
```bash
# Check if database file exists
ls -la apps/web/dev.db

# If not, create it
cd apps/web
npx prisma migrate dev
```

#### For PostgreSQL:
```bash
# Check if PostgreSQL is running
# Windows: Check Services
# macOS: brew services list | grep postgresql
# Linux: sudo systemctl status postgresql

# Test connection
psql -h localhost -U your_username -d your_database
```

### Issue: Prisma Client Not Generated
```
Error: PrismaClient is not defined
```

**Solution:**
```bash
cd apps/web
npx prisma generate
```

### Issue: Migration Failed
```
Error: Migration failed
```

**Solution:**
```bash
cd apps/web

# Reset database (WARNING: This deletes all data)
npx prisma migrate reset

# Or create a new migration
npx prisma migrate dev --name fix-migration
```

### Issue: Database Schema Out of Sync
```
Error: The database schema is not in sync
```

**Solution:**
```bash
cd apps/web

# Push schema to database
npx prisma db push

# Or run migrations
npx prisma migrate dev
```

## 📦 Module Installation Issues

### Issue: Module Not Found
```
Error: Cannot find module 'module-name'
```

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Or use yarn
yarn install
```

### Issue: Permission Denied
```
Error: EACCES: permission denied
```

**Solution:**
```bash
# Fix npm permissions
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH

# Or use sudo (not recommended)
sudo npm install
```

### Issue: Network/Proxy Issues
```
Error: network timeout
```

**Solution:**
```bash
# Configure npm proxy
npm config set proxy http://proxy-server:port
npm config set https-proxy http://proxy-server:port

# Or use different registry
npm config set registry https://registry.npmjs.org/
```

## ⚙️ Environment Configuration

### Issue: Environment Variables Not Loaded
```
Error: DATABASE_URL is not defined
```

**Solution:**
1. Check if `.env` file exists in `apps/web/`
2. Copy from template: `cp .env.example .env`
3. Edit `.env` file with correct values
4. Restart the development server

### Issue: JWT Secret Not Set
```
Error: JWT_SECRET is required
```

**Solution:**
```bash
# Generate a random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Add to .env file
echo "JWT_SECRET=your-generated-secret" >> apps/web/.env
```

### Issue: Email Configuration
```
Error: Email service not configured
```

**Solution:**
For development, you can use a test email service or skip email verification:

```env
# In .env file
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
```

## 🏗️ Build and Runtime Errors

### Issue: TypeScript Errors
```
Error: Type 'X' is not assignable to type 'Y'
```

**Solution:**
```bash
# Check TypeScript version
npx tsc --version

# Update TypeScript
npm install -D typescript@latest

# Run type checking
npm run type-check
```

### Issue: Next.js Build Errors
```
Error: Failed to compile
```

**Solution:**
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try building again
npm run build
```

### Issue: Port Already in Use
```
Error: Port 3000 is already in use
```

**Solution:**
```bash
# Kill process on port 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001
```

## 🔐 Authentication Issues

### Issue: Login Not Working
```
Error: Invalid credentials
```

**Solution:**
1. Check if user exists in database: `npx prisma studio`
2. Verify password hashing in code
3. Check JWT secret configuration
4. Use demo credentials for testing

### Issue: OTP Not Working
```
Error: OTP verification failed
```

**Solution:**
1. Check email configuration in `.env`
2. Use demo OTP: `123456` for development
3. Check email service logs
4. Verify email templates

### Issue: Token Expired
```
Error: JWT token expired
```

**Solution:**
1. Clear browser storage
2. Login again
3. Check token expiration settings
4. Verify system clock

## 🖥️ Platform-Specific Issues

### Windows Issues

#### Issue: PowerShell Execution Policy
```
Error: cannot be loaded because running scripts is disabled
```

**Solution:**
```powershell
# Run as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### Issue: Long Path Names
```
Error: Path too long
```

**Solution:**
1. Enable long path support in Windows
2. Use shorter directory names
3. Move project to root directory (e.g., `C:\skillport`)

### macOS Issues

#### Issue: Permission Denied
```
Error: EACCES: permission denied
```

**Solution:**
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

#### Issue: Xcode Command Line Tools
```
Error: xcode-select: error
```

**Solution:**
```bash
# Install Xcode command line tools
xcode-select --install
```

### Linux Issues

#### Issue: Python Not Found
```
Error: python: command not found
```

**Solution:**
```bash
# Install Python
sudo apt-get update
sudo apt-get install python3 python3-pip

# Or on CentOS/RHEL
sudo yum install python3 python3-pip
```

#### Issue: Build Tools Missing
```
Error: gyp ERR! build error
```

**Solution:**
```bash
# Install build tools
sudo apt-get install build-essential

# Or on CentOS/RHEL
sudo yum groupinstall "Development Tools"
```

## 🆘 Getting Help

### Before Asking for Help

1. **Check the logs**: Look at terminal output for error messages
2. **Check the database**: Use `npx prisma studio` to inspect data
3. **Check environment variables**: Ensure all required variables are set
4. **Check Node.js version**: Ensure you're using Node.js 18.17.0 or higher
5. **Try the setup script**: Run `./setup.sh` (Linux/macOS) or `setup.bat` (Windows)

### When Asking for Help

Include the following information:
- Operating System and version
- Node.js version (`node --version`)
- npm version (`npm --version`)
- Complete error message
- Steps you've already tried
- Contents of your `.env` file (remove sensitive data)

### Useful Commands for Debugging

```bash
# Check Node.js and npm versions
node --version
npm --version

# Check if ports are in use
# Windows
netstat -ano | findstr :3000

# macOS/Linux
lsof -i :3000

# Check database connection
cd apps/web
npx prisma studio

# Check environment variables
cat .env

# Clear all caches
rm -rf node_modules package-lock.json .next
npm install
```

## 📚 Additional Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)

---

**Still having issues?** Create an issue on GitHub with the information above, and we'll help you resolve it! 🚀
