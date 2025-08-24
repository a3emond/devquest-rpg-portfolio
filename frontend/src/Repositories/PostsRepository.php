<?php
declare(strict_types=1);

namespace A3emond\Devquest\Repositories;

final class PostsRepository extends BaseRepository
{
    // Optional constants for terseness, wrapped by the required static methods
    protected const TABLE = 'posts';
    protected const COLUMNS = ['id','title','content','media_url','media_type','created_at','updated_at'];
    protected const PK = 'id';

    public static function table(): string { return static::TABLE; }
    public static function columns(): array { return static::COLUMNS; }
    public static function primaryKey(): string { return static::PK; }
}