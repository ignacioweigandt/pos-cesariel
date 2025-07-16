#!/usr/bin/env python3
"""
Test runner script for POS Cesariel backend.
Provides convenient commands for running different types of tests.
"""

import argparse
import subprocess
import sys
import os
from pathlib import Path


def run_command(command, description):
    """Run a command and handle its output."""
    print(f"\n🔄 {description}")
    print(f"Running: {' '.join(command)}")
    print("-" * 60)
    
    try:
        result = subprocess.run(command, cwd=Path(__file__).parent, check=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed with exit code {e.returncode}")
        return False


def run_unit_tests(verbose=False):
    """Run unit tests."""
    command = ["pytest", "tests/unit/", "-m", "unit"]
    if verbose:
        command.extend(["-v", "--tb=short"])
    
    return run_command(command, "Unit Tests")


def run_integration_tests(verbose=False):
    """Run integration tests."""
    command = ["pytest", "tests/integration/", "-m", "integration"]
    if verbose:
        command.extend(["-v", "--tb=short"])
    
    return run_command(command, "Integration Tests")


def run_websocket_tests(verbose=False):
    """Run WebSocket tests."""
    command = ["pytest", "tests/integration/test_websocket_real_time.py", "-m", "websocket"]
    if verbose:
        command.extend(["-v", "--tb=short"])
    
    return run_command(command, "WebSocket Tests")


def run_auth_tests(verbose=False):
    """Run authentication tests."""
    command = ["pytest", "-m", "auth"]
    if verbose:
        command.extend(["-v", "--tb=short"])
    
    return run_command(command, "Authentication Tests")


def run_slow_tests(verbose=False):
    """Run slow tests."""
    command = ["pytest", "-m", "slow"]
    if verbose:
        command.extend(["-v", "--tb=short"])
    
    return run_command(command, "Slow Tests")


def run_coverage_tests():
    """Run tests with coverage report."""
    command = [
        "pytest",
        "--cov=.",
        "--cov-report=term-missing",
        "--cov-report=html:htmlcov",
        "--cov-fail-under=80",
        "-v"
    ]
    
    return run_command(command, "Coverage Tests")


def run_all_tests(verbose=False, with_coverage=False):
    """Run all tests."""
    if with_coverage:
        return run_coverage_tests()
    
    command = ["pytest"]
    if verbose:
        command.extend(["-v", "--tb=short"])
    
    return run_command(command, "All Tests")


def run_specific_test(test_path, verbose=False):
    """Run a specific test file or test function."""
    command = ["pytest", test_path]
    if verbose:
        command.extend(["-v", "--tb=short"])
    
    return run_command(command, f"Specific Test: {test_path}")


def run_lint_checks():
    """Run linting checks."""
    success = True
    
    # Flake8
    if not run_command(
        ["flake8", ".", "--count", "--select=E9,F63,F7,F82", "--show-source", "--statistics"],
        "Flake8 Linting"
    ):
        success = False
    
    # Black
    if not run_command(["black", "--check", "."], "Black Formatting Check"):
        success = False
    
    # isort
    if not run_command(["isort", "--check-only", "."], "Import Sorting Check"):
        success = False
    
    return success


def run_type_checks():
    """Run type checking with mypy."""
    return run_command(["mypy", "."], "Type Checking")


def setup_test_environment():
    """Setup test environment."""
    print("🔧 Setting up test environment...")
    
    # Install test dependencies
    if not run_command(["pip", "install", "-r", "requirements.txt"], "Installing Dependencies"):
        return False
    
    # Setup test database
    try:
        from database import init_db
        init_db()
        print("✅ Test database initialized")
    except Exception as e:
        print(f"❌ Failed to initialize test database: {e}")
        return False
    
    return True


def clean_test_artifacts():
    """Clean test artifacts."""
    print("🧹 Cleaning test artifacts...")
    
    artifacts = [
        ".pytest_cache",
        "htmlcov",
        "coverage.xml",
        ".coverage",
        "__pycache__",
        "*.pyc",
    ]
    
    for artifact in artifacts:
        if os.path.exists(artifact):
            if os.path.isdir(artifact):
                subprocess.run(["rm", "-rf", artifact])
            else:
                subprocess.run(["rm", "-f", artifact])
    
    print("✅ Test artifacts cleaned")


def main():
    """Main function."""
    parser = argparse.ArgumentParser(description="POS Cesariel Backend Test Runner")
    parser.add_argument(
        "test_type",
        choices=[
            "unit", "integration", "websocket", "auth", "slow",
            "coverage", "all", "lint", "type", "setup", "clean", "specific"
        ],
        help="Type of tests to run"
    )
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Run tests in verbose mode"
    )
    parser.add_argument(
        "--with-coverage",
        action="store_true",
        help="Run tests with coverage (for 'all' test type)"
    )
    parser.add_argument(
        "--test-path",
        help="Specific test path (for 'specific' test type)"
    )
    
    args = parser.parse_args()
    
    print("🧪 POS Cesariel Backend Test Runner")
    print("=" * 50)
    
    success = True
    
    if args.test_type == "unit":
        success = run_unit_tests(args.verbose)
    elif args.test_type == "integration":
        success = run_integration_tests(args.verbose)
    elif args.test_type == "websocket":
        success = run_websocket_tests(args.verbose)
    elif args.test_type == "auth":
        success = run_auth_tests(args.verbose)
    elif args.test_type == "slow":
        success = run_slow_tests(args.verbose)
    elif args.test_type == "coverage":
        success = run_coverage_tests()
    elif args.test_type == "all":
        success = run_all_tests(args.verbose, args.with_coverage)
    elif args.test_type == "lint":
        success = run_lint_checks()
    elif args.test_type == "type":
        success = run_type_checks()
    elif args.test_type == "setup":
        success = setup_test_environment()
    elif args.test_type == "clean":
        clean_test_artifacts()
    elif args.test_type == "specific":
        if not args.test_path:
            print("❌ --test-path is required for 'specific' test type")
            sys.exit(1)
        success = run_specific_test(args.test_path, args.verbose)
    
    print("\n" + "=" * 50)
    if success:
        print("🎉 All operations completed successfully!")
        sys.exit(0)
    else:
        print("❌ Some operations failed!")
        sys.exit(1)


if __name__ == "__main__":
    main()