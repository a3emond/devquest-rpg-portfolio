<?php
declare(strict_types=1);

namespace A3emond\Devquest\Repositories;

final class LikesRepository extends BaseRepository
{
    protected const TABLE = 'likes';
    protected const COLUMNS = ['id','post_id','user_ip','created_at'];
    protected const PK = 'id';

    public static function table(): string { return static::TABLE; }
    public static function columns(): array { return static::COLUMNS; }
    public static function primaryKey(): string { return static::PK; }
}