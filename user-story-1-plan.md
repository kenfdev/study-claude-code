# ユーザーストーリー1「ユーザー登録・ログイン」実装計画

## ストーリー詳細
**As a** 新規ユーザー  
**I want to** アカウントを作成してログインしたい  
**So that** 自分専用のTodoリストを管理できる

## 受け入れ条件
- メールアドレスとパスワードでアカウント作成できる
- 作成したアカウントでログインできる
- ログイン状態が保持される
- 不正なログインは拒否される

## 1. API設計

### エンドポイント
```
POST /api/auth/register - ユーザー登録
POST /api/auth/login    - ログイン
POST /api/auth/logout   - ログアウト
GET  /api/auth/me       - 認証状態確認
```

### リクエスト/レスポンス形式

#### 登録 (POST /api/auth/register)
```typescript
// Request
{
  email: string;
  password: string;
}

// Response (成功)
{
  success: true;
  user: { id: number; email: string };
  token: string;
}

// Response (エラー)
{
  success: false;
  message: string;
}
```

#### ログイン (POST /api/auth/login)
```typescript
// Request
{
  email: string;
  password: string;
}

// Response (成功)
{
  success: true;
  user: { id: number; email: string };
  token: string;
}

// Response (エラー)
{
  success: false;
  message: string;
}
```

## 2. データベーステーブル設計

### usersテーブル
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 3. フロントエンド画面設計

### 登録画面 (/register)
- メールアドレス入力フィールド
- パスワード入力フィールド
- 登録ボタン
- ログイン画面へのリンク

### ログイン画面 (/login)
- メールアドレス入力フィールド
- パスワード入力フィールド
- ログインボタン
- 登録画面へのリンク

## 4. 認証フロー設計

1. **登録フロー**:
   - フォーム入力 → バリデーション → パスワードハッシュ化 → DB保存 → JWT発行 → トークン保存
2. **ログインフロー**:
   - フォーム入力 → バリデーション → パスワード照合 → JWT発行 → トークン保存
3. **認証状態管理**:
   - LocalStorageにJWTトークン保存
   - ページリロード時にトークン検証
   - 認証が必要なページでリダイレクト

## 5. テストケース設計

### バックエンドテスト
- **登録API**:
  - 正常な登録
  - 重複メールアドレスでエラー
  - 不正なメールアドレスでエラー
  - 空パスワードでエラー
- **ログインAPI**:
  - 正常なログイン
  - 存在しないユーザーでエラー
  - 間違ったパスワードでエラー

### フロントエンドテスト
- **登録画面**:
  - 正常な登録フロー
  - バリデーションエラー表示
  - ログイン画面への遷移
- **ログイン画面**:
  - 正常なログインフロー
  - エラーメッセージ表示
  - 登録画面への遷移

## 6. TDD実装順序

### Phase 1: バックエンドAPI (RED → GREEN)
1. 登録APIテスト作成
2. 登録API実装
3. ログインAPIテスト作成
4. ログインAPI実装

### Phase 2: フロントエンド画面 (RED → GREEN)
1. 登録画面コンポーネントテスト作成
2. 登録画面実装
3. ログイン画面コンポーネントテスト作成
4. ログイン画面実装

### Phase 3: 統合テスト (GREEN)
1. E2Eテストで全体フロー検証
2. 認証状態管理テスト

### Phase 4: リファクタリング (BLUE)
1. コード整理
2. エラーハンドリング改善
3. ユーザビリティ向上

## 実装ファイル構成

### バックエンド
- `functions/api/auth/register.ts` - 登録APIエンドポイント
- `functions/api/auth/login.ts` - ログインAPIエンドポイント
- `functions/api/auth/logout.ts` - ログアウトAPIエンドポイント
- `functions/api/auth/me.ts` - 認証状態確認APIエンドポイント
- `functions/lib/database.ts` - データベース接続・操作
- `functions/lib/auth.ts` - JWT関連ユーティリティ

### フロントエンド
- `app/routes/register.tsx` - 登録画面
- `app/routes/login.tsx` - ログイン画面
- `app/lib/auth.ts` - 認証関連ユーティリティ
- `app/components/AuthForm.tsx` - 認証フォームコンポーネント

### テスト
- `functions/api/auth/__tests__/` - APIテスト
- `app/routes/__tests__/` - フロントエンドテスト
- `e2e/auth.spec.ts` - E2Eテスト