<?php
jsonResponse([
    "status" => "success",
    "message" => "Agapay PHP API is healthy",
    "version" => "1.0.0",
    "timestamp" => date('c'),
    "database" => $pdo ? "connected" : "disconnected"
]);
