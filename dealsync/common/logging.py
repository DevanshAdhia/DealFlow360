import logging
import json
from typing import Any


class StructuredLogger:
    """A structured logging wrapper that outputs JSON-compatible log entries."""

    def __init__(self, name: str):
        self.logger = logging.getLogger(name)

    def _log(self, level: int, message: str, **context: Any) -> None:
        extra = {"structured": context} if context else {}
        self.logger.log(level, message, extra=extra)

    def info(self, message: str, **context: Any) -> None:
        self._log(logging.INFO, message, **context)

    def warning(self, message: str, **context: Any) -> None:
        self._log(logging.WARNING, message, **context)

    def error(self, message: str, **context: Any) -> None:
        self._log(logging.ERROR, message, **context)

    def debug(self, message: str, **context: Any) -> None:
        self._log(logging.DEBUG, message, **context)

    def critical(self, message: str, **context: Any) -> None:
        self._log(logging.CRITICAL, message, **context)


def get_logger(name: str) -> StructuredLogger:
    """Get a structured logger for the given module name."""
    return StructuredLogger(name)
