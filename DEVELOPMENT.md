# Suze OS Development

## 当前开发基线

- 当前分支：`v3.1-cloud-sync`
- 最新 commit：`df2d26c654952400ae28f4ad64062d00d24d67c8`
- Commit 信息：`Suze OS V3.1: local data layer and job radar upgrade`

## 当前未完成

- Supabase 创建
- Auth
- 数据同步
- 云端数据库

## 当前开发约束

- V3.1 保持本地优先，不依赖后端服务。
- 浏览器数据统一通过 `storageService` 管理。
- 保留旧 `suze-os-v3` 数据结构和 V3.0 备份兼容性。
- Supabase、认证和云同步从 V3.2 开始接入。
