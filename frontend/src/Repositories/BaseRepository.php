<?php
    declare(strict_types=1);

    namespace A3emond\Devquest\Repositories;

    use A3emond\Devquest\DatabaseUtils\DbAccess;
    use A3emond\Devquest\Contracts\TableDefinition;
    use InvalidArgumentException;

    /**
     * BaseRepository
     *
     * Abstract base class for table repositories.
     * Implements common CRUD operations and SQL helpers.
     * Child classes must define table name and columns.
     */
    abstract class BaseRepository implements TableDefinition
    {
        /**
         * Returns the table name.
         * Must be implemented by child class.
         */
        abstract public static function table(): string;

        /**
         * Returns the list of columns in the table.
         * Must be implemented by child class.
         */
        abstract public static function columns(): array;

        /**
         * Returns the primary key column name.
         * Default is 'id'.
         */
        public static function primaryKey(): string { return 'id'; }

        /**
         * Constructor.
         * @param DbAccess $db Database access object.
         */
        public function __construct(protected DbAccess $db) {}

        /**
         * Finds a row by primary key.
         * @param int|string $id Row ID.
         * @param array $select Columns to select (optional).
         * @return array|null Row data or null if not found.
         */
        public function findById(int|string $id, array $select = []): ?array
        {
            $sel = $this->selectList($select);
            $sql = "SELECT {$sel} FROM " . $this->qi(static::table())
                . " WHERE " . $this->qi(static::primaryKey()) . " = :id LIMIT 1";
            return $this->db->fetchOne($sql, [':id' => $id]);
        }

        /**
         * Finds rows matching given conditions.
         * @param array $where Column-value pairs for WHERE clause.
         * @param array $select Columns to select (optional).
         * @param int|null $limit Max rows to return (optional).
         * @param int $offset Offset for results (optional).
         * @param array $orderBy Column-direction pairs for ORDER BY (optional).
         * @return array List of rows.
         */
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

        /**
         * Inserts a new row.
         * @param array $values Column-value pairs.
         * @return string|int Inserted row ID.
         * @throws InvalidArgumentException If values are empty.
         */
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

        /**
         * Updates a row by primary key.
         * @param int|string $id Row ID.
         * @param array $values Column-value pairs to update.
         * @return int Number of affected rows.
         */
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

        /**
         * Deletes a row by primary key.
         * @param int|string $id Row ID.
         * @return int Number of affected rows.
         */
        public function deleteById(int|string $id): int
        {
            $sql = "DELETE FROM " . $this->qi(static::table())
                . " WHERE " . $this->qi(static::primaryKey()) . " = :id";
            return $this->db->execute($sql, [':id' => $id]);
        }

        /**
         * Builds a comma-separated list of columns for SELECT.
         * Validates columns.
         * @param array $select Columns to select.
         * @return string Comma-separated column list.
         */
        protected function selectList(array $select): string
        {
            $cols = $select ?: static::columns();
            foreach ($cols as $c) $this->assertCol($c);
            return implode(', ', array_map([$this, 'qi'], $cols));
        }

        /**
         * Builds SQL WHERE clause and parameters.
         * Validates columns.
         * @param array $where Column-value pairs.
         * @return array [SQL string, parameters array]
         */
        protected function buildWhere(array $where): array
        {
            if (!$where) return ['', []];
            $parts = []; $params = [];
            foreach ($where as $col => $val) {
                $this->assertCol($col);
                $ph = ':w_' . $col;
                $parts[] = $this->qi($col) . " = " . $ph;
                $params[$ph] = $val;
            }
            return [implode(' AND ', $parts), $params];
        }

        /**
         * Builds SQL ORDER BY clause.
         * Validates columns.
         * @param array $order Column-direction pairs.
         * @return string SQL ORDER BY string.
         */
        protected function orderBy(array $order): string
        {
            $parts = [];
            foreach ($order as $col => $dir) {
                $this->assertCol($col);
                $dir = strtoupper((string)$dir) === 'DESC' ? 'DESC' : 'ASC';
                $parts[] = $this->qi($col) . " " . $dir;
            }
            return implode(', ', $parts);
        }

        /**
         * Validates that a column exists in the table.
         * @param string $c Column name.
         * @throws InvalidArgumentException If column is unknown.
         */
        protected function assertCol(string $c): void
        {
            if (!in_array($c, static::columns(), true)) {
                throw new InvalidArgumentException("Unknown column " . static::table() . ".{$c}");
            }
        }

        /**
         * Quotes an identifier (table or column name) for SQL.
         * Escapes backticks.
         * @param string $id Identifier.
         * @return string Quoted identifier.
         */
        protected function qi(string $id): string
        {
            return '`' . str_replace('`', '``', $id) . '`';
        }
    }