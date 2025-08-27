"""
Utilidades de validación para POS Cesariel.

Este módulo contiene funciones de validación comunes utilizadas
en todo el sistema para asegurar la integridad de los datos.
"""

import re
from typing import Any, Optional
from decimal import Decimal


def validate_email(email: str) -> bool:
    """
    Valida si un email tiene el formato correcto.
    
    Args:
        email (str): Email a validar
        
    Returns:
        bool: True si el email es válido, False en caso contrario
    """
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def validate_phone_number(phone: str) -> bool:
    """
    Valida si un número de teléfono tiene el formato correcto.
    Acepta formatos: +54 11 1234-5678, 011 1234-5678, 11 1234-5678
    
    Args:
        phone (str): Número de teléfono a validar
        
    Returns:
        bool: True si el teléfono es válido, False en caso contrario
    """
    # Remover espacios, guiones y paréntesis para la validación
    clean_phone = re.sub(r'[\s\-\(\)]', '', phone)
    
    # Patrones aceptados
    patterns = [
        r'^\+54\d{10}$',  # +54 seguido de 10 dígitos
        r'^0\d{10}$',     # 0 seguido de 10 dígitos
        r'^\d{8,10}$'     # 8 a 10 dígitos
    ]
    
    return any(re.match(pattern, clean_phone) for pattern in patterns)


def validate_price(price: Any) -> bool:
    """
    Valida si un precio es válido (positivo y con máximo 2 decimales).
    
    Args:
        price: Precio a validar
        
    Returns:
        bool: True si el precio es válido, False en caso contrario
    """
    try:
        decimal_price = Decimal(str(price))
        return decimal_price >= 0 and decimal_price.as_tuple().exponent >= -2
    except (ValueError, TypeError, OverflowError):
        return False


def validate_barcode(barcode: str) -> bool:
    """
    Valida si un código de barras tiene el formato correcto.
    Acepta códigos EAN-13, UPC-A y códigos personalizados alfanuméricos.
    
    Args:
        barcode (str): Código de barras a validar
        
    Returns:
        bool: True si el código de barras es válido, False en caso contrario
    """
    if not barcode or not isinstance(barcode, str):
        return False
    
    # Remover espacios
    clean_barcode = barcode.strip()
    
    # EAN-13: 13 dígitos
    if len(clean_barcode) == 13 and clean_barcode.isdigit():
        return True
    
    # UPC-A: 12 dígitos
    if len(clean_barcode) == 12 and clean_barcode.isdigit():
        return True
    
    # Código personalizado: 6-20 caracteres alfanuméricos
    if 6 <= len(clean_barcode) <= 20 and clean_barcode.isalnum():
        return True
    
    return False


def validate_stock_quantity(quantity: Any) -> bool:
    """
    Valida si una cantidad de stock es válida (entero no negativo).
    
    Args:
        quantity: Cantidad a validar
        
    Returns:
        bool: True si la cantidad es válida, False en caso contrario
    """
    try:
        int_quantity = int(quantity)
        return int_quantity >= 0
    except (ValueError, TypeError):
        return False


def validate_percentage(percentage: Any) -> bool:
    """
    Valida si un porcentaje es válido (entre 0 y 100).
    
    Args:
        percentage: Porcentaje a validar
        
    Returns:
        bool: True si el porcentaje es válido, False en caso contrario
    """
    try:
        float_percentage = float(percentage)
        return 0 <= float_percentage <= 100
    except (ValueError, TypeError):
        return False


def validate_username(username: str) -> bool:
    """
    Valida si un nombre de usuario tiene el formato correcto.
    Debe tener entre 3 y 50 caracteres, solo letras, números y guiones bajos.
    
    Args:
        username (str): Nombre de usuario a validar
        
    Returns:
        bool: True si el username es válido, False en caso contrario
    """
    if not isinstance(username, str):
        return False
    
    pattern = r'^[a-zA-Z0-9_]{3,50}$'
    return re.match(pattern, username) is not None


def validate_password_strength(password: str) -> dict:
    """
    Valida la fortaleza de una contraseña y retorna detalles.
    
    Args:
        password (str): Contraseña a validar
        
    Returns:
        dict: Diccionario con información de validación
    """
    result = {
        'is_valid': False,
        'errors': [],
        'score': 0
    }
    
    if not isinstance(password, str):
        result['errors'].append('La contraseña debe ser un texto')
        return result
    
    # Verificar longitud mínima
    if len(password) < 6:
        result['errors'].append('La contraseña debe tener al menos 6 caracteres')
    else:
        result['score'] += 1
    
    # Verificar que tenga al menos una letra minúscula
    if not re.search(r'[a-z]', password):
        result['errors'].append('La contraseña debe contener al menos una letra minúscula')
    else:
        result['score'] += 1
    
    # Verificar que tenga al menos un número
    if not re.search(r'\d', password):
        result['errors'].append('La contraseña debe contener al menos un número')
    else:
        result['score'] += 1
    
    # Bonus por caracteres especiales
    if re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        result['score'] += 1
    
    # Bonus por mayúsculas
    if re.search(r'[A-Z]', password):
        result['score'] += 1
    
    # Bonus por longitud mayor a 8
    if len(password) >= 8:
        result['score'] += 1
    
    result['is_valid'] = len(result['errors']) == 0
    
    return result