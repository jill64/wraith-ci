# SQL Cheat Sheet

## Create Table

```sql
CREATE TABLE `user` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `created_at` DATETIME NOT NULL  DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);
```

```sql
CREATE TABLE `repo_env` (
  `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  `created_at` TEXT NOT NULL,
  `updated_at` TEXT NOT NULL,
  `created_by` INTEGER NOT NULL,
  `updated_by` INTEGER NOT NULL,
  `repo_id` INTEGER NOT NULL,
  `key` TEXT NOT NULL,
  `value` TEXT NOT NULL
);
```

## Add Column

```sql
ALTER TABLE `user` ADD `name` TEXT NOT NULL;
```

## Add Foreign Key

```sql
ALTER TABLE `job` ADD FOREIGN KEY (`created_by`) REFERENCES `user`(`id`);
```

## Add Index

```sql
ALTER TABLE `job` ADD INDEX `created_by` (`created_by`);
```

## Add Unique Index

```sql
CREATE UNIQUE INDEX index_name ON cluster (`name`, `owner_id`);
```

## Delete Foreign Key

```sql
ALTER TABLE `job` DROP FOREIGN KEY `job_ibfk_1`;
```

## Delete Table

```sql
DROP TABLE `user`;
```
