package org.capstone.backend.utils.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {


    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponse> handleResponseStatusException(ResponseStatusException ex, HttpServletRequest request) {
        HttpStatus status = resolveStatus(ex);// ✅ Extract actual status

        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                status.value(),
                status.getReasonPhrase(),
                ex.getReason(), // ✅ Cleaner message than ex.getMessage()
                request.getRequestURI()
        );
        return new ResponseEntity<>(errorResponse, status);
    }


    @ExceptionHandler({
            BadRequestException.class,
            UnauthorizedException.class,
            ForbiddenException.class,
            ResourceNotFoundException.class,
            ConflictException.class,
            InternalServerErrorException.class
    })
    public ResponseEntity<ErrorResponse> handleCustomExceptions(RuntimeException ex, HttpServletRequest request) {
        HttpStatus status = resolveStatus(ex);

        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                status.value(),
                status.getReasonPhrase(),
                ex.getMessage(),
                request.getRequestURI()
        );
        return new ResponseEntity<>(errorResponse, status);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex, HttpServletRequest request) {
        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase(),
                ex.getMessage(),
                request.getRequestURI()
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    private HttpStatus resolveStatus(RuntimeException ex) {
        if (ex instanceof BadRequestException) return HttpStatus.BAD_REQUEST;
        if (ex instanceof UnauthorizedException) return HttpStatus.UNAUTHORIZED;
        if (ex instanceof ForbiddenException) return HttpStatus.FORBIDDEN;
        if (ex instanceof ResourceNotFoundException) return HttpStatus.NOT_FOUND;
        if (ex instanceof ConflictException) return HttpStatus.CONFLICT;
        if (ex instanceof InternalServerErrorException) return HttpStatus.INTERNAL_SERVER_ERROR;
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
}
