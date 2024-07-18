<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;

class ResponseMiddlewareCustom
{
    public function handle(Request $request, Closure $next)
    {
        $tempResponse = $next($request);

        if(isset($tempResponse->original["message"]))

        return $tempResponse;

        return response()->json([
            'path' => $request->url(),
            'timestamp' => now(),
            'statusCode' => $tempResponse->getStatusCode(),
            'success' => $tempResponse->original
        ], $tempResponse->getStatusCode());

    }
}

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->api(prepend: [ResponseMiddlewareCustom::class]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (HttpException|ValidationException $e, Request $request) {
            if ($request->is('api/*')) {
                $response = [
                    'path' => $request->url(),
                    'timestamp' => now(),
                    'statusCode' => $e->status ?? $e->getStatusCode(),
                    'message' => $e->getMessage()
                ];
                if ($e instanceof ValidationException) {
                    $response["errors"] = $e->validator->errors();
                }
                return response()->json($response, $e->status ?? $e->getStatusCode());
            }
        });
    })->create();
