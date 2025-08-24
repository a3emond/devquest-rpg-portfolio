<?php
declare(strict_types=1);

namespace A3emond\Devquest\Repositories;

use A3emond\Devquest\DatabaseUtils\DbAccess;
use A3emond\Devquest\Contracts\TableDefinition;
use InvalidArgumentException;

abstract class BaseRepository implements TableDefinition
{
    abstract public static function table(): string;
    abstract public static function columns(): array;
    public static function primaryKey(): string { return 'id'; }
    public function __construct(protected DbAccess $db) {}

    public function findById(int|string $id, array $select = []): ?array
    {
        $sel = $this->selectList($select);
        $sql = "SELECT {$sel} FROM " . $this->qi(static::table())
            . " WHERE " . $this->qi(static::primaryKey()) . " = :id LIMIT 1";
        return $this->db->fetchOne($sql, [':id' => $id]);
    }

    // Parameters example:
    // $where = ['name' => 'Alice', 'age' => 30]
    // $select = ['id', 'name']
    // $limit = 10
    // $offset = 0
    // $orderBy = ['name' => 'ASC', 'age' => 'DESC']
    public function find(array $where = [], array $select = [], ?int $limit = null, int $offset = 0, array $orderBy = []): array
    {
        $sel = $this->selectList($select);
        $sql = "SELECT {$sel} FROM " . $this->qi(static::table());
        [$wsql, $params] = $this->buildWhere($where);
        if ($wsql !== '') $sql .= " WHERE {$wsql}";
        if ($orderBy)     $sql .= " ORDER BY " . $this->orderBy($orderBy);
        if ($limit !== null) {
            $sql .= " LIMIT :_limit OFFSET :_offset";
            $params[':_limit'] = $limit;
            $params[':_offset'] = $offset;
        }
        return $this->db->fetchAll($sql, $params);
    }

    public function insert(array $values): string|int
    {
        if (!$values) throw new InvalidArgumentException('Empty insert.');
        $cols = []; $phs = []; $params = [];
        foreach ($values as $col => $val) {
            $this->assertCol($col);
            $cols[] = $this->qi($col);
            $ph = ':' . $col;
            $phs[] = $ph;
            $params[$ph] = $val;
        }
        $sql = "INSERT INTO " . $this->qi(static::table())
            . " (" . implode(', ', $cols) . ") VALUES (" . implode(', ', $phs) . ")";
        $this->db->execute($sql, $params);
        $id = $this->db->lastInsertId();
        return $id !== '0' ? $id : 0;
    }

    public function updateById(int|string $id, array $values): int
    {
        if (!$values) return 0;
        $sets = []; $params = [':id' => $id];
        foreach ($values as $col => $val) {
            $this->assertCol($col);
            $ph = ':' . $col;
            $sets[] = $this->qi($col) . "=" . $ph;
            $params[$ph] = $val;
        }
        $sql = "UPDATE " . $this->qi(static::table())
            . " SET " . implode(', ', $sets)
            . " WHERE " . $this->qi(static::primaryKey()) . " = :id";
        return $this->db->execute($sql, $params);
    }

    public function deleteById(int|string $id): int
    {
        $sql = "DELETE FROM " . $this->qi(static::table())
            . " WHERE " . $this->qi(static::primaryKey()) . " = :id";
        return $this->db->execute($sql, [':id' => $id]);
    }

    // Returns comma-separated list of columns for SELECT
    // a $select array is a list of column names, or empty for all columns
    // e.g. ['id', 'name']
    protected function selectList(array $select): string
    {
        $cols = $select ?: static::columns();
        foreach ($cols as $c) $this->assertCol($c);
        return implode(', ', array_map([$this, 'qi'], $cols));
    }

    // Returns [sql string, params array]
    // a $where array is column => value pairs, combined with AND
    // e.g. ['name' => 'Alice', 'age' => 30]
    protected function buildWhere(array $where): array
    {
        if (!$where) return ['', []];
        $parts = []; $params = [];
        // loop through conditions
        foreach ($where as $col => $val) {
            $this->assertCol($col);
            $ph = ':w_' . $col;
            $parts[] = $this->qi($col) . " = " . $ph;
            $params[$ph] = $val;
        }
        return [implode(' AND ', $parts), $params];
    }

    protected function orderBy(array $order): string
    {
        $parts = [];
        foreach ($order as $col => $dir) {
            $this->assertCol($col);
            $dir = strtoupper((string)$dir) === 'DESC' ? 'DESC' : 'ASC'; // default ASC
            $parts[] = $this->qi($col) . " " . $dir; // e.g. `name` DESC
        }
        return implode(', ', $parts);
    }

    // Ensure column exists in table
    protected function assertCol(string $c): void
    {
        if (!in_array($c, static::columns(), true)) {
            throw new InvalidArgumentException("Unknown column " . static::table() . ".{$c}");
        }
    }

    // Quote identifier (table or column name)
    protected function qi(string $id): string
    {
        return '`' . str_replace('`', '``', $id) . '`';
    }
}