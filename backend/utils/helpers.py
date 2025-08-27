"""
Funciones de ayuda generales para POS Cesariel.

Este módulo contiene funciones utilitarias que proporcionan
funcionalidad común a través del sistema.
"""

import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Union
from decimal import Decimal, ROUND_HALF_UP
import hashlib
import secrets
import string


def generate_uuid() -> str:
    """
    Genera un UUID4 único como string.
    
    Returns:
        str: UUID generado
    """
    return str(uuid.uuid4())


def generate_secure_random_string(length: int = 32) -> str:
    """
    Genera una cadena aleatoria segura para tokens y claves.
    
    Args:
        length (int): Longitud de la cadena a generar
        
    Returns:
        str: Cadena aleatoria segura
    """
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))


def format_currency(amount: Union[int, float, Decimal], currency: str = "$") -> str:
    """
    Formatea un monto como moneda con separadores de miles.
    
    Args:
        amount: Monto a formatear
        currency (str): Símbolo de la moneda
        
    Returns:
        str: Monto formateado como moneda
    """
    try:
        decimal_amount = Decimal(str(amount))
        # Redondear a 2 decimales
        rounded_amount = decimal_amount.quantize(
            Decimal('0.01'), 
            rounding=ROUND_HALF_UP
        )
        
        # Formatear con separadores de miles
        formatted = f"{rounded_amount:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')
        return f"{currency} {formatted}"
    except (ValueError, TypeError):
        return f"{currency} 0,00"


def calculate_percentage(part: Union[int, float], total: Union[int, float]) -> float:
    """
    Calcula el porcentaje que representa una parte del total.
    
    Args:
        part: Parte del total
        total: Total
        
    Returns:
        float: Porcentaje calculado
    """
    if total == 0:
        return 0.0
    
    try:
        return (float(part) / float(total)) * 100
    except (ValueError, TypeError, ZeroDivisionError):
        return 0.0


def apply_percentage(amount: Union[int, float, Decimal], percentage: Union[int, float]) -> Decimal:
    """
    Aplica un porcentaje a un monto y retorna el resultado.
    
    Args:
        amount: Monto base
        percentage: Porcentaje a aplicar
        
    Returns:
        Decimal: Monto con el porcentaje aplicado
    """
    try:
        decimal_amount = Decimal(str(amount))
        decimal_percentage = Decimal(str(percentage))
        
        multiplier = decimal_percentage / 100
        result = decimal_amount * multiplier
        
        return result.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    except (ValueError, TypeError):
        return Decimal('0.00')


def calculate_discount(original_price: Union[int, float, Decimal], 
                      discount_percentage: Union[int, float]) -> Dict[str, Decimal]:
    """
    Calcula el descuento y precio final basado en un porcentaje.
    
    Args:
        original_price: Precio original
        discount_percentage: Porcentaje de descuento
        
    Returns:
        Dict[str, Decimal]: Diccionario con precio_original, descuento, y precio_final
    """
    try:
        original = Decimal(str(original_price))
        discount = apply_percentage(original, discount_percentage)
        final_price = original - discount
        
        return {
            'precio_original': original.quantize(Decimal('0.01')),
            'descuento': discount.quantize(Decimal('0.01')),
            'precio_final': final_price.quantize(Decimal('0.01'))
        }
    except (ValueError, TypeError):
        return {
            'precio_original': Decimal('0.00'),
            'descuento': Decimal('0.00'),
            'precio_final': Decimal('0.00')
        }


def get_current_timestamp() -> datetime:
    """
    Obtiene el timestamp actual en UTC.
    
    Returns:
        datetime: Fecha y hora actual en UTC
    """
    return datetime.now(timezone.utc)


def generate_receipt_number() -> str:
    """
    Genera un número de recibo único.
    
    Returns:
        str: Número de recibo generado
    """
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    random_suffix = secrets.token_hex(3).upper()
    return f"RC{timestamp}{random_suffix}"


def generate_barcode() -> str:
    """
    Genera un código de barras único para productos internos.
    
    Returns:
        str: Código de barras generado (formato: 2YYYYMMDDHHMMSS)
    """
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    return f"2{timestamp}"


def hash_data(data: str) -> str:
    """
    Genera un hash SHA-256 de los datos proporcionados.
    
    Args:
        data (str): Datos a hashear
        
    Returns:
        str: Hash SHA-256 en formato hexadecimal
    """
    return hashlib.sha256(data.encode()).hexdigest()


def normalize_text(text: str) -> str:
    """
    Normaliza texto para búsquedas (minúsculas, sin espacios extra).
    
    Args:
        text (str): Texto a normalizar
        
    Returns:
        str: Texto normalizado
    """
    if not isinstance(text, str):
        return ""
    
    return ' '.join(text.lower().split())


def paginate_results(query_results: List[Any], page: int = 1, 
                    page_size: int = 20) -> Dict[str, Any]:
    """
    Pagina resultados de consulta.
    
    Args:
        query_results: Lista de resultados
        page (int): Número de página (empezando en 1)
        page_size (int): Tamaño de página
        
    Returns:
        Dict[str, Any]: Diccionario con resultados paginados y metadata
    """
    total_items = len(query_results)
    total_pages = (total_items + page_size - 1) // page_size
    
    start_index = (page - 1) * page_size
    end_index = start_index + page_size
    
    paginated_items = query_results[start_index:end_index]
    
    return {
        'items': paginated_items,
        'pagination': {
            'current_page': page,
            'page_size': page_size,
            'total_items': total_items,
            'total_pages': total_pages,
            'has_previous': page > 1,
            'has_next': page < total_pages
        }
    }


def sanitize_filename(filename: str) -> str:
    """
    Sanitiza un nombre de archivo removiendo caracteres no válidos.
    
    Args:
        filename (str): Nombre de archivo a sanitizar
        
    Returns:
        str: Nombre de archivo sanitizado
    """
    # Remover caracteres no válidos para nombres de archivo
    invalid_chars = '<>:"/\\|?*'
    sanitized = ''.join(c for c in filename if c not in invalid_chars)
    
    # Limitar longitud y remover espacios extra
    sanitized = ' '.join(sanitized.split())
    return sanitized[:255] if sanitized else 'archivo'