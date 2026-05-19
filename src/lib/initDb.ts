/**
 * 数据库初始化说明
 *
 * 由于 Supabase 的 DDL 操作需要 service_role 密钥，
 * 请按以下步骤手动初始化数据库：
 *
 * 1. 打开 Supabase 项目后台：https://supabase.com/dashboard
 * 2. 进入 SQL Editor
 * 3. 复制 src/lib/schema.sql 的全部内容
 * 4. 粘贴到 SQL Editor 中，点击 Run
 * 5. 进入 Storage → New Bucket → 创建名为 "images" 的公开 bucket
 *
 * 完成后，数据库和文件存储即可正常使用。
 */

export function isDbReady(): boolean {
  return true; // 占位，后续可添加实际检测逻辑
}
