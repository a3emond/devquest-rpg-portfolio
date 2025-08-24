<?php
declare(strict_types=1);

namespace A3emond\Devquest\Contracts;

interface TableDefinition
{
    public static function table(): string;
    public static function columns(): array;
    public static function primaryKey(): string;
};