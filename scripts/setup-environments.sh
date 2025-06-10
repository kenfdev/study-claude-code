#!/bin/bash

# ブランチごとのD1データベース作成スクリプト
# 使用方法: ./scripts/setup-environments.sh [environment]

set -e

ENVIRONMENT=${1:-development}

echo "🚀 環境 $ENVIRONMENT のD1データベースを作成中..."

# 環境別データベース名
case $ENVIRONMENT in
  "development")
    DB_NAME="todo-app-db-dev"
    ;;
  "staging")
    DB_NAME="todo-app-db-staging"
    ;;
  "production")
    DB_NAME="todo-app-db"
    ;;
  *)
    echo "❌ 不正な環境: $ENVIRONMENT"
    echo "使用可能な環境: development, staging, production"
    exit 1
    ;;
esac

# D1データベース作成
echo "📊 D1データベース '$DB_NAME' を作成中..."
DB_ID=$(wrangler d1 create $DB_NAME --output json | jq -r '.database_id')

if [ "$DB_ID" = "null" ] || [ -z "$DB_ID" ]; then
  echo "❌ データベース作成に失敗しました"
  exit 1
fi

echo "✅ データベース作成完了: $DB_NAME (ID: $DB_ID)"

# wrangler.tomlを更新
echo "📝 wrangler.toml のデータベースID更新中..."

if [ "$ENVIRONMENT" = "production" ]; then
  # 本番環境の場合、メインのdatabase_idを更新
  sed -i.bak "s/database_id = \".*\"/database_id = \"$DB_ID\"/" wrangler.toml
else
  # 開発/ステージング環境の場合、該当環境のIDを更新
  sed -i.bak "/\[env\.$ENVIRONMENT\]/,/\[\[env\.$ENVIRONMENT\.d1_databases\]\]/{ 
    s/database_id = \"placeholder-.*-db-id\"/database_id = \"$DB_ID\"/
  }" wrangler.toml
fi

# バックアップファイル削除
rm -f wrangler.toml.bak

# スキーマを適用
echo "🗄️  データベーススキーマを適用中..."
if [ "$ENVIRONMENT" = "production" ]; then
  wrangler d1 execute $DB_NAME --file=schema.sql
else
  wrangler d1 execute $DB_NAME --file=schema.sql --env=$ENVIRONMENT
fi

# JWT_SECRETをランダム生成して設定
echo "🔑 JWT_SECRET を設定中..."
JWT_SECRET=$(openssl rand -base64 32)

if [ "$ENVIRONMENT" = "production" ]; then
  echo "$JWT_SECRET" | wrangler secret put JWT_SECRET
else
  echo "$JWT_SECRET" | wrangler secret put JWT_SECRET --env=$ENVIRONMENT
fi

echo "✅ 環境 $ENVIRONMENT のセットアップ完了!"
echo "📋 データベース情報:"
echo "   名前: $DB_NAME"
echo "   ID: $DB_ID"
echo "   環境: $ENVIRONMENT"

# GitHub Secretsに設定すべき値を表示
if [ "$ENVIRONMENT" = "production" ]; then
  API_URL="https://todo-app-api.${CF_ACCOUNT_ID}.workers.dev"
elif [ "$ENVIRONMENT" = "staging" ]; then
  API_URL="https://todo-app-api-staging.${CF_ACCOUNT_ID}.workers.dev"
else
  API_URL="https://todo-app-api-dev.${CF_ACCOUNT_ID}.workers.dev"
fi

echo ""
echo "🔧 GitHub Secrets設定値:"
echo "   CLOUDFLARE_API_TOKEN: <your-api-token>"
echo "   CLOUDFLARE_ACCOUNT_ID: <your-account-id>"
echo "   ${ENVIRONMENT^^}_API_URL: $API_URL"