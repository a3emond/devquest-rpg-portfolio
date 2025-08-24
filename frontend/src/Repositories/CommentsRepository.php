<?php
declare(strict_types=1);

namespace A3emond\Devquest\Repositories;

final class CommentsRepository extends BaseRepository
{
    protected const TABLE = 'comments';
    protected const COLUMNS = ['id','post_id','name','message','created_at'];
    protected const PK = 'id';

    public static function table(): string { return static::TABLE; }
    public static function columns(): array { return static::COLUMNS; }
    public static function primaryKey(): string { return static::PK; }
}