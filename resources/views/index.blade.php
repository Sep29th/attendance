<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="UTF-8" />
        <link rel="icon" type="image/png" href="{{ asset('storage/favicon-16x16.png') }}" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Attendance</title>
      </head>
      <body>
        <div id="root"></div>
        @vite(['resources/js/main.jsx'])
      </body>
</html>
