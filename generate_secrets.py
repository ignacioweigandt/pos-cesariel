#!/usr/bin/env python3
"""
Secrets Generator for POS Cesariel

Generates secure random secrets for use in .env files.
This script does NOT write to .env automatically - it only generates values
that you can copy manually.

Usage:
    python3 generate_secrets.py
    python3 generate_secrets.py --all  # Generate all secrets at once
"""

import secrets
import string
import argparse
import sys


def generate_password(length=32):
    """Generate a secure random password."""
    chars = string.ascii_letters + string.digits + string.punctuation
    # Ensure at least one of each type
    password = [
        secrets.choice(string.ascii_lowercase),
        secrets.choice(string.ascii_uppercase),
        secrets.choice(string.digits),
        secrets.choice(string.punctuation),
    ]
    # Fill the rest
    password += [secrets.choice(chars) for _ in range(length - 4)]
    # Shuffle
    secrets.SystemRandom().shuffle(password)
    return ''.join(password)


def generate_jwt_key():
    """Generate a URL-safe JWT secret key."""
    return secrets.token_urlsafe(32)


def generate_api_key():
    """Generate an API key."""
    return secrets.token_hex(16)


def print_secret(name, value, description=""):
    """Print a secret in a formatted way."""
    print(f"\n{'='*60}")
    print(f"  {name}")
    print(f"{'='*60}")
    if description:
        print(f"Description: {description}")
    print(f"\nValue:")
    print(f"  {value}")
    print(f"\nCopy to .env:")
    print(f"  {name}={value}")
    print(f"{'='*60}")


def main():
    parser = argparse.ArgumentParser(
        description="Generate secure secrets for POS Cesariel"
    )
    parser.add_argument(
        "--all",
        action="store_true",
        help="Generate all secrets at once"
    )
    parser.add_argument(
        "--db-password",
        action="store_true",
        help="Generate database password only"
    )
    parser.add_argument(
        "--jwt-key",
        action="store_true",
        help="Generate JWT secret key only"
    )
    parser.add_argument(
        "--length",
        type=int,
        default=32,
        help="Length for password (default: 32)"
    )
    
    args = parser.parse_args()
    
    # If no specific option, show menu
    if not any([args.all, args.db_password, args.jwt_key]):
        print("\n🔐 Secrets Generator for POS Cesariel")
        print("=" * 60)
        print("\nWhat would you like to generate?")
        print("\n1. Database Password")
        print("2. JWT Secret Key")
        print("3. All Secrets")
        print("4. Exit")
        print("\nNote: This script only GENERATES secrets.")
        print("You must manually copy them to your .env file.")
        print("=" * 60)
        
        try:
            choice = input("\nEnter choice (1-4): ").strip()
        except (KeyboardInterrupt, EOFError):
            print("\n\nAborted.")
            sys.exit(0)
        
        if choice == "1":
            args.db_password = True
        elif choice == "2":
            args.jwt_key = True
        elif choice == "3":
            args.all = True
        elif choice == "4":
            print("\nExiting.")
            sys.exit(0)
        else:
            print("\nInvalid choice. Exiting.")
            sys.exit(1)
    
    # Generate secrets based on options
    if args.all or args.db_password:
        db_password = generate_password(args.length)
        print_secret(
            "DB_PASSWORD",
            db_password,
            "Secure password for PostgreSQL database"
        )
    
    if args.all or args.jwt_key:
        jwt_key = generate_jwt_key()
        print_secret(
            "JWT_SECRET_KEY",
            jwt_key,
            "Secret key for JWT token signing (URL-safe)"
        )
    
    if args.all:
        # Generate additional secrets
        print_secret(
            "SENTRY_DSN",
            "https://[YOUR_KEY]@sentry.io/[PROJECT_ID]",
            "Sentry DSN for error tracking (get from sentry.io)"
        )
        
        print("\n" + "="*60)
        print("  Cloudinary Credentials")
        print("="*60)
        print("\nCloudinary credentials cannot be auto-generated.")
        print("Get them from: https://cloudinary.com/console")
        print("\nRequired:")
        print("  CLOUDINARY_CLOUD_NAME=your_cloud_name")
        print("  CLOUDINARY_API_KEY=your_api_key")
        print("  CLOUDINARY_API_SECRET=your_api_secret")
        print("="*60)
    
    # Final instructions
    print("\n\n" + "="*60)
    print("  IMPORTANT - NEXT STEPS")
    print("="*60)
    print("\n1. Copy the generated values to your .env file")
    print("2. NEVER commit .env to git")
    print("3. Use different secrets for production")
    print("4. Keep secrets secure and private")
    print("\n" + "="*60)
    print("\n✅ Generation complete!\n")


if __name__ == "__main__":
    main()
