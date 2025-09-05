"""
Validadores de talles para productos del sistema POS Cesariel.

Este módulo define los talles válidos para cada tipo de producto y proporciona
funciones de validación para asegurar que solo se asignen talles apropiados
según la categoría del producto.
"""

from typing import List, Dict, Optional
from sqlalchemy.orm import Session

# Definición de talles válidos por tipo de categoría
VALID_SIZES_BY_CATEGORY = {
    "calzado": ["35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45"],
    "indumentaria": ["XS", "S", "M", "L", "XL", "XXL"],
    "accesorios": []  # Sin talles
}

# Mapeo de nombres de categorías a tipos
CATEGORY_NAME_TO_TYPE = {
    "calzado deportivo": "calzado",
    "calzado": "calzado",
    "indumentaria superior": "indumentaria", 
    "indumentaria inferior": "indumentaria",
    "indumentaria": "indumentaria",
    "ropa": "indumentaria",
    "accesorios deportivos": "accesorios",
    "accesorios": "accesorios"
}

def get_category_type(category_name: str) -> str:
    """
    Determina el tipo de categoría basado en el nombre.
    
    Args:
        category_name (str): Nombre de la categoría
        
    Returns:
        str: Tipo de categoría ('calzado', 'indumentaria', 'accesorios')
    """
    category_name_lower = category_name.lower()
    
    for name_pattern, category_type in CATEGORY_NAME_TO_TYPE.items():
        if name_pattern in category_name_lower:
            return category_type
    
    # Por defecto, si no coincide con ningún patrón
    return "indumentaria"

def get_valid_sizes_for_category(category_name: str) -> List[str]:
    """
    Obtiene los talles válidos para una categoría específica.
    
    Args:
        category_name (str): Nombre de la categoría
        
    Returns:
        List[str]: Lista de talles válidos para la categoría
    """
    category_type = get_category_type(category_name)
    return VALID_SIZES_BY_CATEGORY.get(category_type, [])

def get_valid_sizes_for_product(db: Session, product_id: int) -> List[str]:
    """
    Obtiene los talles válidos para un producto específico basado en su categoría.
    
    Args:
        db (Session): Sesión de base de datos
        product_id (int): ID del producto
        
    Returns:
        List[str]: Lista de talles válidos para el producto
    """
    from models import Product, Category
    
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product or not product.category:
        return []
    
    return get_valid_sizes_for_category(product.category.name)

def is_valid_size_for_category(size: str, category_name: str) -> bool:
    """
    Valida si un talle es válido para una categoría específica.
    
    Args:
        size (str): Talle a validar
        category_name (str): Nombre de la categoría
        
    Returns:
        bool: True si el talle es válido para la categoría
    """
    valid_sizes = get_valid_sizes_for_category(category_name)
    return size in valid_sizes

def is_valid_size_for_product(db: Session, size: str, product_id: int) -> bool:
    """
    Valida si un talle es válido para un producto específico.
    
    Args:
        db (Session): Sesión de base de datos
        size (str): Talle a validar
        product_id (int): ID del producto
        
    Returns:
        bool: True si el talle es válido para el producto
    """
    valid_sizes = get_valid_sizes_for_product(db, product_id)
    return size in valid_sizes

def validate_sizes_for_product(db: Session, sizes: List[str], product_id: int) -> Dict[str, List[str]]:
    """
    Valida una lista de talles para un producto y retorna los válidos e inválidos.
    
    Args:
        db (Session): Sesión de base de datos
        sizes (List[str]): Lista de talles a validar
        product_id (int): ID del producto
        
    Returns:
        Dict[str, List[str]]: Diccionario con 'valid' e 'invalid' talles
    """
    valid_sizes = get_valid_sizes_for_product(db, product_id)
    
    valid = [size for size in sizes if size in valid_sizes]
    invalid = [size for size in sizes if size not in valid_sizes]
    
    return {
        "valid": valid,
        "invalid": invalid
    }

def sort_sizes(sizes: List[str]) -> List[str]:
    """
    Ordena una lista de talles de forma lógica (números primero, luego letras).
    
    Args:
        sizes (List[str]): Lista de talles a ordenar
        
    Returns:
        List[str]: Lista de talles ordenada
    """
    numeric_sizes = []
    text_sizes = []
    
    for size in sizes:
        try:
            numeric_sizes.append((int(size), size))
        except ValueError:
            text_sizes.append(size)
    
    # Ordenar talles numéricos por número
    numeric_sizes.sort(key=lambda x: x[0])
    numeric_sorted = [size for _, size in numeric_sizes]
    
    # Ordenar talles de texto según el orden estándar
    size_order = ["XS", "S", "M", "L", "XL", "XXL"]
    text_sorted = sorted(text_sizes, key=lambda x: size_order.index(x) if x in size_order else 999)
    
    return numeric_sorted + text_sorted

def get_size_display_info(category_name: str) -> Dict[str, any]:
    """
    Obtiene información para mostrar talles en la interfaz según la categoría.
    
    Args:
        category_name (str): Nombre de la categoría
        
    Returns:
        Dict[str, any]: Información de display (tipo, talles válidos, orden)
    """
    category_type = get_category_type(category_name)
    valid_sizes = VALID_SIZES_BY_CATEGORY.get(category_type, [])
    
    return {
        "category_type": category_type,
        "valid_sizes": sort_sizes(valid_sizes),
        "has_sizes": len(valid_sizes) > 0,
        "size_type_label": {
            "calzado": "Número de calzado",
            "indumentaria": "Talle de indumentaria", 
            "accesorios": "Sin talles"
        }.get(category_type, "Talle")
    }