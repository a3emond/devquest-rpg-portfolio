<?php

namespace A3emond\Devquest\Utils;

class Utils
{
    // function to send generic messages to the console (javascript)
    public static function consoleLog(string $message, string $color = 'black', bool $bold = false): void
    {
        $style = "color: $color; font-weight: " . ($bold ? 'bold' : 'normal') . ";";
        echo "<script>console.log('%c$message', '$style');</script>";
    }

}