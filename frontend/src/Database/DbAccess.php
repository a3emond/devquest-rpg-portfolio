<?php
declare(strict_types=1);

namespace A3emond\Devquest\Database;

use PDO;
use PDOException;
use RuntimeException;

final class DbAccess
{
    private ?PDO $pdo = null;

    public function __construct(
        private readonly string $dsn,
        private readonly string $user = '',
        private readonly string $pass = '',
        private readonly array $options = []
    ) {}


    public static function fromEnv(): self
    {
        $dsn  = $_ENV['DB_DSN']  ?? '';
        $user = $_ENV['DB_USER'] ?? '';
        $pass = $_ENV['DB_PASS'] ?? '';

        if ($dsn === '') {
            throw new RuntimeException('DB_DSN is not set.');
        }

        $defaultOpts = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];

        return new self($dsn, $user, $pass, $defaultOpts);
    }

    /** Get the underlying PDO (connects on first use). */
    public function pdo(): PDO
    {
        if ($this->pdo === null) {
            try {
                $this->pdo = new PDO($this->dsn, $this->user, $this->pass, $this->options);
            } catch (PDOException $e) {
                // Re-throw as generic runtime to avoid leaking credentials
                throw new RuntimeException('Database connection failed.', previous: $e);
            }
        }
        return $this->pdo;
    }

    /** Quick connection test — returns true if connection works. */
    public function testConnection(): bool
    {
        try {
            $this->pdo(); // will throw if connection fails
            return true;
        } catch (\Throwable) {
            return false;
        }
    }

    /** Run a SELECT and get all rows. */
    public function fetchAll(string $sql, array $params = []): array
    {
        $stmt = $this->pdo()->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(); // FETCH_ASSOC by default
    }

    /** Run a SELECT and get the first row or null. */
    public function fetchOne(string $sql, array $params = []): ?array
    {
        $stmt = $this->pdo()->prepare($sql);
        $stmt->execute($params);
        $row = $stmt->fetch();
        return $row !== false ? $row : null;
    }

    /** Run a SELECT and get a single column (first row). */
    public function fetchColumn(string $sql, array $params = [], int $column = 0): mixed
    {
        $stmt = $this->pdo()->prepare($sql);
        $stmt->execute($params);
        $val = $stmt->fetchColumn($column);
        return $val !== false ? $val : null;
    }

    /** Run INSERT/UPDATE/DELETE; returns affected rows. */
    public function execute(string $sql, array $params = []): int
    {
        $stmt = $this->pdo()->prepare($sql);
        $stmt->execute($params);
        return $stmt->rowCount();
    }

    /** Convenience: returns last inserted id (string per PDO). */
    public function lastInsertId(?string $name = null): string
    {
        return $this->pdo()->lastInsertId($name);
    }

    // Transactions
    public function begin(): void { $this->pdo()->beginTransaction(); }
    public function commit(): void { $this->pdo()?->commit(); }
    public function rollback(): void
    {
        $pdo = $this->pdo();
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
    }

    /** Helper to run a closure inside a transaction. Rolls back on exception. */
    public function transactional(callable $fn): mixed
    {
        $this->begin();
        try {
            $result = $fn($this);
            $this->commit();
            return $result;
        } catch (\Throwable $t) {
            $this->rollback();
            throw $t;
        }
    }
}
