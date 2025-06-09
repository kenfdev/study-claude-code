# Todoアプリ開発ガイド - ユーザーストーリー実装

## プロダクト概要
**ターゲット**: 個人でタスク管理をしたい人
**価値提案**: シンプルで使いやすいタスク管理ツール

## 技術スタック
- Frontend: React Router v7 + TypeScript + Tailwind CSS
- Backend: Express + SQLite + TypeScript
- 認証: JWT + bcrypt
- テスト: vitest + supertest
- デプロイ: Cloudflare Pages + Workers

## ユーザーストーリー

### ストーリー1: ユーザー登録・ログイン
**As a** 新規ユーザー
**I want to** アカウントを作成してログインしたい
**So that** 自分専用のTodoリストを管理できる

**受け入れ条件**:
- メールアドレスとパスワードでアカウント作成できる
- 作成したアカウントでログインできる
- ログイン状態が保持される
- 不正なログインは拒否される

### ストーリー2: Todo作成
**As a** ログイン済みユーザー
**I want to** 新しいTodoを追加したい
**So that** やるべきことを記録できる

**受け入れ条件**:
- Todoのタイトルを入力して追加できる
- 追加したTodoがすぐに一覧に表示される
- 空のタイトルでは追加できない

### ストーリー3: Todo一覧表示
**As a** ログイン済みユーザー
**I want to** 自分のTodo一覧を見たい
**So that** 何をすべきか把握できる

**受け入れ条件**:
- 自分が作成したTodoのみ表示される
- 完了・未完了の状態が分かる
- Todoがない場合は適切なメッセージを表示

### ストーリー4: Todo完了
**As a** ログイン済みユーザー
**I want to** Todoを完了状態に変更したい
**So that** 終わったタスクを管理できる

**受け入れ条件**:
- チェックボックスで完了状態を切り替えできる
- 完了したTodoは視覚的に区別される
- 完了状態はすぐに保存される

### ストーリー5: Todo削除
**As a** ログイン済みユーザー
**I want to** 不要なTodoを削除したい
**So that** リストを整理できる

**受け入れ条件**:
- 削除ボタンでTodoを削除できる
- 削除前に確認メッセージが表示される
- 削除したTodoは即座に一覧から消える

## 実装ルール
- 1ストーリー = 1機能 = 1コミット
- vitest でTDD実装
- TypeScript strict mode必須
- ユーザビリティを重視したUI設計

## データベース設計
users テーブル: id, email, password_hash, created_at
todos テーブル: id, user_id, title, completed, created_at