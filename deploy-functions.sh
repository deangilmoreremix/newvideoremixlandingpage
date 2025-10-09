#!/bin/bash

# Supabase Edge Functions Deployment Script
# This script deploys all admin functions to Supabase

echo "🚀 Starting Supabase Edge Functions Deployment"
echo "=============================================="

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Check if user is logged in
echo "🔍 Checking Supabase login status..."
if ! supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase. Please login first:"
    echo "supabase login"
    exit 1
fi

echo "✅ Supabase CLI is ready"

# List of functions to deploy
FUNCTIONS=(
    "admin-dashboard-stats"
    "admin-apps"
    "admin-features"
    "admin-users"
    "admin-purchases"
    "admin-subscriptions"
    "admin-products"
    "admin-videos"
)

# Deploy each function
for function in "${FUNCTIONS[@]}"; do
    echo ""
    echo "📦 Deploying $function..."
    if supabase functions deploy "$function" --no-verify-jwt; then
        echo "✅ Successfully deployed $function"
    else
        echo "❌ Failed to deploy $function"
        echo "Continuing with other functions..."
    fi
done

echo ""
echo "🎉 Deployment process completed!"
echo "=================================="
echo "Note: JWT verification is disabled in this script."
echo "Make sure to enable 'Verify JWT' in the Supabase dashboard for each function."
echo ""
echo "Function URLs will be available at:"
echo "https://YOUR_PROJECT_REF.supabase.co/functions/v1/{function-name}"