# RewriteBot Database Documentation

## Overview

RewriteBot uses PostgreSQL as its primary database, managed through Prisma ORM. The database stores user accounts, provider configurations, documents, history, and all related metadata.

## Database Schema

### Users Table (`users`)

Stores user account information.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| email | String | Unique email address |
| password_hash | String | Argon2 hashed password |
| name | String | User's display name |
| created_at | Timestamp | Account creation time |
| updated_at | Timestamp | Last update time |

### Sessions Table (`sessions`)

Manages authentication sessions.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to users |
| refresh_token_hash | String | Hashed refresh token |
| expires_at | Timestamp | Token expiration |
| created_at | Timestamp | Session creation time |

### Providers Table (`providers`)

Stores AI provider configurations.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to users |
| name | String | Provider display name |
| type | String | Provider type (nvidia, ollama, etc.) |
| protocol | String | Communication protocol |
| base_url | String | API endpoint URL (optional) |
| authentication_type | String | Auth method |
| model_id | String | Selected model (optional) |
| is_default | Boolean | Whether this is the default provider |
| connection_status | String | Connection state |
| last_tested | Timestamp | Last connection test |
| options | JSON | Provider-specific options |
| created_at | Timestamp | Creation time |
| updated_at | Timestamp | Last update time |

### Provider Credentials Table (`provider_credentials`)

Stores encrypted API credentials.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| provider_id | UUID | Foreign key to providers (unique) |
| encrypted_api_key | String | AES-256-GCM encrypted key |
| encryption_iv | String | Initialization vector |
| encryption_tag | String | Authentication tag |
| additional_config | JSON | Additional encrypted config |
| created_at | Timestamp | Creation time |
| updated_at | Timestamp | Last update time |

### Documents Table (`documents`)

User documents.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to users |
| title | String | Document title |
| content | Text | Document content |
| is_favorite | Boolean | Favorite flag |
| is_archived | Boolean | Archived flag |
| created_at | Timestamp | Creation time |
| updated_at | Timestamp | Last update time |

### Document Versions Table (`document_versions`)

Version history for documents.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| document_id | UUID | Foreign key to documents |
| input | Text | Input text |
| output | Text | Generated output |
| mode | String | Paraphrase mode used |
| provider_id | UUID | Foreign key to providers |
| model_id | String | Model used |
| synonym_level | Integer | Synonym replacement level |
| frozen_terms | String[] | Preserved terms |
| language | String | Language code |
| statistics | JSON | Document statistics |
| created_at | Timestamp | Creation time |

### History Events Table (`history_events`)

Global generation history.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to users |
| document_id | UUID | Foreign key to documents (optional) |
| operation | String | Operation type |
| mode | String | Mode used |
| provider_id | UUID | Foreign key to providers |
| model_id | String | Model used |
| input | Text | Input text |
| output | Text | Generated output |
| statistics | JSON | Operation statistics |
| latency | Integer | Generation time (ms) |
| success | Boolean | Whether operation succeeded |
| error_message | Text | Error message if failed |
| created_at | Timestamp | Event time |

### Custom Modes Table (`custom_modes`)

User-defined paraphrase modes.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to users |
| name | String | Mode name |
| instruction | Text | Custom instructions |
| created_at | Timestamp | Creation time |

**Unique constraint**: (user_id, name)

### User Preferences Table (`user_preferences`)

User settings and preferences.

| Column | Type | Description |
|--------|------|-------------|
| user_id | UUID | Primary key, foreign key to users |
| default_mode | String | Default paraphrase mode |
| default_language | String | Default language |
| default_synonym_level | Integer | Default synonym level (1-4) |
| default_provider_id | UUID | Default provider (optional) |
| default_model_id | String | Default model (optional) |
| auto_save | Boolean | Auto-save documents |
| theme | String | UI theme (light/dark/system) |
| updated_at | Timestamp | Last update time |

## Indexes

Performance indexes are automatically created by Prisma:

- `users.email` (unique)
- `providers.user_id`
- `providers.user_id + is_default`
- `documents.user_id`
- `documents.user_id + is_favorite`
- `documents.user_id + is_archived`
- `documents.user_id + created_at`
- `document_versions.document_id`
- `document_versions.document_id + created_at`
- `history_events.user_id`
- `history_events.user_id + created_at`
- `history_events.user_id + operation`
- `custom_modes.user_id`

## Relationships

```
User
  ├── Sessions (one-to-many)
  ├── Providers (one-to-many)
  ├── Documents (one-to-many)
  ├── History Events (one-to-many)
  ├── Custom Modes (one-to-many)
  └── User Preferences (one-to-one)

Provider
  ├── Provider Credentials (one-to-one)
  ├── Document Versions (one-to-many)
  └── History Events (one-to-many)

Document
  └── Document Versions (one-to-many)
```

## Setup

### Initial Setup

1. Ensure PostgreSQL is running
2. Set `DATABASE_URL` in `.env`
3. Run initialization:

**Unix/Mac:**
```bash
cd server
chmod +x scripts/init-db.sh
./scripts/init-db.sh
```

**Windows:**
```powershell
cd server
.\scripts\init-db.ps1
```

### Manual Setup

```bash
cd server

# Generate Prisma Client
npx prisma generate

# Create and apply migrations
npx prisma migrate dev

# Seed database
npm run db:seed
```

## Migrations

### Create a new migration

```bash
npx prisma migrate dev --name <migration_name>
```

### Apply migrations in production

```bash
npx prisma migrate deploy
```

### Reset database (development only)

```bash
npx prisma migrate reset
```

## Prisma Studio

View and edit data in a GUI:

```bash
npm run db:studio
```

Opens at http://localhost:5555

## Backup and Restore

### Backup

```bash
pg_dump $DATABASE_URL > backup.sql
```

### Restore

```bash
psql $DATABASE_URL < backup.sql
```

## Security Considerations

### Credential Encryption

Provider API keys are encrypted before storage:

1. Generate random IV (initialization vector)
2. Encrypt using AES-256-GCM with `CREDENTIAL_ENCRYPTION_KEY`
3. Store encrypted value, IV, and authentication tag
4. Never log or expose unencrypted credentials

### Password Hashing

User passwords use Argon2:

- Algorithm: Argon2id
- Memory cost: 65536 KB
- Time cost: 3 iterations
- Parallelism: 4 threads

### Session Management

- Refresh tokens are hashed before storage
- Sessions expire after configured duration
- Tokens can be invalidated by deleting session record

## Performance Optimization

### Connection Pooling

Prisma uses connection pooling by default. Configure in `DATABASE_URL`:

```
postgresql://user:pass@host:5432/db?connection_limit=10
```

### Query Optimization

- All foreign keys have indexes
- User-scoped queries use composite indexes
- Pagination uses cursor-based or offset pagination

### Caching

- Provider model lists cached in Redis
- Provider health status cached in Redis
- Frequently accessed user preferences cached

## Monitoring

### Key Metrics

- Connection pool utilization
- Query execution time
- Failed queries
- Database size growth
- Index usage

### Slow Query Logging

Enable in PostgreSQL config:

```sql
ALTER DATABASE rewritebot SET log_min_duration_statement = 1000;
```

## Troubleshooting

### Connection Issues

```bash
# Test connection
npx prisma db push --skip-generate

# View connection string (redacted)
npx prisma db execute --stdin <<< "SELECT version();"
```

### Migration Issues

```bash
# Check migration status
npx prisma migrate status

# Resolve migration conflicts
npx prisma migrate resolve --applied <migration_name>
```

### Reset Development Database

```bash
# Warning: This deletes all data
npx prisma migrate reset
```

## Maintenance

### Regular Tasks

1. **Vacuum** (PostgreSQL maintenance)
   ```sql
   VACUUM ANALYZE;
   ```

2. **Index Maintenance**
   ```sql
   REINDEX DATABASE rewritebot;
   ```

3. **Update Statistics**
   ```sql
   ANALYZE;
   ```

### Archival Strategy

Old history events can be archived:

1. Export events older than N months
2. Store in cold storage
3. Delete from database
4. Keep aggregate statistics

## References

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Argon2 Specification](https://github.com/P-H-C/phc-winner-argon2)
