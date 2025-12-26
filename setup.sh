#!/bin/bash

# Production Setup Script

echo "🚀 Setting up Elon Analytics for production..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env with your credentials before deploying"
fi

# Generate CRON_SECRET if not set
if ! grep -q "CRON_SECRET=" .env || grep -q "change_this_to_a_secure_random_string" .env; then
    echo "🔐 Generating secure CRON_SECRET..."
    SECRET=$(openssl rand -base64 32)
    if [ "$(uname)" == "Darwin" ]; then
        # macOS
        sed -i '' "s/CRON_SECRET=.*/CRON_SECRET=\"$SECRET\"/" .env
    else
        # Linux
        sed -i "s/CRON_SECRET=.*/CRON_SECRET=\"$SECRET\"/" .env
    fi
    echo "✅ CRON_SECRET generated"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env with your MongoDB URI and Twitter API credentials"
echo "2. Run 'npm run dev' to test locally"
echo "3. Deploy to Vercel with 'vercel'"
echo ""
echo "For detailed deployment instructions, see DEPLOYMENT.md"
