<?php

$lat = $_GET['lat'];
$lon = $_GET['lon'];
$url = "https://nominatim.openstreetmap.org/reverse?format=json&lat=$lat&lon=$lon";
$options = [
    "http" => [
        "header" => "User-Agent: NotesleApp/1.0 (email@example.com)\r\n"
    ]
];
$response = file_get_contents($url, false, stream_context_create($options));
$data = json_decode($response, true);

$address = $data['address'] ?? [];

$city = $address['city'] ?? $address['town'] ?? $address['village'] ?? $address['county'] ?? null;

$state = $address['state'] ?? null;

$short_location = $city ? ($state ? "$city, $state" : $city) : "Lokasi tidak dikenal";

echo json_encode(['display_name' => $short_location]);

